// ============================================================
// governance-core/src/types.ts
// ============================================================

export type PolicyAction =
  | "allow"
  | "deny"
  | "require_approval"
  | "modify"
  | "rate_limit"
  | "quarantine";

export interface PolicyResult {
  action: PolicyAction;
  policyId: string;
  reason: string;
  confidence: number; // 0-1
  metadata?: Record<string, unknown>;
}

export type ConditionOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "gt"
  | "lt"
  | "gte"
  | "lte"
  | "regex"
  | "startsWith"
  | "endsWith"
  | "in"
  | "not_in";

export interface PolicyCondition {
  field: string; // dot-notation path into ActionContext
  operator: ConditionOperator;
  value: unknown;
}

export interface Policy {
  policyId: string;
  name: string;
  description: string;
  version: string;
  enabled: boolean;
  priority: number; // lower = evaluated first
  conditions: PolicyCondition[];
  conditionLogic?: "AND" | "OR"; // default AND
  action: PolicyAction;
  parameters?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type ApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "expired"
  | "delegated";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface ApprovalRequest {
  requestId: string;
  agentId: string;
  instanceId: string;
  missionId?: string;
  taskId?: string;
  action: string;
  description: string;
  riskLevel: RiskLevel;
  financialImpact?: number;
  dataAccessed?: string[];
  toolInvoked?: string;
  requestedAt: string;
  expiresAt: string;
  status: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  rejectedBy?: string;
  delegatedTo?: string;
  clarificationRequest?: string;
  notes?: string;
}

export type BudgetAccountType = "tenant" | "workspace" | "agent" | "mission";
export type BudgetPeriod = "daily" | "monthly" | "mission" | "unlimited";

export interface BudgetAccount {
  accountId: string;
  tenantId: string;
  workspaceId?: string;
  agentId?: string;
  missionId?: string;
  type: BudgetAccountType;
  tokenBudget: number;
  costBudgetUsd: number;
  executionTimeBudget: number; // milliseconds
  tokenUsed: number;
  costUsed: number;
  executionTimeUsed: number;
  period: BudgetPeriod;
  resetAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type BudgetAction =
  | "allow"
  | "warn"
  | "throttle"
  | "request_approval"
  | "deny";

export interface BudgetCheckResult {
  allowed: boolean;
  action: BudgetAction;
  remaining: {
    tokens: number;
    costUsd: number;
    executionTimeMs: number;
  };
  utilizationPercent: {
    tokens: number;
    costUsd: number;
    executionTimeMs: number;
  };
  warnings: string[];
}

export interface ResourceUsage {
  tokens: number;
  costUsd: number;
  executionTimeMs: number;
}

export interface RiskScore {
  score: number; // 0-100
  level: RiskLevel;
  factors: string[];
}

export type DataClassification =
  | "public"
  | "internal"
  | "confidential"
  | "restricted"
  | "secret";

export type ResourceType =
  | "agent"
  | "mission"
  | "task"
  | "tool"
  | "data"
  | "file"
  | "api"
  | "service"
  | "policy"
  | "budget"
  | "approval"
  | "workspace"
  | "tenant";

export interface AuditEvent {
  eventId: string;
  timestamp: string;
  tenantId: string;
  workspaceId?: string;
  agentId: string;
  instanceId?: string;
  missionId?: string;
  taskId?: string;
  who: string; // agentId or userId
  onBehalfOf?: string;
  what: string; // human-readable summary
  resourceType: ResourceType;
  resourceId: string;
  operation: string;
  policyResult?: PolicyResult;
  approval?: Pick<ApprovalRequest, "requestId" | "status" | "approvedBy">;
  delegationId?: string;
  dataClassification?: DataClassification;
  financialImpact?: number;
  outcomeSuccess: boolean;
  outcomeError?: string;
  costUsd?: number;
  hash?: string; // sha256 chain hash
}

export interface ActionContext {
  agentId: string;
  instanceId: string;
  tenantId: string;
  workspaceId?: string;
  action: string;
  resource: string;
  agentType?: string;
  metadata?: Record<string, unknown>;
  financialImpact?: number;
  toolCallsInWindow?: number;
  policyViolationsToday?: number;
  permissionLevel?: string;
  dataClassification?: DataClassification;
  isExternalSideEffect?: boolean;
}

export interface AuditQueryFilter {
  agentId?: string;
  instanceId?: string;
  missionId?: string;
  taskId?: string;
  operation?: string;
  resourceType?: ResourceType;
  from?: string; // ISO timestamp
  to?: string;
  tenantId?: string;
  outcomeSuccess?: boolean;
}
