// ── Platform event types (NATS JetStream messages) ────────────────────────────

import type { AgentRunId } from "../domain/agent.js";
import type { AuditEventType } from "../domain/audit.js";
import type { CollectionId, DocumentId } from "../domain/knowledge.js";
import type { OrgId, UserId } from "../domain/user.js";
import type { WorkflowExecutionId, WorkflowId } from "../domain/workflow.js";

export type EventType =
  // Workflow lifecycle
  | "workflow.created"
  | "workflow.published"
  | "workflow.execution.started"
  | "workflow.execution.step_completed"
  | "workflow.execution.step_failed"
  | "workflow.execution.completed"
  | "workflow.execution.failed"
  | "workflow.execution.cancelled"
  // Agent lifecycle
  | "agent.run.started"
  | "agent.run.completed"
  | "agent.run.failed"
  | "agent.tool_called"
  // Knowledge
  | "knowledge.document.uploaded"
  | "knowledge.document.indexed"
  | "knowledge.document.failed"
  | "knowledge.retrieved"
  // AI usage
  | "ai.request.completed"
  | "ai.budget.warning"
  | "ai.budget.exceeded"
  // Billing
  | "billing.subscription.created"
  | "billing.subscription.cancelled"
  | "billing.payment.succeeded"
  | "billing.payment.failed"
  // Security
  | "security.policy_violation"
  | "security.suspicious_activity"
  // Audit
  | "audit.event";

export interface BaseEvent {
  id:        string;
  type:      EventType;
  orgId:     OrgId;
  timestamp: string;
  version:   number;
  traceId:   string | null;
}

export interface WorkflowExecutionStartedEvent extends BaseEvent {
  type:        "workflow.execution.started";
  workflowId:  WorkflowId;
  executionId: WorkflowExecutionId;
  triggeredBy: UserId | "schedule" | "webhook" | "api";
  input:       Record<string, unknown>;
}

export interface WorkflowExecutionCompletedEvent extends BaseEvent {
  type:          "workflow.execution.completed";
  workflowId:    WorkflowId;
  executionId:   WorkflowExecutionId;
  durationMs:    number;
  totalCostUsd:  number;
  totalTokens:   number;
}

export interface WorkflowExecutionFailedEvent extends BaseEvent {
  type:          "workflow.execution.failed";
  workflowId:    WorkflowId;
  executionId:   WorkflowExecutionId;
  errorCode:     string;
  errorMessage:  string;
  stepId:        string | null;
}

export interface AgentRunCompletedEvent extends BaseEvent {
  type:       "agent.run.completed";
  agentId:    string;
  runId:      AgentRunId;
  durationMs: number;
  costUsd:    number;
  tokens:     number;
}

export interface AIBudgetWarningEvent extends BaseEvent {
  type:             "ai.budget.warning";
  spendUsd:         number;
  budgetUsd:        number;
  percentUsed:      number;
  projectedOverage: number | null;
}

export interface KnowledgeDocumentIndexedEvent extends BaseEvent {
  type:         "knowledge.document.indexed";
  collectionId: CollectionId;
  documentId:   DocumentId;
  chunkCount:   number;
  durationMs:   number;
}

export interface AuditEventEmitted extends BaseEvent {
  type:       "audit.event";
  auditType:  AuditEventType;
  actorId:    UserId | null;
  resourceId: string | null;
  severity:   "info" | "warning" | "critical";
}

export type PlatformEvent =
  | WorkflowExecutionStartedEvent
  | WorkflowExecutionCompletedEvent
  | WorkflowExecutionFailedEvent
  | AgentRunCompletedEvent
  | AIBudgetWarningEvent
  | KnowledgeDocumentIndexedEvent
  | AuditEventEmitted;

// ── Type narrowing ────────────────────────────────────────────────────────────
export function isEventOfType<T extends PlatformEvent>(
  event: PlatformEvent,
  type:  T["type"],
): event is T {
  return event.type === type;
}
