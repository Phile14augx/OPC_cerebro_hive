import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import { PlatformError } from "../../kernel/errors/errors.js";
import { seededRandom } from "../simulator/simulator.js";
import type { HiveForgeService } from "../hiveforge/hiveforge.js";
import type { CerebroStudioService } from "../cerebrostudio/cerebrostudio.js";
import type { CerebroSwarmService } from "../cerebroswarm/cerebroswarm.js";

/**
 * CerebroInsight™ — Phase 1 Analytics Foundation: an AI-native executive intelligence layer, not
 * another standalone BI tool. Rather than external ERP/CRM/warehouse connectors (which need real
 * credentials this platform doesn't have), Phase 1 consumes live data from CerebroHive's own
 * domains — HiveForge (cloud cost/resources), CerebroStudio (AI workspace/run activity),
 * CerebroSwarm (directives coordinated) — plus a small mock business dataset (revenue, documents
 * indexed, platform health) standing in for ERP/CRM until real connectors exist. A metric engine
 * makes every number reusable across dashboards; a simple alert engine flags threshold breaches;
 * and deterministic AI insight cards narrate the biggest movers, matching this platform's
 * governed-simulation convention (no real model calls) used across HiveForge/CerebroStudio/
 * CerebroSwarm.
 */

export type MetricSource = "hiveforge" | "cerebrostudio" | "cerebroswarm" | "mock";
export type MetricStatus = "healthy" | "warning" | "critical";
export type Trend = "up" | "down" | "flat";
export type WidgetType = "kpi" | "line" | "bar" | "pie" | "table";
export type AlertCondition = "gt" | "lt";
export type AlertSeverity = "warning" | "critical";

export interface Metric {
  key: string; organizationId: string; name: string; unit: string; source: MetricSource;
  value: number; target?: number; trend: Trend; status: MetricStatus; history: number[]; updatedAt: string;
}

export interface Widget { id: string; type: WidgetType; title: string; metricKeys: string[]; order: number }
export interface Dashboard { id: string; organizationId: string; name: string; widgets: Widget[]; createdAt: string }

export interface AlertRule { id: string; organizationId: string; metricKey: string; condition: AlertCondition; threshold: number; createdAt: string }
export interface Alert { id: string; organizationId: string; ruleId: string; metricKey: string; message: string; severity: AlertSeverity; createdAt: string }
export interface InsightCard { id: string; organizationId: string; metricKey: string; narrative: string; createdAt: string }

export interface CerebroInsightRepository {
  upsertMetric(m: Metric): Promise<void>;
  listMetrics(org: string): Promise<Metric[]>;
  getMetric(org: string, key: string): Promise<Metric | undefined>;

  insertDashboard(d: Dashboard): Promise<void>;
  listDashboards(org: string): Promise<Dashboard[]>;

  insertAlertRule(r: AlertRule): Promise<void>;
  listAlertRules(org: string): Promise<AlertRule[]>;

  insertAlert(a: Alert): Promise<void>;
  listAlerts(org: string): Promise<Alert[]>;

  replaceInsights(org: string, cards: InsightCard[]): Promise<void>;
  listInsights(org: string): Promise<InsightCard[]>;
}

export class InMemoryCerebroInsightRepository implements CerebroInsightRepository {
  metrics = new Map<string, Metric>(); // key: `${org}:${metricKey}`
  dashboards = new Map<string, Dashboard>();
  alertRules = new Map<string, AlertRule>();
  alerts = new Map<string, Alert>();
  insights = new Map<string, InsightCard[]>(); // key: org

  async upsertMetric(m: Metric) { this.metrics.set(`${m.organizationId}:${m.key}`, structuredClone(m)); }
  async listMetrics(org: string) { return [...this.metrics.values()].filter(m => m.organizationId === org).sort((a, b) => a.key.localeCompare(b.key)); }
  async getMetric(org: string, key: string) { const m = this.metrics.get(`${org}:${key}`); return m ? structuredClone(m) : undefined; }

  async insertDashboard(d: Dashboard) { this.dashboards.set(d.id, structuredClone(d)); }
  async listDashboards(org: string) { return [...this.dashboards.values()].filter(d => d.organizationId === org); }

  async insertAlertRule(r: AlertRule) { this.alertRules.set(r.id, structuredClone(r)); }
  async listAlertRules(org: string) { return [...this.alertRules.values()].filter(r => r.organizationId === org); }

  async insertAlert(a: Alert) { this.alerts.set(a.id, structuredClone(a)); }
  async listAlerts(org: string) { return [...this.alerts.values()].filter(a => a.organizationId === org).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }

  async replaceInsights(org: string, cards: InsightCard[]) { this.insights.set(org, structuredClone(cards)); }
  async listInsights(org: string) { return structuredClone(this.insights.get(org) ?? []); }
}

interface MetricDef { key: string; name: string; unit: string; source: MetricSource }
const METRIC_DEFS: MetricDef[] = [
  { key: "cloud-cost", name: "Cloud Cost", unit: "usd", source: "hiveforge" },
  { key: "active-resources", name: "Active Resources", unit: "count", source: "hiveforge" },
  { key: "ai-runs", name: "AI Agent Activity", unit: "count", source: "cerebrostudio" },
  { key: "workspaces", name: "AI Workspaces", unit: "count", source: "cerebrostudio" },
  { key: "directives", name: "Directives Coordinated", unit: "count", source: "cerebroswarm" },
  { key: "revenue", name: "Revenue (Mock)", unit: "usd", source: "mock" },
  { key: "documents-indexed", name: "Documents Indexed", unit: "count", source: "mock" },
  { key: "platform-health", name: "Platform Health", unit: "score", source: "mock" },
];

const DEFAULT_ALERT_RULES: { metricKey: string; condition: AlertCondition; threshold: number }[] = [
  { metricKey: "cloud-cost", condition: "gt", threshold: 25 },
  { metricKey: "platform-health", condition: "lt", threshold: 70 },
];

function trendOf(prev: number | undefined, next: number): Trend {
  if (prev === undefined) return "flat";
  const delta = next - prev;
  if (Math.abs(delta) < Math.max(0.01, Math.abs(prev) * 0.005)) return "flat";
  return delta > 0 ? "up" : "down";
}

const INSIGHT_TEMPLATES: Record<Trend, string[]> = {
  up: [
    "{name} rose {pct}% — worth a quick look at what's driving the increase.",
    "{name} is trending up ({pct}%), consistent with recent activity across the platform.",
  ],
  down: [
    "{name} declined {pct}% — flagging for review before it compounds next period.",
    "{name} dropped {pct}%, likely tied to lower activity in the underlying workspace(s).",
  ],
  flat: [
    "{name} is holding steady, no significant movement this period.",
  ],
};

export class CerebroInsightService {
  constructor(
    private readonly repo: CerebroInsightRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
    private readonly hiveForge: HiveForgeService,
    private readonly cerebroStudio: CerebroStudioService,
    private readonly cerebroSwarm: CerebroSwarmService,
  ) {}

  private async computeRawValues(ctx: RequestContext): Promise<Record<string, number>> {
    const org = ctx.principal.organizationId;
    const rand = seededRandom(`${org}:${new Date().toISOString().slice(0, 10)}`);

    const cost = await this.hiveForge.costExplorer(ctx);
    const workspaces = await this.cerebroStudio.listWorkspaces(ctx);
    let totalRuns = 0;
    for (const ws of workspaces) totalRuns += (await this.cerebroStudio.listRuns(ctx, ws.id)).length;
    const directives = await this.cerebroSwarm.listDirectives(ctx);

    const revenue = 1_000_000 + Math.floor(rand() * 500_000);
    const documentsIndexed = 4_000 + Math.floor(rand() * 3_000);
    const platformHealth = Math.max(40, Math.min(100, Math.round(100 - cost.resourceCount * 0.4 - Math.floor(rand() * 15))));

    return {
      "cloud-cost": Number(cost.totalUsd.toFixed(2)),
      "active-resources": cost.resourceCount,
      "ai-runs": totalRuns,
      "workspaces": workspaces.length,
      "directives": directives.length,
      "revenue": revenue,
      "documents-indexed": documentsIndexed,
      "platform-health": platformHealth,
    };
  }

  async refreshMetrics(ctx: RequestContext): Promise<Metric[]> {
    this.policy.assert(ctx.principal, "cerebroinsight:write", { kind: "metric", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const raw = await this.computeRawValues(ctx);
    const now = new Date().toISOString();

    const metrics: Metric[] = [];
    for (const def of METRIC_DEFS) {
      const existing = await this.repo.getMetric(org, def.key);
      const value = raw[def.key]!;
      const trend = trendOf(existing?.value, value);
      const history = [...(existing?.history ?? []), value].slice(-8);
      const metric: Metric = { key: def.key, organizationId: org, name: def.name, unit: def.unit, source: def.source, value, trend, status: "healthy", history, updatedAt: now };
      metrics.push(metric);
    }

    // Alert engine: seed defaults once, then evaluate every rule against the freshly computed metrics.
    let rules = await this.repo.listAlertRules(org);
    if (rules.length === 0) {
      for (const r of DEFAULT_ALERT_RULES) {
        const rule: AlertRule = { id: newId("rul"), organizationId: org, metricKey: r.metricKey, condition: r.condition, threshold: r.threshold, createdAt: now };
        await this.repo.insertAlertRule(rule);
      }
      rules = await this.repo.listAlertRules(org);
    }

    const breachedKeys = new Set<string>();
    for (const rule of rules) {
      const metric = metrics.find(m => m.key === rule.metricKey);
      if (!metric) continue;
      const breached = rule.condition === "gt" ? metric.value > rule.threshold : metric.value < rule.threshold;
      if (breached) {
        breachedKeys.add(metric.key);
        const alert: Alert = {
          id: newId("alt"), organizationId: org, ruleId: rule.id, metricKey: metric.key,
          message: `${metric.name} is ${rule.condition === "gt" ? "above" : "below"} threshold (${metric.value} vs ${rule.threshold})`,
          severity: rule.condition === "gt" && metric.value > rule.threshold * 1.5 ? "critical" : "warning",
          createdAt: now,
        };
        await this.repo.insertAlert(alert);
        await this.bus.publish(Subjects.cerebroinsight.alertTriggered, { alertId: alert.id, metricKey: metric.key, severity: alert.severity }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
      }
    }
    for (const metric of metrics) {
      metric.status = breachedKeys.has(metric.key) ? "critical" : "healthy";
      await this.repo.upsertMetric(metric);
    }

    // AI insight cards: narrate the biggest movers, deterministic per org + day.
    const rand = seededRandom(`${org}:insights:${now.slice(0, 10)}`);
    const movers = metrics
      .filter(m => m.history.length >= 2)
      .map(m => ({ metric: m, pct: m.history.at(-2) ? Math.abs(((m.history.at(-1)! - m.history.at(-2)!) / Math.max(m.history.at(-2)!, 1)) * 100) : 0 }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 3);
    const cards: InsightCard[] = movers.map(({ metric, pct }) => {
      const pool = INSIGHT_TEMPLATES[metric.trend];
      const template = pool[Math.floor(rand() * pool.length)]!;
      const narrative = template.replace("{name}", metric.name).replace("{pct}", pct.toFixed(1));
      return { id: newId("ins"), organizationId: org, metricKey: metric.key, narrative, createdAt: now };
    });
    await this.repo.replaceInsights(org, cards);

    await this.ensureDefaultDashboard(ctx);
    await this.bus.publish(Subjects.cerebroinsight.metricsRefreshed, { organizationId: org, metricCount: metrics.length }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return metrics;
  }

  listMetrics(ctx: RequestContext): Promise<Metric[]> {
    this.policy.assert(ctx.principal, "cerebroinsight:read", { kind: "metric", organizationId: ctx.principal.organizationId });
    return this.repo.listMetrics(ctx.principal.organizationId);
  }

  private async ensureDefaultDashboard(ctx: RequestContext): Promise<Dashboard> {
    const org = ctx.principal.organizationId;
    const existing = await this.repo.listDashboards(org);
    const found = existing.find(d => d.name === "Executive Overview");
    if (found) return found;
    const dashboard: Dashboard = {
      id: newId("dsh"), organizationId: org, name: "Executive Overview", createdAt: new Date().toISOString(),
      widgets: [
        ...METRIC_DEFS.map((d, i): Widget => ({ id: newId("wgt"), type: "kpi", title: d.name, metricKeys: [d.key], order: i })),
        { id: newId("wgt"), type: "bar", title: "Cloud Cost Trend", metricKeys: ["cloud-cost"], order: METRIC_DEFS.length },
        { id: newId("wgt"), type: "line", title: "Platform Activity", metricKeys: ["ai-runs", "directives"], order: METRIC_DEFS.length + 1 },
        { id: newId("wgt"), type: "pie", title: "Resource Mix", metricKeys: ["active-resources", "workspaces", "directives"], order: METRIC_DEFS.length + 2 },
        { id: newId("wgt"), type: "table", title: "All Metrics", metricKeys: METRIC_DEFS.map(d => d.key), order: METRIC_DEFS.length + 3 },
      ],
    };
    await this.repo.insertDashboard(dashboard);
    return dashboard;
  }

  async listDashboards(ctx: RequestContext): Promise<Dashboard[]> {
    this.policy.assert(ctx.principal, "cerebroinsight:read", { kind: "dashboard", organizationId: ctx.principal.organizationId });
    const existing = await this.repo.listDashboards(ctx.principal.organizationId);
    if (existing.length === 0) return [await this.ensureDefaultDashboard(ctx)];
    return existing;
  }

  async createDashboard(ctx: RequestContext, input: { name: string; widgets: { type: WidgetType; title: string; metricKeys: string[] }[] }): Promise<Dashboard> {
    this.policy.assert(ctx.principal, "cerebroinsight:write", { kind: "dashboard", organizationId: ctx.principal.organizationId });
    if (!input.name.trim()) throw PlatformError.validation("dashboard name is required");
    const dashboard: Dashboard = {
      id: newId("dsh"), organizationId: ctx.principal.organizationId, name: input.name, createdAt: new Date().toISOString(),
      widgets: input.widgets.map((w, i) => ({ id: newId("wgt"), type: w.type, title: w.title, metricKeys: w.metricKeys, order: i })),
    };
    await this.repo.insertDashboard(dashboard);
    return dashboard;
  }

  listAlerts(ctx: RequestContext): Promise<Alert[]> {
    this.policy.assert(ctx.principal, "cerebroinsight:read", { kind: "alert", organizationId: ctx.principal.organizationId });
    return this.repo.listAlerts(ctx.principal.organizationId);
  }

  listAlertRules(ctx: RequestContext): Promise<AlertRule[]> {
    this.policy.assert(ctx.principal, "cerebroinsight:read", { kind: "alert", organizationId: ctx.principal.organizationId });
    return this.repo.listAlertRules(ctx.principal.organizationId);
  }

  listInsights(ctx: RequestContext): Promise<InsightCard[]> {
    this.policy.assert(ctx.principal, "cerebroinsight:read", { kind: "insight", organizationId: ctx.principal.organizationId });
    return this.repo.listInsights(ctx.principal.organizationId);
  }
}
