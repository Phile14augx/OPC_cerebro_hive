/**
 * @cerebro/queue — Zod message schemas
 * Runtime validation for all JetStream message payloads.
 */

import { z } from "zod";

// ── Base ──────────────────────────────────────────────────────────────────────

const BaseMeta = z.object({
  traceId:   z.string().nullable(),
  timestamp: z.string().datetime(),
  subject:   z.string(),
});

const BaseEvent = z.object({
  id:        z.string().min(1),
  orgId:     z.string().min(1),
  _meta:     BaseMeta.optional(),
});

// ── Workflow execution ────────────────────────────────────────────────────────

export const WorkflowExecutionStartedSchema = BaseEvent.extend({
  workflowId:  z.string(),
  executionId: z.string(),
  triggeredBy: z.union([z.string(), z.literal("schedule"), z.literal("webhook"), z.literal("api")]),
  input:       z.record(z.unknown()).default({}),
});

export const WorkflowExecutionCompletedSchema = BaseEvent.extend({
  workflowId:   z.string(),
  executionId:  z.string(),
  durationMs:   z.number().nonnegative(),
  totalCostUsd: z.number().nonnegative(),
  totalTokens:  z.number().int().nonnegative(),
});

export const WorkflowExecutionFailedSchema = BaseEvent.extend({
  workflowId:   z.string(),
  executionId:  z.string(),
  errorCode:    z.string(),
  errorMessage: z.string(),
  stepId:       z.string().nullable(),
});

// ── Agent ─────────────────────────────────────────────────────────────────────

export const AgentRunStartedSchema = BaseEvent.extend({
  agentId:   z.string(),
  runId:     z.string(),
  modelId:   z.string(),
  input:     z.record(z.unknown()),
});

export const AgentRunCompletedSchema = BaseEvent.extend({
  agentId:    z.string(),
  runId:      z.string(),
  durationMs: z.number().nonnegative(),
  costUsd:    z.number().nonnegative(),
  tokens:     z.number().int().nonnegative(),
  success:    z.boolean(),
});

// ── Knowledge ─────────────────────────────────────────────────────────────────

export const DocumentUploadedSchema = BaseEvent.extend({
  collectionId: z.string(),
  documentId:   z.string(),
  name:         z.string(),
  mimeType:     z.string().optional(),
  sizeBytes:    z.number().int().nonnegative().optional(),
});

export const DocumentIndexedSchema = BaseEvent.extend({
  collectionId: z.string(),
  documentId:   z.string(),
  chunkCount:   z.number().int().nonnegative(),
  durationMs:   z.number().nonnegative(),
});

// ── AI usage ─────────────────────────────────────────────────────────────────

export const AIRequestCompletedSchema = BaseEvent.extend({
  provider:         z.string(),
  modelId:          z.string(),
  promptTokens:     z.number().int().nonnegative(),
  completionTokens: z.number().int().nonnegative(),
  totalTokens:      z.number().int().nonnegative(),
  costUsd:          z.number().nonnegative(),
  durationMs:       z.number().nonnegative().optional(),
  cacheHit:         z.boolean().default(false),
  workflowId:       z.string().optional(),
  agentId:          z.string().optional(),
  userId:           z.string().optional(),
});

export const AIBudgetWarningSchema = BaseEvent.extend({
  spendUsd:         z.number().nonnegative(),
  budgetUsd:        z.number().nonnegative(),
  percentUsed:      z.number().min(0).max(100),
  projectedOverage: z.number().nullable(),
});

// ── Audit ─────────────────────────────────────────────────────────────────────

export const AuditEventSchema = BaseEvent.extend({
  auditType:    z.string(),
  actorId:      z.string().nullable(),
  actorEmail:   z.string().nullable().optional(),
  actorIp:      z.string().nullable().optional(),
  resourceType: z.string().optional(),
  resourceId:   z.string().nullable(),
  action:       z.string(),
  outcome:      z.enum(["success", "failure"]),
  severity:     z.enum(["info", "warning", "critical"]).default("info"),
  details:      z.record(z.unknown()).optional(),
});

// ── Type exports ──────────────────────────────────────────────────────────────

export type WorkflowExecutionStartedMessage  = z.infer<typeof WorkflowExecutionStartedSchema>;
export type WorkflowExecutionCompletedMessage = z.infer<typeof WorkflowExecutionCompletedSchema>;
export type WorkflowExecutionFailedMessage   = z.infer<typeof WorkflowExecutionFailedSchema>;
export type AgentRunStartedMessage           = z.infer<typeof AgentRunStartedSchema>;
export type AgentRunCompletedMessage         = z.infer<typeof AgentRunCompletedSchema>;
export type DocumentUploadedMessage          = z.infer<typeof DocumentUploadedSchema>;
export type DocumentIndexedMessage           = z.infer<typeof DocumentIndexedSchema>;
export type AIRequestCompletedMessage        = z.infer<typeof AIRequestCompletedSchema>;
export type AIBudgetWarningMessage           = z.infer<typeof AIBudgetWarningSchema>;
export type AuditEventMessage                = z.infer<typeof AuditEventSchema>;

// ── Schema registry ───────────────────────────────────────────────────────────

export const SCHEMA_REGISTRY = {
  "cerebro.workflow.execution.started":   WorkflowExecutionStartedSchema,
  "cerebro.workflow.execution.completed": WorkflowExecutionCompletedSchema,
  "cerebro.workflow.execution.failed":    WorkflowExecutionFailedSchema,
  "cerebro.agent.run.started":            AgentRunStartedSchema,
  "cerebro.agent.run.completed":          AgentRunCompletedSchema,
  "cerebro.knowledge.document.uploaded":  DocumentUploadedSchema,
  "cerebro.knowledge.document.indexed":   DocumentIndexedSchema,
  "cerebro.ai.request.completed":         AIRequestCompletedSchema,
  "cerebro.ai.budget.warning":            AIBudgetWarningSchema,
  "cerebro.audit.event":                  AuditEventSchema,
} as const;

// ── HiveSwarm events ──────────────────────────────────────────────────────────

const SwarmBaseEvent = z.object({
  id:         z.string().min(1),
  type:       z.string().min(1),
  tenantId:   z.string().min(1),
  traceId:    z.string().optional(),
  occurredAt: z.string().datetime(),
});

export const SwarmRunCreatedSchema = SwarmBaseEvent.extend({
  type:   z.literal("swarm.run.created"),
  payload: z.object({
    runId:  z.string(),
    dagId:  z.string(),
    userId: z.string(),
    input:  z.record(z.unknown()).default({}),
  }),
});

export const SwarmRunCompletedSchema = SwarmBaseEvent.extend({
  type:   z.literal("swarm.run.completed"),
  payload: z.object({
    runId:        z.string(),
    dagId:        z.string(),
    durationMs:   z.number().nonnegative(),
    totalCostUsd: z.number().nonnegative(),
    totalTokens:  z.number().int().nonnegative(),
  }),
});

export const SwarmRunFailedSchema = SwarmBaseEvent.extend({
  type:   z.literal("swarm.run.failed"),
  payload: z.object({
    runId:        z.string(),
    dagId:        z.string(),
    failedTaskId: z.string().optional(),
    errorCode:    z.string(),
    errorMessage: z.string(),
  }),
});

export const SwarmTaskCompletedSchema = SwarmBaseEvent.extend({
  type:   z.literal("swarm.task.completed"),
  payload: z.object({
    taskId:     z.string(),
    runId:      z.string(),
    agentId:    z.string().optional(),
    durationMs: z.number().nonnegative(),
    tokensUsed: z.number().int().nonnegative(),
    costUsd:    z.number().nonnegative(),
    success:    z.boolean(),
  }),
});

export const SwarmAgentRegisteredSchema = SwarmBaseEvent.extend({
  type:   z.literal("swarm.agent.registered"),
  payload: z.object({
    agentId:      z.string(),
    agentName:    z.string(),
    capabilities: z.array(z.string()),
    version:      z.string(),
    endpoint:     z.string(),
  }),
});

export const SwarmApprovalRequestedSchema = SwarmBaseEvent.extend({
  type:   z.literal("swarm.approval.requested"),
  payload: z.object({
    taskId:    z.string(),
    runId:     z.string(),
    approvers: z.array(z.string()),
    summary:   z.string(),
    expiresAt: z.string().datetime(),
  }),
});

// Type exports
export type SwarmRunCreatedMessage       = z.infer<typeof SwarmRunCreatedSchema>;
export type SwarmRunCompletedMessage     = z.infer<typeof SwarmRunCompletedSchema>;
export type SwarmRunFailedMessage        = z.infer<typeof SwarmRunFailedSchema>;
export type SwarmTaskCompletedMessage    = z.infer<typeof SwarmTaskCompletedSchema>;
export type SwarmAgentRegisteredMessage  = z.infer<typeof SwarmAgentRegisteredSchema>;
export type SwarmApprovalRequestedMessage = z.infer<typeof SwarmApprovalRequestedSchema>;

// Extend the schema registry
export const SWARM_SCHEMA_REGISTRY = {
  "swarm.run.created":         SwarmRunCreatedSchema,
  "swarm.run.completed":       SwarmRunCompletedSchema,
  "swarm.run.failed":          SwarmRunFailedSchema,
  "swarm.task.completed":      SwarmTaskCompletedSchema,
  "swarm.agent.registered":    SwarmAgentRegisteredSchema,
  "swarm.approval.requested":  SwarmApprovalRequestedSchema,
} as const;
