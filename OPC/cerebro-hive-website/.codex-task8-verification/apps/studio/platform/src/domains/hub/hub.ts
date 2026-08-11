import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { WorldModel } from "../../ai/world/world.js";
import type { RuntimeRepository } from "../runtime/runtime.js";
import type { KnowledgeRepository } from "../knowledge/knowledge.js";
import type { AiCallRepository } from "../../ai/x/types.js";
import type { XGateway } from "../../ai/x/gateway.js";
import { AnomalyDetector, HashedProjectionModel } from "../../ai/representation/representation.js";

export interface Insight { id: string; organizationId: string; kind: "trend" | "anomaly" | "recommendation" | "forecast" | "relationship"; title: string; body: string; confidence: number; source: string; createdAt: string }

export interface InsightRepository { insert(i: Insight): Promise<void>; list(organizationId: string, limit?: number): Promise<Insight[]> }
export class InMemoryInsightRepository implements InsightRepository {
  rows: Insight[] = [];
  async insert(i: Insight) { this.rows.push(structuredClone(i)); }
  async list(org: string, limit = 50) { return this.rows.filter(r => r.organizationId === org).slice(-limit).reverse(); }
}

/** Simple linear regression forecast over a numeric series. */
export function linearForecast(series: number[], horizon: number): number[] {
  const n = series.length;
  if (n === 0) return new Array(horizon).fill(0);
  if (n === 1) return new Array(horizon).fill(series[0]!);
  const xMean = (n - 1) / 2;
  const yMean = series.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (i - xMean) * (series[i]! - yMean); den += (i - xMean) ** 2; }
  const slope = den ? num / den : 0;
  const intercept = yMean - slope * xMean;
  return Array.from({ length: horizon }, (_, h) => Number((intercept + slope * (n + h)).toFixed(4)));
}

/**
 * Cerebro Intelligence Hub™ — cross-product analytics, insight generation,
 * recommendations, forecasting, anomaly + relationship discovery over the
 * world model and domain repositories.
 */
export class IntelligenceHub {
  private anomaly = new AnomalyDetector(new HashedProjectionModel());

  constructor(
    private readonly repo: InsightRepository,
    private readonly bus: EventBus,
    private readonly world: WorldModel,
    private readonly runtimeRepo: RuntimeRepository,
    private readonly knowledgeRepo: KnowledgeRepository,
    private readonly aiCalls: AiCallRepository,
    private readonly x: XGateway,
  ) {}

  async analytics(ctx: RequestContext) {
    const org = ctx.principal.organizationId;
    const [executions, docs, usage, worldCounts] = await Promise.all([
      this.runtimeRepo.list(org, { limit: 500 }),
      this.knowledgeRepo.listDocuments(org, 500),
      this.aiCalls.usage(org),
      this.world.snapshot(org),
    ]);
    const completed = executions.filter(e => e.status === "completed");
    const durations = completed.filter(e => e.startedAt && e.finishedAt).map(e => new Date(e.finishedAt!).getTime() - new Date(e.startedAt!).getTime());
    return {
      executions: { total: executions.length, completed: completed.length, failed: executions.filter(e => e.status === "failed").length, avgDurationMs: durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0 },
      knowledge: { documents: docs.length, indexed: docs.filter(d => d.status === "indexed").length },
      ai: usage,
      world: worldCounts,
    };
  }

  /** Generate insights: trends, anomalies (representation drift), recommendations. */
  async generateInsights(ctx: RequestContext): Promise<Insight[]> {
    const org = ctx.principal.organizationId;
    const insights: Insight[] = [];
    const analytics = await this.analytics(ctx);

    if (analytics.executions.total >= 3) {
      const failRate = analytics.executions.failed / analytics.executions.total;
      if (failRate > 0.3) insights.push(this.mk(org, "anomaly", "High execution failure rate", `${(failRate * 100).toFixed(0)}% of recent executions failed — inspect Observatory traces and Guard blocks.`, 0.85));
      else insights.push(this.mk(org, "trend", "Runtime healthy", `${analytics.executions.completed}/${analytics.executions.total} executions completed; average ${analytics.executions.avgDurationMs}ms.`, 0.7));
    }
    if (analytics.knowledge.documents === 0) {
      insights.push(this.mk(org, "recommendation", "Knowledge fabric is empty", "Ingest core documents (playbooks, product sheets, policies) so agents can ground answers with citations.", 0.9));
    } else if (analytics.executions.total > 0) {
      insights.push(this.mk(org, "recommendation", "Wire knowledge into runs", `You have ${analytics.knowledge.documents} documents indexed; route agent steps through knowledge.search for grounded outputs.`, 0.65));
    }
    // Execution-goal drift anomaly via the representation layer
    const goals = (await this.runtimeRepo.list(org, { limit: 20 })).map(e => e.goal).reverse();
    if (goals.length >= 4) {
      const report = this.anomaly.assess(goals.slice(0, -1), goals[goals.length - 1]!);
      if (report.anomalous) insights.push(this.mk(org, "anomaly", "Workload drift detected", `Latest execution goal diverges from the recent trajectory (similarity ${report.expectedSimilarity.toFixed(2)}). Verify it's intentional.`, 0.6));
    }
    const costSeries = [analytics.ai.promptTokens, analytics.ai.completionTokens];
    const forecast = linearForecast(costSeries, 1)[0] ?? 0;
    insights.push(this.mk(org, "forecast", "Token usage forecast", `Projected next-period token volume ≈ ${Math.max(0, Math.round(forecast))} based on current usage (${analytics.ai.promptTokens}+${analytics.ai.completionTokens}).`, 0.5));

    for (const i of insights) {
      await this.repo.insert(i);
      await this.bus.publish(Subjects.hub.insightGenerated, { insightId: i.id, kind: i.kind, title: i.title }, { organizationId: org, traceId: ctx.traceId });
    }
    return insights;
  }

  /** Relationship discovery across the knowledge graph + world model. */
  async discoverRelationships(ctx: RequestContext): Promise<Insight[]> {
    const org = ctx.principal.organizationId;
    const entities = await this.knowledgeRepo.entitiesByOrg(org);
    const out: Insight[] = [];
    const byKind = new Map<string, number>();
    for (const e of entities) byKind.set(e.kind, (byKind.get(e.kind) ?? 0) + 1);
    for (const e of entities.filter(e => e.kind !== "document").slice(0, 5)) {
      const rels = await this.knowledgeRepo.relationshipsByEntity(e.id);
      if (rels.length >= 2) {
        out.push(this.mk(org, "relationship", `Hub entity: ${e.name}`, `${e.name} (${e.kind}) appears across ${rels.length} document relationships — a likely organizational pivot point.`, Math.min(0.9, 0.4 + rels.length * 0.1)));
      }
    }
    for (const i of out) await this.repo.insert(i);
    return out;
  }

  async ask(ctx: RequestContext, question: string): Promise<string> {
    const analytics = await this.analytics(ctx);
    const res = await this.x.complete(ctx.principal.organizationId, {
      messages: [
        { role: "system", content: "You are the Intelligence Hub. Answer using ONLY the analytics JSON provided." },
        { role: "user", content: `Analytics: ${JSON.stringify(analytics)}\n\nQuestion: ${question}` },
      ],
      metadata: { purpose: "hub:ask" },
    }, { traceId: ctx.traceId });
    return res.text;
  }

  list(ctx: RequestContext, limit = 50): Promise<Insight[]> { return this.repo.list(ctx.principal.organizationId, limit); }

  private mk(org: string, kind: Insight["kind"], title: string, body: string, confidence: number): Insight {
    return { id: newId("ins"), organizationId: org, kind, title, body, confidence, source: "hub", createdAt: new Date().toISOString() };
  }
}
