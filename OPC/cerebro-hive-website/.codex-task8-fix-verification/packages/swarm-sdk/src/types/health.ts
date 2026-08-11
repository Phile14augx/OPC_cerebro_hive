/**
 * HiveSwarm — Agent Health Types
 */

export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

export interface AgentHealthCheck {
  name:       string;
  status:     HealthStatus;
  message?:   string;
  latencyMs?: number;
}

export interface AgentHealth {
  agentId:    string;
  status:     HealthStatus;
  /** Individual sub-system checks (LLM connection, DB, tools, etc.) */
  checks:     AgentHealthCheck[];
  /** Current number of active task executions */
  activeRuns: number;
  /** 0.0–1.0 load factor: activeRuns / concurrency */
  loadFactor: number;
  checkedAt:  string;
}
