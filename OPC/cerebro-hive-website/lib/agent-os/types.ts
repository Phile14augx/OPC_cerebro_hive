// ============================================================
// Agent OS — Shared Types
// ============================================================

export type AgentLifecycleState =
  | "registered"
  | "initializing"
  | "ready"
  | "queued"
  | "running"
  | "waiting"
  | "paused"
  | "blocked"
  | "completed"
  | "failed"
  | "retrying"
  | "suspended"
  | "terminated"
  | "quarantined";

export type AgentRiskLevel = "low" | "medium" | "high" | "critical";

export type MissionStatus =
  | "draft"
  | "planning"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export type TaskStatus =
  | "pending"
  | "planning"
  | "running"
  | "waiting_dependency"
  | "paused"
  | "awaiting_approval"
  | "completed"
  | "failed"
  | "cancelled"
  | "skipped";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired";

// ── Agent Definition ────────────────────────────────────────

export interface ModelPolicy {
  allowedModels: string[];
  preferredModel: string;
  maxContextTokens: number;
  temperature?: number;
  topP?: number;
}

export interface DefaultBudget {
  tokenBudget: number;
  costBudgetUsd: number;
  period: "daily" | "monthly" | "mission" | "unlimited";
}

export interface AgentDefinition {
  id: string;
  name: string;
  version: string;
  type: "planner" | "executor" | "reviewer" | "monitor" | "specialist" | "coordinator";
  role: string;
  description: string;
  purpose: string;
  owner: string;
  riskLevel: AgentRiskLevel;
  trustLevel: number; // 0–100
  capabilities: string[];
  toolPermissions: string[]; // toolId refs
  modelPolicy: ModelPolicy;
  defaultBudget: DefaultBudget;
  tags: string[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
  isDeprecated: boolean;
}

// ── Agent Instance ──────────────────────────────────────────

export interface ErrorHistoryEntry {
  timestamp: string;
  error: string;
  attempt: number;
}

export interface AgentInstance {
  instanceId: string;
  agentId: string;
  agentName: string;
  state: AgentLifecycleState;
  missionId?: string;
  taskId?: string;
  parentInstanceId?: string;
  delegationChain: string[]; // instanceId chain
  tokensUsed: number;
  costUsd: number;
  executionTimeMs: number;
  toolCallsMade: number;
  iterations: number;
  tokenBudget: number;
  costBudgetUsd: number;
  priority: number; // 1 (lowest) – 10 (highest)
  startedAt: string;
  lastHeartbeatAt: string;
  retryCount: number;
  traceId: string;
  errorHistory: ErrorHistoryEntry[];
}

// ── Mission ─────────────────────────────────────────────────

export interface MissionConstraints {
  deadline?: string; // ISO
  maxCostUsd?: number;
  riskTolerance: "low" | "medium" | "high";
}

export interface MissionEvent {
  eventId: string;
  timestamp: string;
  type: string;
  description: string;
  agentId?: string;
  taskId?: string;
  metadata?: Record<string, unknown>;
}

export interface MissionArtifact {
  artifactId: string;
  name: string;
  type: string;
  url?: string;
  content?: string;
  createdAt: string;
}

export interface Mission {
  missionId: string;
  title: string;
  description: string;
  objective: string;
  status: MissionStatus;
  tenantId: string;
  createdBy: string;
  assignedAgentIds: string[];
  taskIds: string[];
  constraints: MissionConstraints;
  events: MissionEvent[];
  artifacts: MissionArtifact[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// ── Task ────────────────────────────────────────────────────

export interface Task {
  taskId: string;
  missionId: string;
  name: string;
  description: string;
  objective: string;
  assignedAgentId?: string;
  status: TaskStatus;
  priority: number; // 1–10
  dependencies: string[]; // taskId refs
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  retryCount: number;
  maxRetries: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  executionRunIds: string[];
}

// ── Execution Run ───────────────────────────────────────────

export interface ModelCall {
  callId: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
  latencyMs: number;
  timestamp: string;
}

export interface ToolCall {
  callId: string;
  toolId: string;
  toolName: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  latencyMs: number;
  timestamp: string;
}

export interface PolicyDecision {
  policyId: string;
  policyName: string;
  action: "allow" | "deny" | "require_approval" | "rate_limit";
  reason: string;
  timestamp: string;
}

export interface ExecutionRun {
  runId: string;
  taskId: string;
  missionId: string;
  agentId: string;
  instanceId?: string;
  status: "running" | "completed" | "failed" | "cancelled";
  attempt: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  tokensUsed: number;
  costUsd: number;
  durationMs: number;
  modelCalls: ModelCall[];
  toolCalls: ToolCall[];
  policyDecisions: PolicyDecision[];
  startedAt: string;
  completedAt?: string;
  createdAt: string;
}

// ── Approval Request ────────────────────────────────────────

export interface ApprovalRequest {
  requestId: string;
  agentId: string;
  instanceId: string;
  missionId: string;
  taskId: string;
  action: string;
  description: string;
  riskLevel: AgentRiskLevel;
  financialImpact?: number; // USD
  status: ApprovalStatus;
  requestedAt: string;
  expiresAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
}

// ── Audit Event ─────────────────────────────────────────────

export interface AuditEvent {
  eventId: string;
  timestamp: string;
  agentId: string;
  instanceId: string;
  missionId?: string;
  taskId?: string;
  who: string; // agent name or "system" or user email
  what: string; // human-readable summary
  operation: string; // machine-readable verb
  resourceType: string;
  resourceId: string;
  outcome: "success" | "failure";
  costUsd?: number;
}

// ── Policy ──────────────────────────────────────────────────

export interface PolicyCondition {
  field: string;
  operator: "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "in" | "contains";
  value: unknown;
}

export interface Policy {
  policyId: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number; // lower = evaluated first
  condition: PolicyCondition;
  action: "allow" | "deny" | "require_approval" | "rate_limit";
  createdAt: string;
}

// ── Budget Account ──────────────────────────────────────────

export interface BudgetAccount {
  accountId: string;
  agentId?: string;
  missionId?: string;
  type: "agent" | "mission" | "tenant";
  tokenBudget: number;
  costBudgetUsd: number;
  tokenUsed: number;
  costUsed: number;
  period: "daily" | "monthly" | "mission" | "unlimited";
  createdAt: string;
  updatedAt: string;
}

// ── Tool ────────────────────────────────────────────────────

export interface ToolSchema {
  input: Record<string, unknown>;
  output: Record<string, unknown>;
}

export interface Tool {
  toolId: string;
  name: string;
  provider: string;
  description: string;
  capabilities: string[];
  schema: ToolSchema;
  riskLevel: AgentRiskLevel;
  rateLimitPerMin: number;
  enabled: boolean;
  createdAt: string;
}

// ── Top-level Database ──────────────────────────────────────

export interface AgentOsDatabase {
  agents: AgentDefinition[];
  instances: AgentInstance[];
  missions: Mission[];
  tasks: Task[];
  executions: ExecutionRun[];
  approvals: ApprovalRequest[];
  audit: AuditEvent[];
  policies: Policy[];
  budgets: BudgetAccount[];
  tools: Tool[];
}
