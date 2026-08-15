import { z } from "zod";

export const connectorStatusSchema = z.enum(["connected", "not_configured", "error"]);
export type ConnectorStatus = z.infer<typeof connectorStatusSchema>;

export const agentTierSchema = z.enum(["lead", "specialist", "worker"]);
export const agentStatusSchema = z.enum(["active", "paused"]);
export const taskStatusSchema = z.enum(["backlog", "doing", "done"]);
export const claimStatusSchema = z.enum(["signal", "claim", "fact", "rejected"]);
export const funnelStageSchema = z.enum([
  "signal",
  "conversation",
  "pilot",
  "workspace",
  "expansion",
]);
export const commsLaneSchema = z.enum(["email", "github", "slack", "notes"]);
export const commsStatusSchema = z.enum(["open", "replied", "closed"]);
export const ledgerDirectionSchema = z.enum(["in", "out"]);

export const departmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  summary: z.string(),
  order: z.number().int(),
});
export type Department = z.infer<typeof departmentSchema>;

export const agentSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  departmentId: z.string(),
  parentId: z.string().nullable(),
  tier: agentTierSchema,
  status: agentStatusSchema,
  summary: z.string(),
});
export type Agent = z.infer<typeof agentSchema>;

export const agentRunSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  startedAt: z.string(),
  finishedAt: z.string(),
  ok: z.boolean(),
  summary: z.string(),
});
export type AgentRun = z.infer<typeof agentRunSchema>;

export const broadcastSchema = z.object({
  id: z.string(),
  message: z.string(),
  createdAt: z.string(),
});
export type Broadcast = z.infer<typeof broadcastSchema>;

export const broadcastReplySchema = z.object({
  id: z.string(),
  broadcastId: z.string(),
  agentId: z.string(),
  ok: z.boolean(),
  reply: z.string(),
  finishedAt: z.string(),
});
export type BroadcastReply = z.infer<typeof broadcastReplySchema>;

export const commsThreadSchema = z.object({
  id: z.string(),
  lane: commsLaneSchema,
  fromName: z.string(),
  subject: z.string(),
  preview: z.string(),
  status: commsStatusSchema,
  createdAt: z.string(),
});
export type CommsThread = z.infer<typeof commsThreadSchema>;

export const funnelDealSchema = z.object({
  id: z.string(),
  name: z.string(),
  stage: funnelStageSchema,
  valueUsd: z.number().int(),
  nextStep: z.string(),
  ownerAgentId: z.string(),
});
export type FunnelDeal = z.infer<typeof funnelDealSchema>;

export const contentItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  channel: z.string(),
  status: z.enum(["idea", "draft", "scheduled", "published"]),
  scheduledFor: z.string(),
});
export type ContentItem = z.infer<typeof contentItemSchema>;

export const socialAccountSchema = z.object({
  id: z.string(),
  platform: z.string(),
  handle: z.string(),
  cadence: z.string(),
  followersSeed: z.number().int(),
});
export type SocialAccount = z.infer<typeof socialAccountSchema>;

export const ledgerEntrySchema = z.object({
  id: z.string(),
  date: z.string(),
  description: z.string(),
  category: z.string(),
  amountUsd: z.number(),
  direction: ledgerDirectionSchema,
});
export type LedgerEntry = z.infer<typeof ledgerEntrySchema>;

export const knowledgeNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  kind: z.enum(["source", "signal", "claim", "fact", "memory", "doc"]),
  path: z.string().nullable(),
  summary: z.string(),
});
export type KnowledgeNode = z.infer<typeof knowledgeNodeSchema>;

export const knowledgeEdgeSchema = z.object({
  id: z.string(),
  fromId: z.string(),
  toId: z.string(),
  label: z.string(),
});
export type KnowledgeEdge = z.infer<typeof knowledgeEdgeSchema>;

export const claimSchema = z.object({
  id: z.string(),
  sourceId: z.string().nullable(),
  text: z.string(),
  status: claimStatusSchema,
  createdBy: z.string(),
  createdAt: z.string(),
});
export type Claim = z.infer<typeof claimSchema>;

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: taskStatusSchema,
  agentId: z.string(),
  createdAt: z.string(),
});
export type Task = z.infer<typeof taskSchema>;

export const skillSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  agentId: z.string(),
});
export type Skill = z.infer<typeof skillSchema>;

export const workflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  stepsJson: z.string(),
  lastRunAt: z.string().nullable(),
  lastSummary: z.string().nullable(),
});
export type Workflow = z.infer<typeof workflowSchema>;

export const pulseSnapshotSchema = z.object({
  id: z.string(),
  capturedAt: z.string(),
  agentsActive: z.number().int(),
  openComms: z.number().int(),
  openTasks: z.number().int(),
  runwayMonths: z.number(),
});
export type PulseSnapshot = z.infer<typeof pulseSnapshotSchema>;

export const connectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  group: z.string(),
  status: connectorStatusSchema,
  detail: z.string(),
  href: z.string().nullable(),
});
export type Connection = z.infer<typeof connectionSchema>;

export const hiveJobStatusSchema = z.enum([
  "QUEUED",
  "PREPARING",
  "RUNNING",
  "WAITING_FOR_INPUT",
  "SUCCEEDED",
  "FAILED",
  "CANCELLED",
  "TIMED_OUT",
]);
export type HiveJobStatus = z.infer<typeof hiveJobStatusSchema>;

export const hiveJobSchema = z.object({
  id: z.string(),
  type: z.string(),
  status: hiveJobStatusSchema,
  traceId: z.string().nullable(),
  errorCode: z.string().nullable(),
  startedAt: z.string().nullable(),
  finishedAt: z.string().nullable(),
  prismaId: z.string().nullable(),
  metadataJson: z.string(),
});
export type HiveJob = z.infer<typeof hiveJobSchema>;

export function parseRow<T>(schema: z.ZodType<T>, row: unknown): T {
  return schema.parse(row);
}

export function parseRows<T>(schema: z.ZodType<T>, rows: unknown[]): T[] {
  return rows.map((row) => schema.parse(row));
}

export const boolFromInt = z.union([z.boolean(), z.number()]).transform((v) => v === true || v === 1);
