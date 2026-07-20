import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { XGateway } from "../../ai/x/gateway.js";
import { cosine, deterministicEmbedding } from "../../ai/x/mock-provider.js";

export interface EvalCase {
  id: string; input: string;
  expected?: { contains?: string[]; notContains?: string[]; equals?: string; minSimilarity?: number; reference?: string };
  /** Grounding: text the answer must be attributable to. */
  groundingSources?: string[];
}

export interface EvalCaseResult { caseId: string; ok: boolean; latencyMs: number; checks: { name: string; ok: boolean; detail?: string }[]; output: string }
export interface EvalRun {
  id: string; organizationId: string; suite: string; target: string;
  total: number; passed: number; failed: number; score: number;
  results: EvalCaseResult[]; baselineScore?: number; regression: boolean; createdAt: string;
}

export interface EvalRepository {
  insert(run: EvalRun): Promise<void>;
  latest(organizationId: string, suite: string, target: string): Promise<EvalRun | undefined>;
  list(organizationId: string, limit?: number): Promise<EvalRun[]>;
}

export class InMemoryEvalRepository implements EvalRepository {
  runs: EvalRun[] = [];
  async insert(run: EvalRun) { this.runs.push(structuredClone(run)); }
  async latest(org: string, suite: string, target: string) {
    return [...this.runs].reverse().find(r => r.organizationId === org && r.suite === suite && r.target === target);
  }
  async list(org: string, limit = 50) { return this.runs.filter(r => r.organizationId === org).slice(-limit).reverse(); }
}

export type EvalTargetFn = (input: string) => Promise<string>;

/**
 * Cerebro Eval™ — continuous evaluation: expectation checks, hallucination /
 * grounding analysis, latency, regression tracking against the previous run,
 * and a human-review payload for every failure.
 */
export class EvalService {
  constructor(
    private readonly repo: EvalRepository,
    private readonly bus: EventBus,
    private readonly x: XGateway,
  ) {}

  /** Grounding check: every claim-sentence should be near some source text. */
  groundingScore(output: string, sources: string[]): number {
    if (!sources.length) return 1;
    const sentences = output.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 12);
    if (!sentences.length) return 1;
    const sourceVecs = sources.map(s => deterministicEmbedding(s));
    let grounded = 0;
    for (const sentence of sentences) {
      const sv = deterministicEmbedding(sentence);
      const best = Math.max(...sourceVecs.map(v => cosine(sv, v)));
      if (best > 0.12) grounded++;
    }
    return grounded / sentences.length;
  }

  async runSuite(ctx: RequestContext, suite: string, target: string, cases: EvalCase[], fn: EvalTargetFn): Promise<EvalRun> {
    const results: EvalCaseResult[] = [];
    for (const c of cases) {
      const started = Date.now();
      let output = "";
      const checks: EvalCaseResult["checks"] = [];
      try { output = await fn(c.input); }
      catch (err) { checks.push({ name: "no-crash", ok: false, detail: String(err) }); }
      const latencyMs = Date.now() - started;
      if (!checks.length) checks.push({ name: "no-crash", ok: true });
      if (c.expected?.contains) for (const s of c.expected.contains) checks.push({ name: `contains:${s}`, ok: output.toLowerCase().includes(s.toLowerCase()) });
      if (c.expected?.notContains) for (const s of c.expected.notContains) checks.push({ name: `not-contains:${s}`, ok: !output.toLowerCase().includes(s.toLowerCase()) });
      if (c.expected?.equals !== undefined) checks.push({ name: "equals", ok: output.trim() === c.expected.equals.trim() });
      if (c.expected?.reference && c.expected.minSimilarity !== undefined) {
        const sim = cosine(deterministicEmbedding(output), deterministicEmbedding(c.expected.reference));
        checks.push({ name: "similarity", ok: sim >= c.expected.minSimilarity, detail: sim.toFixed(3) });
      }
      if (c.groundingSources?.length) {
        const g = this.groundingScore(output, c.groundingSources);
        checks.push({ name: "grounding", ok: g >= 0.5, detail: g.toFixed(2) });
      }
      checks.push({ name: "latency<10s", ok: latencyMs < 10_000, detail: `${latencyMs}ms` });
      results.push({ caseId: c.id, ok: checks.every(ch => ch.ok), latencyMs, checks, output: output.slice(0, 500) });
    }
    const passed = results.filter(r => r.ok).length;
    const score = cases.length ? passed / cases.length : 1;
    const baseline = await this.repo.latest(ctx.principal.organizationId, suite, target);
    const regression = !!baseline && score < baseline.score - 0.001;
    const run: EvalRun = {
      id: newId("evr"), organizationId: ctx.principal.organizationId, suite, target,
      total: cases.length, passed, failed: cases.length - passed, score: Number(score.toFixed(4)),
      results, baselineScore: baseline?.score, regression, createdAt: new Date().toISOString(),
    };
    await this.repo.insert(run);
    await this.bus.publish(Subjects.evaluation.completed, { runId: run.id, suite, target, score: run.score, regression }, { organizationId: run.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    if (regression) await this.bus.publish(Subjects.evaluation.regressionDetected, { runId: run.id, suite, target, score: run.score, baseline: baseline!.score }, { organizationId: run.organizationId, traceId: ctx.traceId });
    return run;
  }

  /** Model-vs-model comparison over a shared case set. */
  async compareProviders(ctx: RequestContext, cases: EvalCase[], providers: string[]): Promise<{ provider: string; score: number }[]> {
    const out: { provider: string; score: number }[] = [];
    for (const provider of providers) {
      const run = await this.runSuite(ctx, "provider-compare", provider, cases, async input => {
        const res = await this.x.complete(ctx.principal.organizationId, { messages: [{ role: "user", content: input }] }, { provider });
        return res.text;
      });
      out.push({ provider, score: run.score });
    }
    return out.sort((a, b) => b.score - a.score);
  }

  history(ctx: RequestContext, limit = 20): Promise<EvalRun[]> {
    return this.repo.list(ctx.principal.organizationId, limit);
  }
}
