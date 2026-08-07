/**
 * CerebroSphere — Platform data aggregator
 * Pulls from Prisma (Agent, AgentExecution, Alert, Incident, Metric,
 * Workflow, WorkflowExecution, AIUsageRecord, Tenant) and assembles
 * the full DashboardData payload in one parallel sweep.
 */
import { prisma } from './db';
import type {
  DashboardData, PlatformHealth, AgentSummary, ProductHealth,
  KPI, UnifiedAlert, WorkflowActivity, FinOpsSnapshot, HealthStatus, AlertSeverity,
} from './types';

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function toStatus(s: string): HealthStatus {
  const m: Record<string, HealthStatus> = {
    HEALTHY: 'healthy', OK: 'healthy', UP: 'healthy',
    DEGRADED: 'degraded', WARNING: 'degraded', WARN: 'degraded',
    CRITICAL: 'critical', DOWN: 'critical', ERROR: 'critical',
    OFFLINE: 'offline', UNKNOWN: 'unknown',
  };
  return m[s?.toUpperCase()] ?? 'unknown';
}

function toSeverity(s: string): AlertSeverity {
  const m: Record<string, AlertSeverity> = {
    CRITICAL: 'critical', HIGH: 'high', WARNING: 'high', MEDIUM: 'medium',
    LOW: 'low', INFO: 'info', WARN: 'medium',
  };
  return m[s?.toUpperCase()] ?? 'info';
}

function isNew(d: Date) { return (Date.now() - d.getTime()) < 4 * 3_600_000; }

function clamp(v: number, lo = 0, hi = 100) { return Math.min(hi, Math.max(lo, v)); }

/* ── Platform health ─────────────────────────────────────────────────────── */
async function fetchPlatformHealth(): Promise<PlatformHealth> {
  const since24h = new Date(Date.now() - 86_400_000);

  const [execStats, checks, alertCounts] = await Promise.all([
    prisma.agentExecution.groupBy({
      by: ['status'],
      where: { startedAt: { gte: since24h } },
      _count: { status: true },
    }),
    prisma.healthCheck.findMany({
      orderBy: { checkedAt: 'desc' },
      take: 50,
    }),
    prisma.alert.count({ where: { status: 'OPEN', severity: { in: ['CRITICAL', 'HIGH'] } } }),
  ]);

  const totalExec = execStats.reduce((s, r) => s + r._count.status, 0);
  const succeeded = execStats.find(r => r.status === 'COMPLETED')?._count.status ?? 0;
  const failed    = execStats.find(r => r.status === 'FAILED')?._count.status ?? 0;
  const errorRate = totalExec > 0 ? failed / totalExec : 0;
  const execPerMin = totalExec / (24 * 60);

  const healthyChecks = checks.filter(c => c.status === 'HEALTHY' || c.status === 'OK').length;
  const uptimePct = checks.length > 0 ? (healthyChecks / checks.length) * 100 : 100;

  const latencies = checks.map(c => (c as Record<string, unknown>).latencyMs as number).filter(Boolean);
  const avgLatencyMs = latencies.length > 0
    ? latencies.reduce((a, b) => a + b, 0) / latencies.length
    : 150;

  const activeAgents = await prisma.agentExecution.count({
    where: { status: 'RUNNING', startedAt: { gte: new Date(Date.now() - 300_000) } },
  });

  // Cost burn: from AIUsageRecord last hour
  const hourAgo = new Date(Date.now() - 3_600_000);
  const usageLastHour = await prisma.aIUsageRecord.aggregate({
    where: { createdAt: { gte: hourAgo } },
    _sum: { cost: true },
  }).catch(() => ({ _sum: { cost: null } }));
  const costBurnRateHr = Number(usageLastHour._sum.cost ?? 0);

  const criticalAlerts = alertCounts;
  const overallStatus: HealthStatus =
    criticalAlerts > 3 ? 'critical'
    : criticalAlerts > 0 ? 'degraded'
    : uptimePct < 90 ? 'degraded'
    : 'healthy';

  return {
    overallStatus,
    uptimePct: clamp(uptimePct),
    activeAgents,
    executionsPerMin: Math.round(execPerMin * 10) / 10,
    avgLatencyMs: Math.round(avgLatencyMs),
    errorRate,
    costBurnRateHr,
    calculatedAt: new Date().toISOString(),
  };
}

/* ── Agent fleet ─────────────────────────────────────────────────────────── */
async function fetchAgents(): Promise<AgentSummary[]> {
  const agents = await prisma.agent.findMany({
    take: 30,
    orderBy: { updatedAt: 'desc' },
    include: {
      executions: {
        where: { startedAt: { gte: new Date(Date.now() - 86_400_000) } },
        select: { status: true, startedAt: true, completedAt: true },
      },
    },
  });

  return agents.map(a => {
    const execs = a.executions;
    const total = execs.length;
    const done  = execs.filter(e => e.status === 'COMPLETED').length;
    const running = execs.filter(e => e.status === 'RUNNING').length;
    const latencies = execs
      .filter(e => e.completedAt && e.startedAt)
      .map(e => e.completedAt!.getTime() - e.startedAt.getTime());
    const avgLatencyMs = latencies.length > 0
      ? latencies.reduce((s, v) => s + v, 0) / latencies.length
      : 0;

    return {
      id: a.id,
      name: a.name,
      type: (a as Record<string, unknown>).type as string ?? 'worker',
      status: running > 0 ? 'active' : total === 0 ? 'idle' : 'idle',
      successRate: total > 0 ? (done / total) * 100 : 100,
      executionsLast24h: total,
      avgLatencyMs: Math.round(avgLatencyMs),
      lastActiveAt: a.updatedAt.toISOString(),
    } satisfies AgentSummary;
  });
}

/* ── Product health grid ─────────────────────────────────────────────────── */
const AEOS_PRODUCTS: Omit<ProductHealth, 'status' | 'uptimePct' | 'activeUsers' | 'lastDeployedAt'>[] = [
  // Command & Control
  { id: 'cerebro-sphere',   name: 'CerebroSphere',   layer: 'command',      primaryAI: 'claude'  },
  { id: 'hive-command',     name: 'HiveCommand',     layer: 'command',      primaryAI: 'claude'  },
  // Business Apps
  { id: 'cerebro-copilot',  name: 'CerebroCopilot',  layer: 'business',     primaryAI: 'claude'  },
  { id: 'hive-sales',       name: 'HiveSales',       layer: 'business',     primaryAI: 'claude'  },
  { id: 'hive-marketing',   name: 'HiveMarketing',   layer: 'business',     primaryAI: 'claude'  },
  { id: 'hive-hr',          name: 'HiveHR',          layer: 'business',     primaryAI: 'claude'  },
  { id: 'hive-finance',     name: 'HiveFinance',     layer: 'business',     primaryAI: 'claude'  },
  { id: 'hive-legal',       name: 'HiveLegal',       layer: 'business',     primaryAI: 'claude'  },
  { id: 'hive-support',     name: 'HiveSupport',     layer: 'business',     primaryAI: 'codex'   },
  { id: 'hive-pulse',       name: 'HivePulse',       layer: 'command',      primaryAI: 'claude'  },
  // Intelligence
  { id: 'cerebro-insight',  name: 'CerebroInsight',  layer: 'intelligence', primaryAI: 'gemini'  },
  { id: 'hive-reason',      name: 'HiveReason',      layer: 'intelligence', primaryAI: 'claude'  },
  { id: 'hive-planner',     name: 'HivePlanner',     layer: 'intelligence', primaryAI: 'claude'  },
  { id: 'hive-risk',        name: 'HiveRisk',        layer: 'intelligence', primaryAI: 'claude'  },
  { id: 'hive-forecast',    name: 'HiveForecast',    layer: 'intelligence', primaryAI: 'gemini'  },
  { id: 'hive-analytics',   name: 'HiveAnalytics',   layer: 'intelligence', primaryAI: 'gemini'  },
  { id: 'hive-vision',      name: 'HiveVision',      layer: 'intelligence', primaryAI: 'gemini'  },
  // Agent Execution
  { id: 'cerebro-flow',     name: 'CerebroFlow',     layer: 'agent',        primaryAI: 'claude'  },
  { id: 'hive-agent',       name: 'HiveAgent',       layer: 'agent',        primaryAI: 'claude'  },
  { id: 'hive-workers',     name: 'HiveWorkers',     layer: 'agent',        primaryAI: 'codex'   },
  { id: 'hive-gateway',     name: 'HiveGateway',     layer: 'agent',        primaryAI: 'codex'   },
  { id: 'hive-memory',      name: 'HiveMemory',      layer: 'agent',        primaryAI: 'gemini'  },
  // Data & Knowledge
  { id: 'cerebro-archive',  name: 'CerebroArchive',  layer: 'data',         primaryAI: 'gemini'  },
  { id: 'hive-search',      name: 'HiveSearch',      layer: 'data',         primaryAI: 'gemini'  },
  { id: 'hive-data',        name: 'HiveData',        layer: 'data',         primaryAI: 'codex'   },
  { id: 'hive-graph',       name: 'HiveGraph',       layer: 'data',         primaryAI: 'gemini'  },
  // Infrastructure
  { id: 'cerebro-studio',   name: 'CerebroStudio',   layer: 'infra',        primaryAI: 'codex'   },
  { id: 'hive-ops',         name: 'HiveOps',         layer: 'infra',        primaryAI: 'codex'   },
  { id: 'hive-shield',      name: 'HiveShield',      layer: 'infra',        primaryAI: 'claude'  },
  { id: 'hive-identity',    name: 'HiveIdentity',    layer: 'infra',        primaryAI: 'codex'   },
  { id: 'hive-connect',     name: 'HiveConnect',     layer: 'infra',        primaryAI: 'codex'   },
  { id: 'hive-runtime',     name: 'HiveRuntime',     layer: 'infra',        primaryAI: 'codex'   },
  { id: 'hive-events',      name: 'HiveEvents',      layer: 'infra',        primaryAI: 'codex'   },
];

async function fetchProductGrid(): Promise<ProductHealth[]> {
  const checks = await prisma.healthCheck.findMany({
    orderBy: { checkedAt: 'desc' },
    take: 200,
  });

  // Build a map: service name → most recent check status
  const checkMap = new Map<string, string>();
  for (const c of checks) {
    const key = c.service?.toLowerCase() ?? '';
    if (!checkMap.has(key)) checkMap.set(key, c.status);
  }

  return AEOS_PRODUCTS.map(p => {
    const rawStatus = checkMap.get(p.id) ?? checkMap.get(p.name.toLowerCase()) ?? 'UNKNOWN';
    const status = toStatus(rawStatus);
    // Simulate uptime from status
    const uptimePct = status === 'healthy' ? 99.9
      : status === 'degraded' ? 95.0
      : status === 'critical' ? 80.0
      : 100.0;

    return { ...p, status, uptimePct, activeUsers: 0 };
  });
}

/* ── Business KPIs ───────────────────────────────────────────────────────── */
async function fetchKPIs(): Promise<KPI[]> {
  const metrics = await prisma.metric.findMany({
    where: { category: { notIn: ['briefing', 'scenario'] } },
    orderBy: { recordedAt: 'desc' },
    take: 100,
  });

  // Deduplicate by name (most recent wins)
  const seen = new Map<string, typeof metrics[0]>();
  for (const m of metrics) {
    if (!seen.has(m.name)) seen.set(m.name, m);
  }

  return Array.from(seen.values()).slice(0, 12).map(m => {
    const value = Number(m.value);
    const target = Number((m as Record<string, unknown>).target ?? value * 1.1);
    const prev   = Number((m as Record<string, unknown>).previousValue ?? value * 0.97);
    const delta  = value - prev;
    const unit   = m.unit ?? '';
    const formatted = unit === '$' ? `$${value.toLocaleString()}`
      : unit === '%' ? `${value.toFixed(1)}%`
      : value.toLocaleString();

    return {
      id: m.id,
      label: m.name,
      value,
      formatted,
      unit,
      trend: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
      delta,
      deltaFormatted: `${delta >= 0 ? '+' : ''}${formatted}`,
      category: (m.category as KPI['category']) ?? 'operations',
    } satisfies KPI;
  });
}

/* ── Alerts ──────────────────────────────────────────────────────────────── */
async function fetchAlerts(): Promise<UnifiedAlert[]> {
  const [alerts, incidents] = await Promise.all([
    prisma.alert.findMany({
      where: { status: { in: ['OPEN', 'ACKNOWLEDGED'] } },
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
      take: 30,
    }),
    prisma.incident.findMany({
      where: { status: { in: ['OPEN', 'INVESTIGATING'] } },
      orderBy: { createdAt: 'desc' },
      take: 15,
    }),
  ]);

  return [
    ...alerts.map(a => ({
      id: a.id,
      title: a.title,
      summary: a.message,
      severity: toSeverity(a.severity),
      source: a.source ?? 'HiveAlert',
      category: a.category ?? 'operations',
      raisedAt: a.createdAt.toISOString(),
      acknowledged: a.status === 'ACKNOWLEDGED',
      isNew: isNew(a.createdAt),
    }) satisfies UnifiedAlert),
    ...incidents.map(i => ({
      id: `incident-${i.id}`,
      title: `[Incident] ${i.title}`,
      summary: i.description,
      severity: toSeverity(i.severity),
      source: 'HiveIncident',
      category: (i as Record<string, unknown>).service as string ?? 'operations',
      raisedAt: i.createdAt.toISOString(),
      acknowledged: i.status !== 'OPEN',
      isNew: isNew(i.createdAt),
    }) satisfies UnifiedAlert),
  ].sort((a, b) => {
    const S: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
    return S[b.severity] - S[a.severity];
  });
}

/* ── Workflow activity ───────────────────────────────────────────────────── */
async function fetchWorkflows(): Promise<WorkflowActivity[]> {
  const runs = await prisma.workflowExecution.findMany({
    orderBy: { startedAt: 'desc' },
    take: 20,
    include: { workflow: { select: { name: true } } },
  }).catch(() => []);

  return runs.map(r => {
    const wf = r as Record<string, unknown>;
    const steps = (wf.stepsTotal as number) ?? 0;
    const done  = (wf.stepsCompleted as number) ?? 0;
    const durMs = r.completedAt
      ? r.completedAt.getTime() - r.startedAt.getTime()
      : undefined;

    return {
      id: r.id,
      name: (r.workflow as { name: string })?.name ?? 'Workflow',
      status: r.status === 'RUNNING' ? 'running'
            : r.status === 'COMPLETED' ? 'completed'
            : r.status === 'FAILED' ? 'failed'
            : 'paused',
      triggeredBy: (wf.triggeredBy as string) ?? 'system',
      startedAt: r.startedAt.toISOString(),
      durationMs: durMs,
      stepsTotal: steps,
      stepsCompleted: done,
    } satisfies WorkflowActivity;
  });
}

/* ── FinOps ──────────────────────────────────────────────────────────────── */
async function fetchFinOps(): Promise<FinOpsSnapshot> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [today, mtd, byAgent] = await Promise.all([
    prisma.aIUsageRecord.aggregate({ where: { createdAt: { gte: todayStart } }, _sum: { cost: true } }).catch(() => ({ _sum: { cost: null } })),
    prisma.aIUsageRecord.aggregate({ where: { createdAt: { gte: monthStart } }, _sum: { cost: true } }).catch(() => ({ _sum: { cost: null } })),
    prisma.aIUsageRecord.groupBy({ by: ['agentId'], _sum: { cost: true }, orderBy: { _sum: { cost: 'desc' } }, take: 1 }).catch(() => []),
  ]);

  const costTodayUsd = Number(today._sum.cost ?? 0);
  const costMtdUsd   = Number(mtd._sum.cost ?? 0);
  // Project to end of month
  const dayOfMonth   = new Date().getDate();
  const daysInMonth  = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const costProjectedMonthUsd = dayOfMonth > 0 ? (costMtdUsd / dayOfMonth) * daysInMonth : 0;

  const budgetMonthUsd = Number(process.env.MONTHLY_AI_BUDGET_USD ?? 10_000);
  const budgetUsedPct  = budgetMonthUsd > 0 ? (costMtdUsd / budgetMonthUsd) * 100 : 0;

  const topSpenderId = byAgent[0]?.agentId ?? null;
  const topSpender   = topSpenderId
    ? ((await prisma.agent.findUnique({ where: { id: topSpenderId }, select: { name: true } }))?.name ?? topSpenderId)
    : 'N/A';
  const topSpenderCostUsd = Number(byAgent[0]?._sum.cost ?? 0);

  return { costTodayUsd, costMtdUsd, costProjectedMonthUsd, budgetMonthUsd, budgetUsedPct: clamp(budgetUsedPct), topSpender, topSpenderCostUsd };
}

/* ── Master aggregator ───────────────────────────────────────────────────── */
export async function aggregateDashboard(): Promise<DashboardData> {
  const [platform, agents, products, kpis, alerts, workflows, finops] = await Promise.all([
    fetchPlatformHealth(),
    fetchAgents(),
    fetchProductGrid(),
    fetchKPIs(),
    fetchAlerts(),
    fetchWorkflows(),
    fetchFinOps(),
  ]);

  return { platform, agents, products, kpis, alerts, workflows, finops, fetchedAt: new Date().toISOString() };
}
