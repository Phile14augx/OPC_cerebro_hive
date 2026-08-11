import type { RequestContext } from "../../kernel/context/context.js";
import { evaluateExpression, extractExpression } from "../../kernel/util/arithmetic.js";
export { evaluateExpression } from "../../kernel/util/arithmetic.js";
import type { MemoryFabric } from "../memory/memory.js";
import type { KnowledgeFabric } from "../knowledge/knowledge.js";

export interface ToolResult { output: string; data?: unknown }
export interface Tool {
  name: string;
  description: string;
  invoke(ctx: RequestContext, input: string): Promise<ToolResult>;
}

export class CalculatorTool implements Tool {
  name = "calculator";
  description = "Evaluate arithmetic expressions (+ - * / ^ parentheses).";
  async invoke(_ctx: RequestContext, input: string): Promise<ToolResult> {
    const expr = extractExpression(input);
    if (!expr) return { output: "No computable expression found." };
    const value = evaluateExpression(expr.replace(/\^/g, "**"));
    return value === undefined
      ? { output: `Could not evaluate: ${expr}` }
      : { output: `${expr} = ${value}`, data: { expression: expr, value } };
  }
}

const CATALOG: Record<string, { price: number; tier: string }> = {
  "cerebro agentos": { price: 4800, tier: "platform" },
  "cerebro flow": { price: 1900, tier: "automation" },
  "cerebro guard": { price: 2400, tier: "security" },
  "cerebro memory fabric": { price: 2100, tier: "knowledge" },
  "cerebro knowledge fabric": { price: 2600, tier: "knowledge" },
  "hiveshield": { price: 3200, tier: "security" },
};

export class CatalogTool implements Tool {
  name = "catalog.lookup";
  description = "Look up CerebroHive product catalog entries (price, tier).";
  async invoke(_ctx: RequestContext, input: string): Promise<ToolResult> {
    const q = input.toLowerCase();
    const hit = Object.entries(CATALOG).find(([k]) => q.includes(k));
    if (!hit) return { output: `No catalog entry matched. Known: ${Object.keys(CATALOG).join(", ")}` };
    return { output: `${hit[0]} — $${hit[1].price}/mo (${hit[1].tier})`, data: { product: hit[0], ...hit[1] } };
  }
}

export class MemorySearchTool implements Tool {
  name = "memory.search";
  description = "Semantic search across the organization's memory fabric.";
  constructor(private readonly memory: MemoryFabric) {}
  async invoke(ctx: RequestContext, input: string): Promise<ToolResult> {
    const hits = await this.memory.retrieve(ctx, { query: input, limit: 4 });
    if (!hits.length) return { output: "No relevant memories." };
    return { output: hits.map(h => `(${h.tier}) ${h.content.slice(0, 160)}`).join("\n"), data: hits.map(h => ({ id: h.id, score: h.score })) };
  }
}

export class KnowledgeSearchTool implements Tool {
  name = "knowledge.search";
  description = "Hybrid search over the knowledge fabric with citations.";
  constructor(private readonly knowledge: KnowledgeFabric) {}
  async invoke(ctx: RequestContext, input: string): Promise<ToolResult> {
    const res = await this.knowledge.search(ctx, input, { limit: 4 });
    if (!res.hits.length) return { output: "No knowledge results." };
    return {
      output: res.hits.map((h, i) => `[${i + 1}] ${h.documentTitle}#${h.seq}: ${h.text.slice(0, 140)}`).join("\n"),
      data: { citations: res.citations, entities: res.entities },
    };
  }
}

export class ToolRegistry {
  private tools = new Map<string, Tool>();
  register(tool: Tool): void { this.tools.set(tool.name, tool); }
  get(name: string): Tool | undefined { return this.tools.get(name); }
  list(): { name: string; description: string }[] {
    return [...this.tools.values()].map(t => ({ name: t.name, description: t.description }));
  }
  /** Infer the best tool for a step description. */
  infer(description: string): Tool | undefined {
    const d = description.toLowerCase();
    if (/calculat|comput|math|\d+\s*[-+*/]\s*\d+/.test(d)) return this.get("calculator");
    if (/catalog|price|product/.test(d)) return this.get("catalog.lookup");
    if (/memor/.test(d)) return this.get("memory.search");
    if (/knowledge|document|search|retriev|lookup|research/.test(d)) return this.get("knowledge.search");
    return undefined;
  }
}
