import { z } from "zod";
import { newId } from "../ids/id.js";

/** Standardized event envelope carried on every subject. */
export const eventEnvelopeSchema = z.object({
  id: z.string(),
  subject: z.string(),
  occurredAt: z.string(),
  organizationId: z.string(),
  actor: z.string().default("system"),
  traceId: z.string().optional(),
  data: z.record(z.unknown()),
});
export type EventEnvelope = z.infer<typeof eventEnvelopeSchema>;

export type EventHandler = (event: EventEnvelope) => Promise<void> | void;

export interface Subscription { unsubscribe(): Promise<void> }

export interface EventBus {
  readonly kind: "memory" | "redis" | "nats";
  publish(subject: string, data: Record<string, unknown>, opts: { organizationId: string; actor?: string; traceId?: string }): Promise<EventEnvelope>;
  /** Wildcard: trailing ".*" and ".>" supported (NATS-style). */
  subscribe(subject: string, handler: EventHandler, opts?: { durable?: string }): Promise<Subscription>;
  close(): Promise<void>;
}

export function makeEnvelope(subject: string, data: Record<string, unknown>, opts: { organizationId: string; actor?: string; traceId?: string }): EventEnvelope {
  return {
    id: newId("evt"), subject, occurredAt: new Date().toISOString(),
    organizationId: opts.organizationId, actor: opts.actor ?? "system", traceId: opts.traceId, data,
  };
}

export function subjectMatches(pattern: string, subject: string): boolean {
  if (pattern === subject) return true;
  const p = pattern.split("."); const s = subject.split(".");
  for (let i = 0; i < p.length; i++) {
    const tok = p[i];
    if (tok === ">") return true;
    if (i >= s.length) return false;
    if (tok !== "*" && tok !== s[i]) return false;
  }
  return p.length === s.length;
}

/** Canonical subject catalog — keep every emitted subject registered here. */
export const Subjects = {
  runtime: {
    executionQueued: "runtime.execution.queued",
    executionStarted: "runtime.execution.started",
    executionStep: "runtime.execution.step",
    executionCompleted: "runtime.execution.completed",
    executionFailed: "runtime.execution.failed",
    executionCancelled: "runtime.execution.cancelled",
    agentRegistered: "runtime.agent.registered",
  },
  reasoning: {
    planCreated: "reasoning.plan.created",
    reflectionRecorded: "reasoning.reflection.recorded",
  },
  mesh: {
    agentJoined: "mesh.agent.joined",
    agentLeft: "mesh.agent.left",
    delegated: "mesh.task.delegated",
    voteCompleted: "mesh.vote.completed",
    leaderElected: "mesh.leader.elected",
  },
  flow: {
    workflowCreated: "flow.workflow.created",
    runStarted: "flow.run.started",
    runStepCompleted: "flow.run.step.completed",
    runCompleted: "flow.run.completed",
    runFailed: "flow.run.failed",
    runCompensated: "flow.run.compensated",
    approvalRequested: "flow.approval.requested",
    approvalDecided: "flow.approval.decided",
  },
  memory: {
    written: "memory.record.written",
    summarized: "memory.record.summarized",
    expired: "memory.record.expired",
  },
  knowledge: {
    documentUploaded: "knowledge.document.uploaded",
    documentParsed: "knowledge.document.parsed",
    chunkGenerated: "knowledge.chunk.generated",
    embeddingCreated: "knowledge.embedding.created",
    graphUpdated: "knowledge.graph.updated",
    searchIndexed: "knowledge.search.indexed",
  },
  security: {
    guardFlagged: "security.guard.flagged",
    guardBlocked: "security.guard.blocked",
    rateLimited: "security.rate.limited",
  },
  evaluation: {
    completed: "eval.run.completed",
    regressionDetected: "eval.regression.detected",
  },
  governance: {
    auditRecorded: "governance.audit.recorded",
    approvalRequested: "governance.approval.requested",
    approvalDecided: "governance.approval.decided",
    policyViolation: "governance.policy.violation",
  },
  platform: {
    organizationCreated: "platform.organization.created",
    workspaceCreated: "platform.workspace.created",
    apiKeyCreated: "platform.apikey.created",
    notification: "platform.notification",
  },
  ai: {
    completion: "ai.gateway.completion",
    embedding: "ai.gateway.embedding",
  },
  simulator: { runCompleted: "simulator.run.completed" },
  hub: { insightGenerated: "hub.insight.generated" },
  connect: { connectorInvoked: "connect.connector.invoked", webhookReceived: "connect.webhook.received" },
} as const;
