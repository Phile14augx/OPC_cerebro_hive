/* ── CerebroSphere — Shared Types ─────────────────────────────────────────── */

/* ── Role system ─────────────────────────────────────────────────────────── */
export type UserRole = 'ceo' | 'cto' | 'coo' | 'dept';

export interface RoleProfile {
  role: UserRole;
  label: string;
  description: string;
  /** Which data panels to show */
  panels: PanelKey[];
  /** CSS variable for role accent colour */
  color: string;
}

export type PanelKey =
  | 'platform-health'
  | 'agent-fleet'
  | 'business-kpis'
  | 'active-alerts'
  | 'product-grid'
  | 'workflow-activity'
  | 'cost-finops'
  | 'security-posture'
  | 'ai-narrative';

/* ── Platform health ─────────────────────────────────────────────────────── */
export type HealthStatus = 'healthy' | 'degraded' | 'critical' | 'unknown' | 'offline';

export interface PlatformHealth {
  overallStatus: HealthStatus;
  uptimePct: number;
  activeAgents: number;
  executionsPerMin: number;
  avgLatencyMs: number;
  errorRate: number;
  costBurnRateHr: number;
  calculatedAt: string;
}

/* ── Agent fleet ─────────────────────────────────────────────────────────── */
export interface AgentSummary {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'idle' | 'error' | 'offline';
  currentTask?: string;
  successRate: number;
  executionsLast24h: number;
  avgLatencyMs: number;
  lastActiveAt: string;
}

/* ── Product health grid ─────────────────────────────────────────────────── */
export interface ProductHealth {
  id: string;
  name: string;
  layer: 'command' | 'business' | 'intelligence' | 'agent' | 'data' | 'infra';
  status: HealthStatus;
  primaryAI: 'claude' | 'codex' | 'gemini';
  uptimePct: number;
  activeUsers: number;
  lastDeployedAt?: string;
}

/* ── Business KPIs ───────────────────────────────────────────────────────── */
export interface KPI {
  id: string;
  label: string;
  value: number;
  formatted: string;
  unit: string;
  trend: 'up' | 'down' | 'flat';
  delta: number;
  deltaFormatted: string;
  category: 'revenue' | 'operations' | 'people' | 'risk' | 'market';
}

/* ── Alerts ──────────────────────────────────────────────────────────────── */
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface UnifiedAlert {
  id: string;
  title: string;
  summary: string;
  severity: AlertSeverity;
  source: string;
  category: string;
  raisedAt: string;
  acknowledged: boolean;
  isNew: boolean;
}

/* ── Workflow activity ───────────────────────────────────────────────────── */
export interface WorkflowActivity {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  triggeredBy: string;
  startedAt: string;
  durationMs?: number;
  stepsTotal: number;
  stepsCompleted: number;
}

/* ── Cost / FinOps ───────────────────────────────────────────────────────── */
export interface FinOpsSnapshot {
  costTodayUsd: number;
  costMtdUsd: number;
  costProjectedMonthUsd: number;
  budgetMonthUsd: number;
  budgetUsedPct: number;
  topSpender: string;
  topSpenderCostUsd: number;
}

/* ── Claude narrative ────────────────────────────────────────────────────── */
export interface RoleNarrative {
  role: UserRole;
  headline: string;
  summary: string;
  topActions: string[];
  watchItems: string[];
  generatedAt: string;
}

/* ── Aggregate dashboard response ────────────────────────────────────────── */
export interface DashboardData {
  platform: PlatformHealth;
  agents: AgentSummary[];
  products: ProductHealth[];
  kpis: KPI[];
  alerts: UnifiedAlert[];
  workflows: WorkflowActivity[];
  finops: FinOpsSnapshot;
  fetchedAt: string;
}

/* ── Onboarding ──────────────────────────────────────────────────────────── */
export interface OnboardingConfig {
  tenantName: string;
  industry: string;
  size: 'startup' | 'smb' | 'mid-market' | 'enterprise';
  primaryRole: UserRole;
  goals: string[];
}

export interface OnboardingResult {
  tenantId: string;
  workspaceId: string;
  defaultAgents: string[];
  suggestedWorkflows: string[];
  welcomeNarrative: string;
}
