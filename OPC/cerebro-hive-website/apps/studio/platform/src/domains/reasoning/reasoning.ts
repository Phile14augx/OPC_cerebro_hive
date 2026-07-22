import { newId } from "../../kernel/ids/id.js";
import type { XGateway } from "../../ai/x/gateway.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";

export type ReasoningStrategy =
  | "tool-augmented" | "planner-executor" | "tree-of-thoughts" | "react" | "chain-of-thought" | "graph-search";

export type ReasoningMode = "simple" | "complex" | "multi-agent" | "long-horizon" | "recursive" | "hierarchical";

export interface StrategyDecision { strategy: ReasoningStrategy; mode: ReasoningMode; rationale: string; confidence: number; signals: string[] }

/** Adaptive strategy selection from task signals (evolved from the site kernel). */
export function selectStrategy(goal: string): StrategyDecision {
  const signals: string[] = [];
  const hasMath = /\d+\s*[-+*/^]\s*\d+/.test(goal);
  const hasCompare = /\b(compare|versus|vs\.?|better|tradeoff|options)\b/i.test(goal);
  const hasLookup = /\b(find|lookup|search|what is|who is|price|catalog)\b/i.test(goal);
  const multiStep = /\b(then|after|steps|first|finally|and then|pipeline)\b/i.test(goal) || goal.split(/[.;]/).filter(s => s.trim()).length > 2;
  const longHorizon = goal.length > 400 || /\b(roadmap|quarter|migration|program)\b/i.test(goal);
  const multiAgent = /\b(team|delegate|agents?|negotiate|collaborate)\b/i.test(goal);

  if (hasMath) signals.push("computable-expression");
  if (hasCompare) signals.push("comparison");
  if (hasLookup) signals.push("retrieval");
  if (multiStep) signals.push("multi-step");
  if (longHorizon) signals.push("long-horizon");
  if (multiAgent) signals.push("multi-agent");

  let strategy: ReasoningStrategy = "chain-of-thought";
  let mode: ReasoningMode = "simple";
  let rationale = "Default linear reasoning for a direct request.";
  let confidence = 0.6;

  if (multiAgent) { strategy = "graph-search"; mode = "multi-agent"; rationale = "Task references collaboration across agents; reasoning over the mesh graph."; confidence = 0.8; }
  else if (hasMath) { strategy = "tool-augmented"; mode = "simple"; rationale = "Computable expression detected; route to deterministic tool."; confidence = 0.95; }
  else if (hasCompare) { strategy = "tree-of-thoughts"; mode = "complex"; rationale = "Comparison benefits from exploring parallel branches before committing."; confidence = 0.85; }
  else if (hasLookup) { strategy = "react"; mode = "simple"; rationale = "Retrieval task: interleave reasoning with lookups."; confidence = 0.85; }
  else if (multiStep || longHorizon) { strategy = "planner-executor"; mode = longHorizon ? "long-horizon" : "complex"; rationale = "Multi-step goal: plan first, then execute with verification."; confidence = 0.9; }

  if (longHorizon && strategy === "planner-executor") mode = "long-horizon";
  return { strategy, mode, rationale, confidence, signals };
}

export interface PlanStep { id: number; description: string; tool?: string; dependsOn?: number[] }
export interface Plan { id: string; goal: string; strategy: ReasoningStrategy; steps: PlanStep[]; createdAt: string }

/** Decompose a goal into an executable plan; LLM-assisted with deterministic fallback. */
export class Planner {
  constructor(private readonly x: XGateway, private readonly bus: EventBus) {}

  async plan(organizationId: string, goal: string, decision: StrategyDecision, traceId?: string): Promise<Plan> {
    let steps: PlanStep[] = [];
    try {
      const res = await this.x.complete(organizationId, {
        messages: [
          { role: "system", content: "You are a planning engine. Decompose the goal into 2-6 concrete steps. Respond ONLY with JSON: {\"steps\":[{\"id\":1,\"description\":\"...\",\"tool\":\"optional\"}]}" },
          { role: "user", content: `Goal: ${goal}\nStrategy: ${decision.strategy}\nPlan the steps.` },
        ],
        metadata: { purpose: "reasoning:plan" },
      }, { traceId });
      const parsed = JSON.parse(res.text) as { steps?: PlanStep[] };
      if (Array.isArray(parsed.steps) && parsed.steps.length) steps = parsed.steps.map((s, i) => ({ id: i + 1, description: String(s.description ?? `Step ${i + 1}`), tool: s.tool }));
    } catch { /* fall through to heuristic */ }
    if (!steps.length) steps = this.heuristicSteps(goal, decision);
    const plan: Plan = { id: newId("pln"), goal, strategy: decision.strategy, steps, createdAt: new Date().toISOString() };
    await this.bus.publish(Subjects.reasoning.planCreated, { planId: plan.id, goal, strategy: decision.strategy, steps: steps.length }, { organizationId, traceId });
    return plan;
  }

  private heuristicSteps(goal: string, decision: StrategyDecision): PlanStep[] {
    switch (decision.strategy) {
      case "tool-augmented": return [
        { id: 1, description: "Extract computable expression", tool: "calculator" },
        { id: 2, description: "Verify result and answer" },
      ];
      case "react": return [
        { id: 1, description: "Identify what to look up" },
        { id: 2, description: "Perform retrieval", tool: "knowledge.search" },
        { id: 3, description: "Synthesize grounded answer" },
      ];
      case "tree-of-thoughts": return [
        { id: 1, description: "Enumerate candidate options" },
        { id: 2, description: "Evaluate each branch against criteria" },
        { id: 3, description: "Select and justify best branch" },
      ];
      default: return [
        { id: 1, description: `Analyze goal: ${goal.slice(0, 100)}` },
        { id: 2, description: "Execute core task" },
        { id: 3, description: "Verify output against goal" },
      ];
    }
  }
}

export type ReasoningNodeKind = "goal" | "thought" | "action" | "observation" | "reflection" | "decision";
export interface ReasoningNode { id: string; kind: ReasoningNodeKind; content: string; at: string }
export interface ReasoningEdge { from: string; to: string; label?: string }

/** Explicit reasoning trace as a graph — inspectable, exportable, auditable. */
export class ReasoningGraph {
  nodes: ReasoningNode[] = [];
  edges: ReasoningEdge[] = [];
  private last?: string;
  add(kind: ReasoningNodeKind, content: string, linkFrom?: string): ReasoningNode {
    const node: ReasoningNode = { id: newId("rn"), kind, content, at: new Date().toISOString() };
    this.nodes.push(node);
    const from = linkFrom ?? this.last;
    if (from) this.edges.push({ from, to: node.id });
    this.last = node.id;
    return node;
  }
  toJSON() { return { nodes: this.nodes, edges: this.edges }; }
}

export interface Critique { ok: boolean; score: number; issues: string[]; suggestion?: string }

/** Critic + verifier: cheap deterministic checks, escalating to model review. */
export class Critic {
  constructor(private readonly x: XGateway) {}

  verify(goal: string, output: string): Critique {
    const issues: string[] = [];
    if (!output.trim()) issues.push("empty output");
    if (output.length < 8) issues.push("output too short to satisfy a goal");
    const goalTerms = goal.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 4);
    const hit = goalTerms.filter(t => output.toLowerCase().includes(t)).length;
    const coverage = goalTerms.length ? hit / goalTerms.length : 1;
    if (coverage < 0.15 && goalTerms.length >= 3 && !/\d/.test(output)) issues.push("output appears unrelated to goal terms");
    const score = Math.max(0, 1 - issues.length * 0.4) * (0.6 + 0.4 * Math.min(1, coverage * 2));
    return { ok: issues.length === 0, score: Number(score.toFixed(3)), issues };
  }

  async reflect(organizationId: string, goal: string, output: string, critique: Critique, traceId?: string): Promise<string> {
    const res = await this.x.complete(organizationId, {
      messages: [
        { role: "system", content: "You are a critic. Given a goal, an output, and detected issues, produce one concrete correction instruction." },
        { role: "user", content: `Goal: ${goal}\nOutput: ${output}\nIssues: ${critique.issues.join("; ") || "none"}` },
      ],
      metadata: { purpose: "reasoning:reflect" },
    }, { traceId });
    return res.text;
  }
}
