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
