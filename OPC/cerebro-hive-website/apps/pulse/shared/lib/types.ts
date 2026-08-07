/* ── HivePulse — Shared Type Definitions ─────────────────────────────────── */

export type HealthStatus = 'healthy' | 'degraded' | 'critical' | 'unknown';
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type BriefingType   = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'board';
export type TrendDirection = 'up' | 'down' | 'flat';

/* ── Enterprise Health ───────────────────────────────────────────────────── */
export interface EnterpriseHealthScore {
  /** 0–100 composite score */
  score: number;
  status: HealthStatus;
  /** What drove the score this period */
  primaryDrivers: string[];
  /** Timestamp of last calculation */
  calculatedAt: string;
  /** Comparison vs. previous period (percentage points) */
  delta: number;
  deltaDirection: TrendDirection;
}

export interface PillarScore {
  id: string;
  label: string;
  score: number;
  status: HealthStatus;
  trend: TrendDirection;
  delta: number;
  /** Supporting KPIs for this pillar */
  kpis: KPIMetric[];
}

export interface KPIMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  formatted: string;
  trend: TrendDirection;
  delta: number;
  deltaFormatted: string;
  status: HealthStatus;
  target?: number;
  targetFormatted?: string;
}

/* ── Strategic Alerts ────────────────────────────────────────────────────── */
export interface StrategicAlert {
  id: string;
  title: string;
  summary: string;
  severity: AlertSeverity;
  category: 'revenue' | 'operations' | 'risk' | 'people' | 'security' | 'market';
  isNew: boolean;
  /** ISO timestamp */
  raisedAt: string;
  /** Agent that raised this alert */
  source: string;
  /** Recommended actions (Claude-generated) */
  actions: string[];
  /** Linked product/pillar */
  pillar?: string;
  acknowledged: boolean;
}

/* ── Briefings ───────────────────────────────────────────────────────────── */
export interface Briefing {
  id: string;
  title: string;
  type: BriefingType;
  period: string;
  generatedAt: string;
  executiveSummary: string;
  highlights: BriefingHighlight[];
  risks: BriefingRisk[];
  recommendations: string[];
  kpiSnapshot: KPIMetric[];
  /** Estimated read time in minutes */
  readTime: number;
  isLatest: boolean;
}

export interface BriefingHighlight {
  label: string;
  value: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface BriefingRisk {
  title: string;
  likelihood: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  mitigation: string;
}

/* ── Scenario Modelling ──────────────────────────────────────────────────── */
export interface Scenario {
  id: string;
  title: string;
  description: string;
  assumption: string;
  /** Impact on enterprise health score */
  healthImpact: number;
  /** Pillar-level impacts */
  pillarImpacts: { pillarId: string; label: string; delta: number }[];
  /** Revenue impact ($M) */
  revenueImpact: number;
  /** Probability estimate (0–1) */
  probability: number;
  timeHorizon: '30d' | '90d' | '180d' | '1y';
  generatedAt: string;
}
