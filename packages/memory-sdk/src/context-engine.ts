// ============================================================
// memory-sdk/src/context-engine.ts
// ============================================================

import { ContextAssembly, MemoryRecord, ResourceBudgetSummary } from "./types";
import { MemoryManager } from "./memory-manager";

export interface AgentDefinition {
  name: string;
  role: string;
  goals: string[];
  systemPrompt: string;
  capabilities: string[];
}

export interface BudgetParams {
  tokenBudget: number;
  costBudgetUsd: number;
  tokensUsed: number;
  costUsed: number;
}

export interface ContextParams {
  agentDefinition: AgentDefinition;
  instanceId: string;
  missionId?: string;
  currentTask?: string;
  toolSchemas?: unknown[];
  budget: BudgetParams;
  recentEvents?: string[];
  maxTokens?: number;
  memoryManager?: MemoryManager;
  tenantId?: string;
  workspaceId?: string;
  currentState?: Record<string, unknown>;
  constraints?: string[];
  relevantMemories?: MemoryRecord[];
}

// ── Token estimation ────────────────────────────────────────────────────────

/**
 * Approximate token count using the ~4 chars-per-token heuristic.
 * More accurate for English prose; JSON and code may vary.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

function estimateAssemblyTokens(assembly: ContextAssembly): number {
  let total = 0;

  total += estimateTokens(assembly.systemPolicy);
  total += estimateTokens(assembly.agentIdentity);
  total += estimateTokens(assembly.role);

  if (assembly.missionContext) total += estimateTokens(assembly.missionContext);
  if (assembly.currentTask) total += estimateTokens(assembly.currentTask);

  for (const m of assembly.relevantMemories) {
    total += estimateTokens(m.content);
    total += estimateTokens(m.tags.join(" "));
  }

  if (assembly.toolSchemas) {
    total += estimateTokens(JSON.stringify(assembly.toolSchemas));
  }

  for (const c of assembly.constraints) {
    total += estimateTokens(c);
  }

  total += estimateTokens(JSON.stringify(assembly.currentState));
  total += estimateTokens(JSON.stringify(assembly.budget));
  total += estimateTokens(assembly.recentEvents.join("\n"));

  return total;
}

// ── ContextEngine ───────────────────────────────────────────────────────────

export class ContextEngine {
  private memoryManager: MemoryManager;

  constructor(memoryManager?: MemoryManager) {
    this.memoryManager = memoryManager ?? new MemoryManager();
  }

  /**
   * Assemble a complete context object ready for injection into an LLM prompt.
   */
  assembleContext(params: ContextParams): ContextAssembly {
    const maxTokens = params.maxTokens ?? 8000;
    const { agentDefinition, budget } = params;

    // ── Budget summary ──────────────────────────────────────────────────────
    const tokensRemaining = Math.max(0, budget.tokenBudget - budget.tokensUsed);
    const costRemaining = Math.max(
      0,
      budget.costBudgetUsd - budget.costUsed
    );
    const percentUsed =
      budget.tokenBudget > 0
        ? Math.min(100, (budget.tokensUsed / budget.tokenBudget) * 100)
        : 0;

    const budgetSummary: ResourceBudgetSummary = {
      remaining: {
        tokens: tokensRemaining,
        costUsd: costRemaining,
      },
      percentUsed,
    };

    // ── System policy block ─────────────────────────────────────────────────
    const systemPolicy = [
      "SYSTEM POLICY:",
      "- You are operating within the Cerebro Nexarch Agentic Operating System.",
      "- Respect all governance policies and budget constraints.",
      "- Never exceed your authorised permission level.",
      "- Request approval before taking irreversible high-impact actions.",
      "- Log all significant actions and their outcomes.",
    ].join("\n");

    // ── Agent identity block ────────────────────────────────────────────────
    const agentIdentity = [
      `AGENT: ${agentDefinition.name}`,
      `INSTANCE: ${params.instanceId}`,
      params.missionId ? `MISSION: ${params.missionId}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    // ── Role block ──────────────────────────────────────────────────────────
    const roleLines = [
      `ROLE: ${agentDefinition.role}`,
      "",
      agentDefinition.systemPrompt,
      "",
      "GOALS:",
      ...agentDefinition.goals.map((g, i) => `  ${i + 1}. ${g}`),
      "",
      "CAPABILITIES:",
      ...agentDefinition.capabilities.map((c) => `  - ${c}`),
    ];
    const role = roleLines.join("\n");

    // ── Relevant memories ───────────────────────────────────────────────────
    let relevantMemories: MemoryRecord[] = params.relevantMemories ?? [];

    if (relevantMemories.length === 0 && params.tenantId) {
      relevantMemories = this.memoryManager.retrieve({
        tenantId: params.tenantId,
        workspaceId: params.workspaceId,
        missionId: params.missionId,
        query: params.currentTask,
        topK: 10,
      });
    }

    // ── Constraints ─────────────────────────────────────────────────────────
    const constraints: string[] = [
      ...(params.constraints ?? []),
      `Token budget: ${tokensRemaining.toLocaleString()} tokens remaining (${percentUsed.toFixed(1)}% used)`,
      `Cost budget: $${costRemaining.toFixed(4)} USD remaining`,
    ];

    // ── Assemble ─────────────────────────────────────────────────────────────
    const assembly: ContextAssembly = {
      systemPolicy,
      agentIdentity,
      role,
      missionContext: params.missionId
        ? `Active mission: ${params.missionId}`
        : undefined,
      currentTask: params.currentTask,
      relevantMemories,
      currentState: params.currentState ?? {},
      toolSchemas: params.toolSchemas,
      constraints,
      budget: budgetSummary,
      recentEvents: params.recentEvents ?? [],
      estimatedTokens: 0, // computed below
    };

    assembly.estimatedTokens = estimateAssemblyTokens(assembly);

    // ── Trim to fit ─────────────────────────────────────────────────────────
    if (assembly.estimatedTokens > maxTokens) {
      return this.compressToFit(assembly, maxTokens);
    }

    return assembly;
  }

  /**
   * Estimate tokens for arbitrary text.
   */
  estimateTokens(text: string): number {
    return estimateTokens(text);
  }

  /**
   * Trim a context assembly to fit within maxTokens by progressively
   * removing the oldest/least-relevant memories and truncating recent events.
   */
  compressToFit(
    assembly: ContextAssembly,
    maxTokens: number
  ): ContextAssembly {
    let current = { ...assembly, relevantMemories: [...assembly.relevantMemories] };
    current.estimatedTokens = estimateAssemblyTokens(current);

    if (current.estimatedTokens <= maxTokens) return current;

    // Step 1: Trim recent events from the oldest end
    const events = [...current.recentEvents];
    while (current.estimatedTokens > maxTokens && events.length > 0) {
      events.shift();
      current = { ...current, recentEvents: events };
      current.estimatedTokens = estimateAssemblyTokens(current);
    }

    if (current.estimatedTokens <= maxTokens) return current;

    // Step 2: Drop memories starting from the lowest-confidence / oldest
    const memories = [...current.relevantMemories].sort(
      (a, b) =>
        a.confidence - b.confidence ||
        new Date(a.accessedAt).getTime() - new Date(b.accessedAt).getTime()
    );

    while (current.estimatedTokens > maxTokens && memories.length > 0) {
      memories.shift();
      current = { ...current, relevantMemories: memories };
      current.estimatedTokens = estimateAssemblyTokens(current);
    }

    if (current.estimatedTokens <= maxTokens) return current;

    // Step 3: Truncate tool schemas (keep the first half)
    if (current.toolSchemas && current.toolSchemas.length > 1) {
      const halfLen = Math.max(1, Math.floor(current.toolSchemas.length / 2));
      current = { ...current, toolSchemas: current.toolSchemas.slice(0, halfLen) };
      current.estimatedTokens = estimateAssemblyTokens(current);
    }

    // Recalculate final token estimate
    current.estimatedTokens = estimateAssemblyTokens(current);
    return current;
  }

  /**
   * Render the assembled context into system/context strings suitable for
   * sending to a chat-completion model.
   */
  formatForModel(assembly: ContextAssembly): { system: string; context: string } {
    // ── System prompt ─────────────────────────────────────────────────────
    const systemParts: string[] = [
      assembly.systemPolicy,
      "",
      assembly.agentIdentity,
      "",
      assembly.role,
    ];

    if (assembly.constraints.length > 0) {
      systemParts.push("", "CONSTRAINTS:");
      for (const c of assembly.constraints) {
        systemParts.push(`  - ${c}`);
      }
    }

    const system = systemParts.join("\n");

    // ── Contextual user turn ──────────────────────────────────────────────
    const contextParts: string[] = [];

    if (assembly.missionContext) {
      contextParts.push(`## Mission\n${assembly.missionContext}`);
    }

    if (assembly.currentTask) {
      contextParts.push(`## Current Task\n${assembly.currentTask}`);
    }

    if (assembly.relevantMemories.length > 0) {
      contextParts.push("## Relevant Memory");
      for (const m of assembly.relevantMemories) {
        const tierLabel = m.tier.replace("_", " ");
        const tagsStr =
          m.tags.length > 0 ? ` [${m.tags.join(", ")}]` : "";
        contextParts.push(
          `### ${tierLabel}${tagsStr}\nSource: ${m.source} | Confidence: ${m.confidence.toFixed(2)}\n${m.content}`
        );
      }
    }

    if (Object.keys(assembly.currentState).length > 0) {
      contextParts.push(
        `## Current State\n\`\`\`json\n${JSON.stringify(assembly.currentState, null, 2)}\n\`\`\``
      );
    }

    if (assembly.toolSchemas && assembly.toolSchemas.length > 0) {
      contextParts.push(
        `## Available Tools\n\`\`\`json\n${JSON.stringify(assembly.toolSchemas, null, 2)}\n\`\`\``
      );
    }

    // Budget summary
    contextParts.push(
      `## Budget\nTokens remaining: ${assembly.budget.remaining.tokens.toLocaleString()} | ` +
        `Cost remaining: $${assembly.budget.remaining.costUsd.toFixed(4)} | ` +
        `${assembly.budget.percentUsed.toFixed(1)}% used`
    );

    if (assembly.recentEvents.length > 0) {
      contextParts.push(
        `## Recent Events\n${assembly.recentEvents.map((e) => `- ${e}`).join("\n")}`
      );
    }

    contextParts.push(
      `\n_Estimated context size: ~${assembly.estimatedTokens.toLocaleString()} tokens_`
    );

    const context = contextParts.join("\n\n");

    return { system, context };
  }
}
