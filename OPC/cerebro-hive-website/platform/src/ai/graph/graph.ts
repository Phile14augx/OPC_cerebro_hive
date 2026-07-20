import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import { PlatformError } from "../../kernel/errors/errors.js";

/**
 * Cerebro Graph™ — a LangGraph-compatible stateful graph runtime: typed
 * state channels, named nodes, static + conditional edges, cycles (with a
 * step budget so cycles terminate), and per-step checkpointing so a run can
 * be inspected or resumed. This is deliberately a distinct primitive from
 * Flow's approval-gated business workflow DAG: Graph is the low-level agent
 * *reasoning* substrate (what LangGraph is to LangChain), Flow is the
 * higher-level business-process orchestrator built on top of it.
 */

export const START = "__start__";
export const END = "__end__";

export type NodeFn<S> = (state: S, ctx: RequestContext) => Promise<Partial<S>> | Partial<S>;
export type ConditionalRouter<S> = (state: S, ctx: RequestContext) => Promise<string> | string;

export interface GraphCheckpoint<S> { step: number; node: string; state: S; at: string }

export interface GraphRunResult<S> {
  runId: string; finalState: S; steps: number; visited: string[]; checkpoints: GraphCheckpoint<S>[]; status: "completed" | "max_steps_exceeded";
}

/** LangGraph-style StateGraph builder — call addNode/addEdge/addConditionalEdge/setEntryPoint, then compile(). */
export class StateGraph<S extends Record<string, unknown>> {
  private nodes = new Map<string, NodeFn<S>>();
  private edges = new Map<string, string>();
  private conditionalEdges = new Map<string, { router: ConditionalRouter<S>; pathMap: Record<string, string> }>();
  private entry?: string;

  addNode(name: string, fn: NodeFn<S>): this {
    if (name === START || name === END) throw PlatformError.validation(`node name "${name}" is reserved`);
    this.nodes.set(name, fn);
    return this;
  }

  addEdge(from: string, to: string): this {
    this.edges.set(from, to);
    return this;
  }

  addConditionalEdge(from: string, router: ConditionalRouter<S>, pathMap: Record<string, string>): this {
    this.conditionalEdges.set(from, { router, pathMap });
    return this;
  }

  setEntryPoint(name: string): this {
    this.entry = name;
    return this;
  }

  compile(opts?: { bus?: EventBus; maxSteps?: number }): CompiledGraph<S> {
    if (!this.entry) throw PlatformError.validation("graph has no entry point — call setEntryPoint()");
    for (const node of [this.entry, ...this.edges.keys(), ...this.edges.values(), ...this.conditionalEdges.keys()]) {
      if (node !== END && node !== START && !this.nodes.has(node)) throw PlatformError.validation(`edge references unknown node "${node}"`);
    }
    return new CompiledGraph(this.nodes, this.edges, this.conditionalEdges, this.entry, opts?.bus, opts?.maxSteps ?? 50);
  }
}

export class CompiledGraph<S extends Record<string, unknown>> {
  constructor(
    private readonly nodes: Map<string, NodeFn<S>>,
    private readonly edges: Map<string, string>,
    private readonly conditionalEdges: Map<string, { router: ConditionalRouter<S>; pathMap: Record<string, string> }>,
    private readonly entry: string,
    private readonly bus: EventBus | undefined,
    private readonly maxSteps: number,
  ) {}

  private async next(current: string, state: S, ctx: RequestContext): Promise<string> {
    const conditional = this.conditionalEdges.get(current);
    if (conditional) {
      const key = await conditional.router(state, ctx);
      const target = conditional.pathMap[key];
      if (!target) throw PlatformError.validation(`conditional router at "${current}" returned unmapped key "${key}"`);
      return target;
    }
    return this.edges.get(current) ?? END;
  }

  async invoke(initialState: S, ctx: RequestContext, opts?: { organizationId?: string; checkpoint?: boolean }): Promise<GraphRunResult<S>> {
    const runId = newId("graph");
    const org = opts?.organizationId ?? ctx.principal.organizationId;
    let state = { ...initialState };
    let current = this.entry;
    let step = 0;
    const visited: string[] = [];
    const checkpoints: GraphCheckpoint<S>[] = [];

    await this.bus?.publish(Subjects.graph.runStarted, { runId, entry: this.entry }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });

    while (current !== END && step < this.maxSteps) {
      const fn = this.nodes.get(current);
      if (!fn) throw PlatformError.notFound("graph_node", current);
      const update = await fn(state, ctx);
      state = { ...state, ...update };
      visited.push(current);
      step += 1;
      if (opts?.checkpoint !== false) checkpoints.push({ step, node: current, state: structuredClone(state), at: new Date().toISOString() });
      await this.bus?.publish(Subjects.graph.nodeExecuted, { runId, node: current, step }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
      current = await this.next(current, state, ctx);
    }

    const status: GraphRunResult<S>["status"] = current === END ? "completed" : "max_steps_exceeded";
    await this.bus?.publish(Subjects.graph.runCompleted, { runId, status, steps: step }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return { runId, finalState: state, steps: step, visited, checkpoints, status };
  }
}

/** Convenience constructor mirroring LangGraph's `new StateGraph(channels)` entry point. */
export function createStateGraph<S extends Record<string, unknown>>(): StateGraph<S> {
  return new StateGraph<S>();
}
