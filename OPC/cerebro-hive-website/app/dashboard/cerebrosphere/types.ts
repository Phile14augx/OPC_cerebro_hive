export type HealthState = "Healthy" | "Degraded" | "At risk";

export type AlertSeverity = "Critical" | "Warning" | "Info";

export interface Kpi {
  label: string;
  value: string;
  trend: "up" | "down" | "neutral";
  comparison: string;
}

export interface ProductHealth {
  name: string;
  health: HealthState;
  availability: string;
  note: string;
}

export interface AgentActivity {
  agent: string;
  summary: string;
  timestamp: string;
  state: string;
}

export interface SystemAlert {
  title: string;
  detail: string;
  severity: AlertSeverity;
  requiresAttention: boolean;
}

export interface DashboardSnapshot {
  role: "CEO";
  kpis: Kpi[];
  products: ProductHealth[];
  activities: AgentActivity[];
  alerts: SystemAlert[];
}
