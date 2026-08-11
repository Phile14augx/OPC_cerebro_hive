import type { RequestContext } from "../../kernel/context/context.js";
import type { MemoryFabric } from "../memory/memory.js";
import type { KnowledgeFabric } from "../knowledge/knowledge.js";
import type { WorldModel } from "../../ai/world/world.js";
import { estimateTokens } from "../../ai/x/types.js";

export interface ContextSection { source: string; title: string; content: string; tokens: number; priority: number }
export interface ContextBundle { sections: ContextSection[]; totalTokens: number; budget: number; assembledAt: string }

export interface ContextAssembler {
  source: string;
  priority: number;
  assemble(ctx: RequestContext, task: string): Promise<ContextSection | undefined>;
}

/** Built-in assemblers over platform state; Connect-backed CRM/ERP assemblers plug in the same way. */
export function builtinAssemblers(memory: MemoryFabric, knowledge: KnowledgeFabric, world: WorldModel): ContextAssembler[] {
  return [
    {
      source: "conversation", priority: 90,
      async assemble(ctx, task) {
        const hits = await memory.retrieve(ctx, { query: task, tier: "conversation", limit: 4 });
        if (!hits.length) return undefined;
        const content = hits.map(h => `- ${h.content.slice(0, 200)}`).join("\n");
        return { source: "conversation", title: "Recent conversation", content, tokens: estimateTokens(content), priority: 90 };
      },
    },
    {
      source: "workspace", priority: 80,
      async assemble(ctx, task) {
        const hits = await memory.retrieve(ctx, { query: task, tier: "workspace", limit: 3 });
        if (!hits.length) return undefined;
        const content = hits.map(h => `- ${h.content.slice(0, 200)}`).join("\n");
        return { source: "workspace", title: "Workspace memory", content, tokens: estimateTokens(content), priority: 80 };
      },
    },
    {
      source: "documents", priority: 85,
      async assemble(ctx, task) {
        const res = await knowledge.search(ctx, task, { limit: 3 });
        if (!res.hits.length) return undefined;
        const content = res.hits.map((h, i) => `[${i + 1}] ${h.documentTitle}: ${h.text.slice(0, 220)}`).join("\n");
        return { source: "documents", title: "Knowledge fabric", content, tokens: estimateTokens(content), priority: 85 };
      },
    },
    {
      source: "episodic", priority: 70,
      async assemble(ctx, task) {
        const hits = await memory.retrieve(ctx, { query: task, tier: "episodic", limit: 3 });
        if (!hits.length) return undefined;
        const content = hits.map(h => `- ${h.content.slice(0, 180)}`).join("\n");
        return { source: "episodic", title: "Prior executions", content, tokens: estimateTokens(content), priority: 70 };
      },
    },
    {
      source: "world", priority: 60,
      async assemble(ctx, task) {
        const entities = await world.semanticQuery(ctx.principal.organizationId, task, { limit: 4 });
        const relevant = entities.filter(e => e.score > 0.05);
        if (!relevant.length) return undefined;
        const content = relevant.map(e => `- ${e.kind}:${e.name} state=${JSON.stringify(e.state).slice(0, 120)}`).join("\n");
        return { source: "world", title: "World model state", content, tokens: estimateTokens(content), priority: 60 };
      },
    },
    {
      source: "user", priority: 50,
      async assemble(ctx) {
        const content = `Principal: user=${ctx.principal.userId} roles=${ctx.principal.roles.join(",")} workspace=${ctx.principal.workspaceId ?? "none"}`;
        return { source: "user", title: "User context", content, tokens: estimateTokens(content), priority: 50 };
      },
    },
    {
      source: "policy", priority: 95,
      async assemble() {
        const content = "Operate within organizational policy: no PII leakage, cite sources, log all side effects, escalate irreversible actions for approval.";
        return { source: "policy", title: "Policy context", content, tokens: estimateTokens(content), priority: 95 };
      },
    },
  ];
}

/**
 * Cerebro Context Engine™ — assembles budgeted, prioritized context bundles
 * before every AI call. Register additional assemblers (CRM, ERP, tickets…)
 * through the same interface.
 */
export class ContextEngine {
  private assemblers: ContextAssembler[] = [];
  register(assembler: ContextAssembler): void {
    this.assemblers.push(assembler);
    this.assemblers.sort((a, b) => b.priority - a.priority);
  }

  async assemble(ctx: RequestContext, task: string, budgetTokens = 1800): Promise<ContextBundle> {
    const sections: ContextSection[] = [];
    let total = 0;
    const results = await Promise.all(this.assemblers.map(async a => {
      try { return await a.assemble(ctx, task); } catch { return undefined; }
    }));
    for (const section of results.filter((s): s is ContextSection => !!s).sort((a, b) => b.priority - a.priority)) {
      if (total + section.tokens > budgetTokens) {
        const remaining = budgetTokens - total;
        if (remaining > 50) {
          const truncated = section.content.slice(0, remaining * 4);
          sections.push({ ...section, content: truncated, tokens: remaining });
          total = budgetTokens;
        }
        continue;
      }
      sections.push(section);
      total += section.tokens;
    }
    return { sections, totalTokens: total, budget: budgetTokens, assembledAt: new Date().toISOString() };
  }

  /** Render a bundle as a system-prompt block. */
  render(bundle: ContextBundle): string {
    return bundle.sections.map(s => `## ${s.title}\n${s.content}`).join("\n\n");
  }
}
