import type { RequestContext } from "../../kernel/context/context.js";
import type { Telemetry, SpanData } from "../../kernel/telemetry/telemetry.js";
import type { AiCallRepository } from "../../ai/x/types.js";
import type { RuntimeRepository } from "../runtime/runtime.js";
import type { FlowRepository } from "../flow/flow.js";

export interface WorkflowGraphView { nodes: { id: string; name: string; type: string; status: "completed" | "pending" | "waiting" }[]; edges: { from: string; to: string }[] }

/**
 * Cerebro Observatory™ — traces, metrics, cost, usage, and workflow graph
 * views assembled from the telemetry layer and domain repositories.
 * OpenTelemetry-compatible span model; Prometheus-format metrics exposition.
 */
export class ObservatoryService {
  constructor(
    private readonly telemetry: Telemetry,
    private readonly aiCalls: AiCallRepository,
    private readonly runtimeRepo: RuntimeRepository,
    private readonly flowRepo: FlowRepository,
  ) {}

  metricsSnapshot() { return this.telemetry.metrics.snapshot(); }
  metricsPrometheus(): string { return this.telemetry.metrics.prometheus(); }

  traces(limit = 50): SpanData[] {
    const exporter = this.telemetry.tracer.inMemoryExporter;
    return exporter ? exporter.spans.slice(-limit).reverse() : [];
  }

  trace(traceId: string): SpanData[] {
    const exporter = this.telemetry.tracer.inMemoryExporter;
    return exporter ? exporter.byTrace(traceId) : [];
  }

  async cost(ctx: RequestContext): Promise<{ calls: number; costUsd: number; promptTokens: number; completionTokens: number }> {
    return this.aiCalls.usage(ctx.principal.organizationId);
  }

  async executionStats(ctx: RequestContext): Promise<{ total: number; byStatus: Record<string, number>; avgSteps: number }> {
    const executions = await this.runtimeRepo.list(ctx.principal.organizationId, { limit: 500 });
    const byStatus: Record<string, number> = {};
    let steps = 0;
    for (const e of executions) {
      byStatus[e.status] = (byStatus[e.status] ?? 0) + 1;
      steps += e.plan?.steps.length ?? 0;
    }
    return { total: executions.length, byStatus, avgSteps: executions.length ? Number((steps / executions.length).toFixed(2)) : 0 };
  }

  async workflowGraph(ctx: RequestContext, runId: string): Promise<WorkflowGraphView | undefined> {
    const run = await this.flowRepo.getRun(ctx.principal.organizationId, runId);
    if (!run) return undefined;
    const wf = await this.flowRepo.getWorkflow(ctx.principal.organizationId, run.workflowId);
    if (!wf) return undefined;
    const nodes = wf.definition.nodes.map(n => ({
      id: n.id, name: n.name, type: n.type,
      status: run.state.completed.includes(n.id) ? "completed" as const
        : run.state.pendingApproval?.nodeId === n.id ? "waiting" as const : "pending" as const,
    }));
    const edges = wf.definition.nodes.flatMap(n => n.next.map(t => ({ from: n.id, to: t })));
    return { nodes, edges };
  }

  async overview(ctx: RequestContext) {
    const [cost, execStats] = await Promise.all([this.cost(ctx), this.executionStats(ctx)]);
    const snapshot = this.metricsSnapshot();
    return {
      cost, executions: execStats,
      counters: snapshot.counters,
      latency: snapshot.histograms["x.latency_ms{provider=mock}"] ?? null,
      spans: this.traces(10).map(s => ({ traceId: s.traceId, name: s.name, durationMs: s.durationMs, status: s.status })),
    };
  }
}
