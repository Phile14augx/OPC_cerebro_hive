import { createHash } from "node:crypto";
import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { FlowService, WorkflowDefinition } from "../flow/flow.js";
import { linearForecast } from "../hub/hub.js";

/** Deterministic seeded PRNG (mulberry32) so simulations are reproducible. */
export function seededRandom(seed: string): () => number {
  let a = parseInt(createHash("md5").update(seed).digest("hex").slice(0, 8), 16);
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SimulationRecord { id: string; organizationId: string; kind: string; scenario: Record<string, unknown>; result: Record<string, unknown>; createdAt: string }
export interface SimulationRepository { insert(s: SimulationRecord): Promise<void>; list(organizationId: string, limit?: number): Promise<SimulationRecord[]> }
export class InMemorySimulationRepository implements SimulationRepository {
  rows: SimulationRecord[] = [];
  async insert(s: SimulationRecord) { this.rows.push(structuredClone(s)); }
  async list(org: string, limit = 50) { return this.rows.filter(r => r.organizationId === org).slice(-limit).reverse(); }
}

/**
 * Cerebro Simulator™ — digital-twin style what-if analysis: workflow Monte
 * Carlo, multi-agent load simulation, scenario forecasting, stress testing.
 * Reproducible via seeded randomness; no external state is touched.
 */
export class SimulatorService {
  constructor(
    private readonly repo: SimulationRepository,
    private readonly bus: EventBus,
    private readonly flow: FlowService,
  ) {}

  /** Monte-Carlo a workflow definition: per-node failure rates + latencies → run distribution. */
  async simulateWorkflow(ctx: RequestContext, input: { definition: unknown; iterations?: number; failureRate?: number; seed?: string }): Promise<SimulationRecord> {
    const definition: WorkflowDefinition = this.flow.compile(input.definition);
    const iterations = Math.min(input.iterations ?? 500, 10_000);
    const failureRate = input.failureRate ?? 0.05;
    const rand = seededRandom(input.seed ?? "cerebro");
    let succeeded = 0; let compensated = 0;
    const durations: number[] = [];
    for (let i = 0; i < iterations; i++) {
      let duration = 0; let failed = false;
      for (const node of definition.nodes) {
        duration += 200 + rand() * (node.type === "agent" ? 3000 : node.type === "approval" ? 8000 : 800);
        if (rand() < failureRate) { failed = true; break; }
      }
      durations.push(duration);
      if (failed) compensated++; else succeeded++;
    }
    durations.sort((a, b) => a - b);
    const pct = (p: number) => Math.round(durations[Math.min(durations.length - 1, Math.floor(p * durations.length))] ?? 0);
    return this.save(ctx, "workflow", { nodes: definition.nodes.length, iterations, failureRate }, {
      successRate: Number((succeeded / iterations).toFixed(4)),
      compensationRate: Number((compensated / iterations).toFixed(4)),
      latencyMs: { p50: pct(0.5), p90: pct(0.9), p99: pct(0.99) },
    });
  }

  /** Agent-load simulation: queueing model of N agents × task arrival rate. */
  async simulateAgents(ctx: RequestContext, input: { agents: number; arrivalPerMin: number; serviceTimeSec: number; minutes?: number; seed?: string }): Promise<SimulationRecord> {
    const rand = seededRandom(input.seed ?? "mesh");
    const minutes = Math.min(input.minutes ?? 60, 24 * 60);
    let queue = 0; let served = 0; let dropped = 0; let queuePeak = 0;
    const capacityPerMin = (input.agents * 60) / Math.max(1, input.serviceTimeSec);
    for (let m = 0; m < minutes; m++) {
      const arrivals = Math.round(input.arrivalPerMin * (0.5 + rand()));
      queue += arrivals;
      const capacity = Math.round(capacityPerMin * (0.8 + rand() * 0.4));
      const processed = Math.min(queue, capacity);
      queue -= processed; served += processed;
      if (queue > 500) { dropped += queue - 500; queue = 500; }
      queuePeak = Math.max(queuePeak, queue);
    }
    return this.save(ctx, "agents", { ...input, minutes }, {
      served, dropped, queuePeak, backlogAtEnd: queue,
      utilization: Number(Math.min(1, input.arrivalPerMin / capacityPerMin).toFixed(3)),
      recommendation: input.arrivalPerMin > capacityPerMin ? `Add ${Math.ceil((input.arrivalPerMin - capacityPerMin) / (60 / input.serviceTimeSec))} agents to absorb arrival rate.` : "Capacity sufficient for the modeled load.",
    });
  }

  /** Scenario forecast: project a KPI series under growth deltas (what-if). */
  async simulateScenario(ctx: RequestContext, input: { series: number[]; horizon?: number; deltas?: { label: string; multiplier: number }[] }): Promise<SimulationRecord> {
    const horizon = Math.min(input.horizon ?? 6, 36);
    const base = linearForecast(input.series, horizon);
    const scenarios = (input.deltas ?? [{ label: "base", multiplier: 1 }]).map(d => ({
      label: d.label, projection: base.map(v => Number((v * d.multiplier).toFixed(4))),
    }));
    return this.save(ctx, "scenario", { points: input.series.length, horizon }, { baseline: base, scenarios });
  }

  /** Stress test: geometric load ramp against a modeled service capacity. */
  async stressTest(ctx: RequestContext, input: { startRps: number; factor?: number; steps?: number; capacityRps: number }): Promise<SimulationRecord> {
    const steps = Math.min(input.steps ?? 8, 20);
    const factor = input.factor ?? 2;
    const results: { rps: number; ok: boolean; errorRate: number }[] = [];
    let rps = input.startRps;
    let breakingPoint: number | undefined;
    for (let i = 0; i < steps; i++) {
      const over = Math.max(0, rps - input.capacityRps);
      const errorRate = Number(Math.min(1, over / Math.max(1, rps)).toFixed(3));
      const ok = errorRate < 0.05;
      results.push({ rps, ok, errorRate });
      if (!ok && breakingPoint === undefined) breakingPoint = rps;
      rps = Math.round(rps * factor);
    }
    return this.save(ctx, "stress", input as unknown as Record<string, unknown>, { results, breakingPoint: breakingPoint ?? null });
  }

  list(ctx: RequestContext, limit = 50): Promise<SimulationRecord[]> { return this.repo.list(ctx.principal.organizationId, limit); }

  private async save(ctx: RequestContext, kind: string, scenario: Record<string, unknown>, result: Record<string, unknown>): Promise<SimulationRecord> {
    const rec: SimulationRecord = { id: newId("sim"), organizationId: ctx.principal.organizationId, kind, scenario, result, createdAt: new Date().toISOString() };
    await this.repo.insert(rec);
    await this.bus.publish(Subjects.simulator.runCompleted, { simulationId: rec.id, kind }, { organizationId: rec.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return rec;
  }
}
