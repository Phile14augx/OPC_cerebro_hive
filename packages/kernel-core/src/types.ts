/**
 * @module kernel-core/types
 * Core type definitions for the Cerebro Nexarch Agentic Operating System kernel.
 * All types are designed to be serialisable to JSON for optional persistence.
 */

// ---------------------------------------------------------------------------
// Enumerations (string-union types for strict discriminated unions)
// ---------------------------------------------------------------------------

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

export type AgentTrustLevel = "untrusted" | "low" | "medium" | "high" | "verified";

// ---------------------------------------------------------------------------
// Resource management
// ---------------------------------------------------------------------------

/**
 * Hard limits placed on an agent instance before it is spawned.
 * All fields are optional; absent means "unlimited".
 */
export interface ResourceBudget {
  /** Maximum total tokens (input + output) allowed across all model calls. */
  tokenBudget?: number;
  /** Maximum spend in USD. */
  costBudgetUsd?: number;
  /** Wall-clock time limit from agent start, in milliseconds. */
  executionTimeMs?: number;
  /** Maximum number of tool invocations. */
  toolCallLimit?: number;
  /** Maximum number of reasoning/action iterations. */
  maxIterations?: number;
  /** Maximum number of sub-agents that may be spawned concurrently. */
  concurrencyLimit?: number;
}

/**
 * Actual resource consumption accrued by a running agent instance.
 */
export interface ResourceUsage {
  tokensUsed: number;
  costUsd: number;
  executionTimeMs: number;
  toolCallsMade: number;
  iterations: number;
}

// ---------------------------------------------------------------------------
// Model policy
// ---------------------------------------------------------------------------

/**
 * Governs which model(s) an agent may use and with what parameters.
 */
export interface ModelPolicy {
  /** Primary model identifier (e.g. "claude-sonnet-4-5"). */
  preferredModel?: string;
  /** Ordered list of fallback models to try if the preferred is unavailable. */
  fallbackModels?: string[];
  /** Cap applied to every individual model call. */
  maxTokensPerCall?: number;
  /** Sampling temperature. */
  temperature?: number;
  /** Whether extended reasoning / chain-of-thought must be enabled. */
  requiresReasoning?: boolean;
  /** Allowlist of LLM providers (e.g. ["anthropic", "openai"]). Empty = all. */
  allowedProviders?: string[];
}

// ---------------------------------------------------------------------------
// Capabilities & permissions
// ---------------------------------------------------------------------------

/**
 * A single capability grant bound to an agent instance.
 * Capability strings use dot-notation: "<domain>.<resource>.<action>".
 */
export interface AgentCapabilityGrant {
  /** Dotted capability string, e.g. "crm.customer.read". */
  capability: string;
  /** Identity that issued the grant (agent instanceId or system). */
  grantedBy: string;
  /** ISO-8601 timestamp. */
  grantedAt: string;
  /** ISO-8601 expiry, undefined = non-expiring. */
  expiresAt?: string;
  /** Extra grant-specific restrictions (e.g. { "customerId": "acme-123" }). */
  scope?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Agent Definition (immutable blueprint)
// ---------------------------------------------------------------------------

/**
 * Immutable definition registered in the kernel.  Think of this as the
 * "class" — spawning creates an AgentControlBlock (the "instance").
 */
export interface AgentDefinition {
  /** Globally unique identifier for this agent type. */
  agentId: string;
  /** Human-readable display name. */
  name: string;
  /** SemVer string, e.g. "1.0.3". */
  version: string;
  /** Classification string, e.g. "llm-agent", "tool-agent", "orchestrator". */
  agentType: string;
  description: string;
  purpose: string;
  riskLevel: AgentRiskLevel;
  trustLevel: AgentTrustLevel;
  /** Team / service account that owns this definition. */
  owner: string;
  tenantId: string;
  workspaceId: string;
  /** Functional role within the swarm (e.g. "researcher", "planner"). */
  role: string;
  /** High-level goal statements used to seed the system prompt. */
  goals: string[];
  /** Full system prompt template. */
  systemPrompt: string;
  /** Capabilities granted to every instance spawned from this definition. */
  capabilities: AgentCapabilityGrant[];
  /** Tool identifiers permitted for every instance. */
  toolPermissions: string[];
  modelPolicy: ModelPolicy;
  defaultBudget: ResourceBudget;
  maxIterations: number;
  /** Per-invocation wall-clock timeout. */
  timeoutMs: number;
  maxRetries: number;
  tags: string[];
  /** ISO-8601 timestamps. */
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  isDeprecated: boolean;
}

// ---------------------------------------------------------------------------
// Agent Control Block (runtime instance)
// ---------------------------------------------------------------------------

/**
 * Mutable runtime record created each time an agent is spawned.
 * One ACB per active execution.  May be checkpointed for resume.
 */
export interface AgentControlBlock {
  /** Unique identifier for this specific execution instance. */
  instanceId: string;
  /** Back-reference to the AgentDefinition. */
  agentId: string;
  tenantId: string;
  workspaceId: string;
  state: AgentLifecycleState;
  role: string;
  goals: string[];
  /** The high-level mission this instance is executing. */
  currentMissionId?: string;
  /** The specific task currently being worked. */
  currentTaskId?: string;
  /** instanceId of the parent that spawned this agent, if any. */
  parentInstanceId?: string;
  /** Identity (instanceId or system) that issued the delegation. */
  delegatedBy?: string;
  /** Ordered list of instanceIds forming the delegation ancestry. */
  delegationChain: string[];
  /** References to memory objects (e.g. memory-store record IDs). */
  memoryRefs: string[];
  /** References to context objects (e.g. vector-store chunk IDs). */
  contextRefs: string[];
  capabilityGrants: AgentCapabilityGrant[];
  toolPermissions: string[];
  modelPolicy: ModelPolicy;
  budget: ResourceBudget;
  usage: ResourceUsage;
  /** Higher number = higher scheduling priority. */
  priority: number;
  startedAt: string;
  lastHeartbeatAt: string;
  retryCount: number;
  /** Opaque checkpoint identifier for resumable execution. */
  checkpointId?: string;
  /** Distributed trace correlation ID. */
  traceId: string;
  metadata: Record<string, unknown>;
  errorHistory: AgentError[];
}

// ---------------------------------------------------------------------------
// Error & event records
// ---------------------------------------------------------------------------

export interface AgentError {
  timestamp: string;
  message: string;
  /** Application-defined error code, e.g. "TOOL_TIMEOUT". */
  code?: string;
  retryable: boolean;
  /** Additional structured context for debugging. */
  context?: Record<string, unknown>;
}

export interface StateTransition {
  from: AgentLifecycleState;
  to: AgentLifecycleState;
  instanceId: string;
  agentId: string;
  timestamp: string;
  /** Identity that triggered the transition (instanceId, system, watchdog…). */
  triggeredBy: string;
  reason?: string;
}

// ---------------------------------------------------------------------------
// Scheduler
// ---------------------------------------------------------------------------

export type SchedulerTaskStatus =
  | "pending"
  | "queued"
  | "assigned"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface SchedulerTask {
  taskId: string;
  missionId: string;
  /** Assigned agent instance ID once dispatched. */
  instanceId?: string;
  /** Target agent type / definition ID. */
  agentId: string;
  tenantId: string;
  /** 0–1000, higher = more urgent. */
  priority: number;
  /** ISO-8601; if set, do not dequeue before this time. */
  scheduledAt?: string;
  /** Cron expression for recurring tasks. */
  recurringCron?: string;
  /** taskIds that must reach "completed" before this task is eligible. */
  dependencies: string[];
  status: SchedulerTaskStatus;
  /** 1-based attempt counter. */
  attempt: number;
  maxAttempts: number;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Delegation
// ---------------------------------------------------------------------------

export interface DelegationRecord {
  delegationId: string;
  /** The delegating agent's instanceId. */
  fromInstanceId: string;
  /** The delegate agent's instanceId. */
  toInstanceId: string;
  missionId: string;
  taskId?: string;
  /** Namespaced scopes permitted under this delegation. */
  scope: string[];
  /** Subset of the parent's capabilities forwarded to the child. */
  grantedCapabilities: string[];
  /** Budget slice allocated from the parent's remaining budget. */
  budgetAllocation: ResourceBudget;
  delegatedAt: string;
  expiresAt?: string;
  reason: string;
  result?: DelegationResult;
}

export interface DelegationResult {
  success: boolean;
  output?: Record<string, unknown>;
  error?: string;
  completedAt: string;
  usageSummary: ResourceUsage;
}

// ---------------------------------------------------------------------------
// Watchdog
// ---------------------------------------------------------------------------

export type WatchdogAlertSeverity = "warning" | "critical";

export type WatchdogAlertType =
  | "missed_heartbeat"
  | "runaway_loop"
  | "excessive_tool_calls"
  | "budget_spike"
  | "repeated_errors"
  | "policy_violation"
  | "abnormal_latency"
  | "deadlock"
  | "unbounded_delegation";

export type WatchdogAlertAction =
  | "warned"
  | "paused"
  | "restarted"
  | "throttled"
  | "terminated"
  | "quarantined"
  | "escalated";

export interface WatchdogAlert {
  alertId: string;
  instanceId: string;
  agentId: string;
  severity: WatchdogAlertSeverity;
  type: WatchdogAlertType;
  message: string;
  detectedAt: string;
  resolvedAt?: string;
  action?: WatchdogAlertAction;
}

// ---------------------------------------------------------------------------
// Kernel events (used with typed EventEmitter in kernel.ts)
// ---------------------------------------------------------------------------

export interface KernelEvents {
  "agent:registered": [AgentDefinition];
  "instance:spawned": [AgentControlBlock];
  "instance:transitioned": [StateTransition];
  "instance:heartbeat": [{ instanceId: string; timestamp: string }];
  "instance:terminated": [{ instanceId: string; reason: string }];
  "instance:quarantined": [{ instanceId: string; reason: string }];
  "instance:checkpointed": [{ instanceId: string; checkpointId: string }];
  "budget:allocated": [{ instanceId: string; budget: ResourceBudget }];
  "usage:recorded": [{ instanceId: string; usage: ResourceUsage }];
  "watchdog:alert": [WatchdogAlert];
}
