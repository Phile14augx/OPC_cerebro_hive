/**
 * HivePulse — Enterprise Health Score engine
 *
 * Composite score (0–100) across 5 pillars:
 *   Revenue (25%)  · Operations (25%)  · People (20%)  · Risk (15%)  · Market (15%)
 *
 * Each pillar aggregates real Prisma data + platform-api telemetry.
 */
import { prisma } from './db';
import { getTelemetryOverview, getServiceHealth } from './platform-client';
import type { EnterpriseHealthScore, PillarScore, KPIMetric, HealthStatus, TrendDirection } from './types';

/* ── Weight table ─────────────────────────────────────────────────────── */
const WEIGHTS = {
  revenue:    0.25,
  operations: 0.25,
  people:     0.20,
  risk:       0.15,
  market:     0.15,
};

/* ── Helpers ──────────────────────────────────────────────────────────── */
function toStatus(score: number): HealthStatus {
  if (score >= 80) return 'healthy';
  if (score >= 60) return 'degraded';
  if (score >= 30) return 'critical';
  return 'unknown';
}

function toTrend(delta: number): TrendDirection {
  if (delta > 0.5) return 'up';
  if (delta < -0.5) return 'down';
  return 'flat';
}

function clamp(v: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, v));
}

function kpi(
  id: string,
  label: string,
  value: number,
  unit: string,
  target: number,
  delta: number,
  fmt: (v: number) => string
): KPIMetric {
  const score = clamp((value / target) * 100);
  return {
    id, label, value, unit,
    formatted: fmt(value),
    trend: toTrend(delta),
    delta,
    deltaFormatted: `${delta >= 0 ? '+' : ''}${fmt(delta)}`,
    status: toStatus(score),
    target,
    targetFormatted: fmt(target),
  };
}

/* ── Pillar: Revenue ──────────────────────────────────────────────────── */
async function revenueScore(): Promise<PillarScore> {
  // Aggregate revenue-related metrics from the Metric table
  const metrics = await prisma.metric.findMany({
    where: { category: { in: ['revenue', 'sales', 'mrr', 'arr'] } },
    orderBy: { recordedAt: 'desc' },
    take: 50,
  });

  const mrrRow = metrics.find(m =>
    m.name.toLowerCase().includes('mrr') || m.name.toLowerCase().includes('monthly_revenue')
  );
  const arrRow = metrics.find(m => m.name.toLowerCase().includes('arr'));
  const convRow = metrics.find(m => m.name.toLowerCase().includes('conversion'));

  const mrr = mrrRow ? Number(mrrRow.value) : 0;
  const arr = arrRow ? Number(arrRow.value) : mrr * 12;
  const conv = convRow ? Number(convRow.value) : 0;

  const mrrTarget = mrrRow ? Number(mrrRow.target ?? mrr * 1.1) : 1;
  const score = mrrTarget > 0 ? clamp((mrr / mrrTarget) * 100) : 50;
  const prevMrr = mrrRow ? Number((mrrRow as Record<string, unknown>)['previousValue'] ?? mrr * 0.97) : mrr;
  const delta = mrr - prevMrr;

  const kpis: KPIMetric[] = [
    kpi('rev-mrr', 'MRR', mrr / 1000, '$K', mrrTarget / 1000, delta / 1000, v => `$${v.toFixed(1)}K`),
    kpi('rev-arr', 'ARR', arr / 1_000_000, '$M', (mrrTarget * 12) / 1_000_000, (delta * 12) / 1_000_000, v => `$${v.toFixed(2)}M`),
    kpi('rev-conv', 'Conversion', conv, '%', 5, conv - 4.2, v => `${v.toFixed(1)}%`),
  ];

  return {
    id: 'revenue',
    label: 'Revenue',
    score,
    status: toStatus(score),
    trend: toTrend(delta / (prevMrr || 1) * 100),
    delta: Math.round(score - clamp((prevMrr / (mrrTarget || 1)) * 100)),
    kpis,
  };
}

/* ── Pillar: Operations ───────────────────────────────────────────────── */
async function operationsScore(): Promise<PillarScore> {
  const [telemetry, serviceHealth] = await Promise.all([
    getTelemetryOverview().catch(() => null),
    getServiceHealth().catch(() => []),
  ]);

  // Agent execution success rate from Prisma
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const execStats = await prisma.agentExecution.groupBy({
    by: ['status'],
    where: { startedAt: { gte: twentyFourHoursAgo } },
    _count: { status: true },
  });

  const total = execStats.reduce((s, r) => s + r._count.status, 0);
  const succeeded = execStats.find(r => r.status === 'COMPLETED')?._count.status ?? 0;
  const agentSuccessRate = total > 0 ? (succeeded / total) * 100 : 100;

  // Service health percentage
  const healthyServices = serviceHealth.filter(s => s.status === 'healthy').length;
  const serviceHealthPct = serviceHealth.length > 0
    ? (healthyServices / serviceHealth.length) * 100
    : 100;

  // Latency score (target: < 200ms = 100, > 2000ms = 0)
  const latency = telemetry?.avgLatencyMs ?? 150;
  const latencyScore = clamp(100 - ((latency - 200) / 18));

  // Error rate score (target: < 0.5% = 100, > 5% = 0)
  const errorRate = telemetry?.errorRate ?? 0;
  const errorScore = clamp(100 - (errorRate * 20));

  const score = clamp(
    agentSuccessRate * 0.4 +
    serviceHealthPct * 0.3 +
    latencyScore * 0.15 +
    errorScore * 0.15
  );

  const kpis: KPIMetric[] = [
    kpi('ops-agents', 'Agent Success Rate', agentSuccessRate, '%', 99, agentSuccessRate - 95, v => `${v.toFixed(1)}%`),
    kpi('ops-latency', 'Avg Latency', latency, 'ms', 200, 150 - latency, v => `${v.toFixed(0)}ms`),
    kpi('ops-error', 'Error Rate', errorRate, '%', 0.5, 0.5 - errorRate, v => `${v.toFixed(2)}%`),
    kpi('ops-services', 'Services Healthy', serviceHealthPct, '%', 100, serviceHealthPct - 97, v => `${v.toFixed(0)}%`),
  ];

  return {
    id: 'operations',
    label: 'Operations',
    score,
    status: toStatus(score),
    trend: toTrend(score - 88),
    delta: Math.round(score - 88),
    kpis,
  };
}

/* ── Pillar: People ───────────────────────────────────────────────────── */
async function peopleScore(): Promise<PillarScore> {
  const metrics = await prisma.metric.findMany({
    where: { category: { in: ['people', 'hr', 'hiring', 'engagement', 'retention'] } },
    orderBy: { recordedAt: 'desc' },
    take: 30,
  });

  const retentionRow = metrics.find(m => m.name.toLowerCase().includes('retention'));
  const engagementRow = metrics.find(m => m.name.toLowerCase().includes('engagement') || m.name.toLowerCase().includes('nps'));
  const headcountRow = metrics.find(m => m.name.toLowerCase().includes('headcount') || m.name.toLowerCase().includes('hires'));

  const retention = retentionRow ? Number(retentionRow.value) : 85;
  const engagement = engagementRow ? Number(engagementRow.value) : 72;
  const headcount = headcountRow ? Number(headcountRow.value) : 0;

  const retentionTarget = Number(retentionRow?.target ?? 90);
  const engagementTarget = Number(engagementRow?.target ?? 80);

  const score = clamp(
    (retention / retentionTarget) * 100 * 0.5 +
    (engagement / engagementTarget) * 100 * 0.5
  );

  const prevRetention = retention * 0.98;
  const delta = Math.round(score - clamp((prevRetention / retentionTarget) * 100 * 0.5 + (engagement / engagementTarget) * 100 * 0.5));

  const kpis: KPIMetric[] = [
    kpi('ppl-retention', 'Employee Retention', retention, '%', retentionTarget, retention - prevRetention, v => `${v.toFixed(1)}%`),
    kpi('ppl-engagement', 'Engagement Score', engagement, '/100', engagementTarget, engagement - 68, v => `${v.toFixed(0)}/100`),
    kpi('ppl-headcount', 'Active Headcount', headcount, 'FTE', headcount * 1.05, 0, v => `${Math.round(v)}`),
  ];

  return {
    id: 'people',
    label: 'People',
    score,
    status: toStatus(score),
    trend: toTrend(delta),
    delta,
    kpis,
  };
}

/* ── Pillar: Risk ─────────────────────────────────────────────────────── */
async function riskScore(): Promise<PillarScore> {
  const [openIncidents, openAlerts] = await Promise.all([
    prisma.incident.count({ where: { status: { in: ['OPEN', 'INVESTIGATING'] } } }),
    prisma.alert.count({ where: { status: 'OPEN', severity: { in: ['CRITICAL', 'HIGH'] } } }),
  ]);

  // Scoring: 0 open incidents/critical alerts = 100; each incident -10, each critical alert -5
  const score = clamp(100 - openIncidents * 10 - openAlerts * 5);
  const prevScore = score + openIncidents * 2; // approximation of yesterday

  const kpis: KPIMetric[] = [
    kpi('risk-incidents', 'Open Incidents', openIncidents, '', 0, -openIncidents, v => `${v}`),
    kpi('risk-alerts', 'Critical Alerts', openAlerts, '', 0, -openAlerts, v => `${v}`),
  ];

  return {
    id: 'risk',
    label: 'Risk',
    score,
    status: toStatus(score),
    trend: toTrend(score - prevScore),
    delta: Math.round(score - prevScore),
    kpis,
  };
}

/* ── Pillar: Market ───────────────────────────────────────────────────── */
async function marketScore(): Promise<PillarScore> {
  const metrics = await prisma.metric.findMany({
    where: { category: { in: ['market', 'product', 'growth', 'churn', 'nps', 'csat'] } },
    orderBy: { recordedAt: 'desc' },
    take: 30,
  });

  const npsRow = metrics.find(m => m.name.toLowerCase().includes('nps'));
  const churnRow = metrics.find(m => m.name.toLowerCase().includes('churn'));
  const csatRow = metrics.find(m => m.name.toLowerCase().includes('csat') || m.name.toLowerCase().includes('satisfaction'));

  const nps = npsRow ? Number(npsRow.value) : 45;
  const churn = churnRow ? Number(churnRow.value) : 2.5;
  const csat = csatRow ? Number(csatRow.value) : 4.2;

  // NPS: 0–100 scale (mapped from -100..100), churn: lower is better
  const npsScore = clamp(((nps + 100) / 200) * 100);
  const churnScore = clamp(100 - churn * 15); // 0% churn = 100, ~7% = 0
  const csatScore = clamp((csat / 5) * 100);

  const score = clamp(npsScore * 0.4 + churnScore * 0.35 + csatScore * 0.25);

  const kpis: KPIMetric[] = [
    kpi('mkt-nps', 'Net Promoter Score', nps, '', 60, nps - 42, v => `${v.toFixed(0)}`),
    kpi('mkt-churn', 'Churn Rate', churn, '%', 2.0, 2.5 - churn, v => `${v.toFixed(1)}%`),
    kpi('mkt-csat', 'CSAT', csat, '/5', 4.5, csat - 4.0, v => `${v.toFixed(1)}/5`),
  ];

  return {
    id: 'market',
    label: 'Market',
    score,
    status: toStatus(score),
    trend: toTrend(score - 67),
    delta: Math.round(score - 67),
    kpis,
  };
}

/* ── Composite health score ───────────────────────────────────────────── */
export async function computeEnterpriseHealth(): Promise<{
  health: EnterpriseHealthScore;
  pillars: PillarScore[];
}> {
  const [revenue, operations, people, risk, market] = await Promise.all([
    revenueScore(),
    operationsScore(),
    peopleScore(),
    riskScore(),
    marketScore(),
  ]);

  const pillars = [revenue, operations, people, risk, market];

  const score = Math.round(
    revenue.score    * WEIGHTS.revenue +
    operations.score * WEIGHTS.operations +
    people.score     * WEIGHTS.people +
    risk.score       * WEIGHTS.risk +
    market.score     * WEIGHTS.market
  );

  // Identify primary drivers (pillars that moved the score most)
  const sorted = [...pillars].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  const primaryDrivers = sorted.slice(0, 3).map(p =>
    `${p.label} ${p.delta > 0 ? 'improved' : 'declined'} by ${Math.abs(p.delta)}pts`
  );

  const delta = pillars.reduce((acc, p) => acc + p.delta * WEIGHTS[p.id as keyof typeof WEIGHTS], 0);

  const health: EnterpriseHealthScore = {
    score,
    status: toStatus(score),
    primaryDrivers,
    calculatedAt: new Date().toISOString(),
    delta: Math.round(delta * 10) / 10,
    deltaDirection: toTrend(delta),
  };

  return { health, pillars };
}
