/**
 * HiveSwarm — Swarm Event Types
 *
 * All events published to NATS JetStream under the `swarm.*` subject hierarchy.
 */

import type { TaskStatus } from "./task.js";
import type { RunStatus } from "./dag.js";
import type { AgentState } from "./agent.js";
import type { AgentHealth } from "./health.js";
import type { TaskOutput } from "./task.js";

export type SwarmEventType =
  // DAG Run lifecycle
  | "swarm.run.created"
  | "swarm.run.started"
  | "swarm.run.completed"
  | "swarm.run.failed"
  | "swarm.run.cancelled"
  | "swarm.run.paused"

  // Task lifecycle
  | "swarm.task.queued"
  | "swarm.task.assigned"
  | "swarm.task.started"
  | "swarm.task.completed"
  | "swarm.task.failed"
  | "swarm.task.cancelled"
  | "swarm.task.retrying"
  | "swarm.task.awaiting_approval"

  // Agent lifecycle
  | "swarm.agent.registered"
  | "swarm.agent.deregistered"
  | "swarm.agent.state_changed"
  | "swarm.agent.health_changed"

  // Governance
  | "swarm.approval.requested"
  | "swarm.approval.granted"
  | "swarm.approval.rejected";

interface BaseSwarmEvent {
  id:          string;    // ULID
  type:        SwarmEventType;
  tenantId:    string;
  traceId?:    string;
  occurredAt:  string;   // ISO 8601
}

// ── Run events ────────────────────────────────────────────────────────────────

export interface RunCreatedEvent extends BaseSwarmEvent {
  type:    "swarm.run.created";
  runId:   string;
  dagId:   string;
  userId:  string;
}

export interface RunStartedEvent extends BaseSwarmEvent {
  type:         "swarm.run.started";
  runId:        string;
  dagId:        string;
  temporalRunId?: string;
}

export interface RunCompletedEvent extends BaseSwarmEvent {
  type:         "swarm.run.completed";
  runId:        string;
  dagId:        string;
  durationMs:   number;
  totalCostUsd: number;
  totalTokens:  number;
}

export interface RunFailedEvent extends BaseSwarmEvent {
  type:          "swarm.run.failed";
  runId:         string;
  dagId:         string;
  failedTaskId?: string;
  errorCode:     string;
  errorMessage:  string;
}

// ── Task events ───────────────────────────────────────────────────────────────

export interface TaskStatusChangedEvent extends BaseSwarmEvent {
  type:       SwarmEventType;
  taskId:     string;
  runId:      string;
  prevStatus: TaskStatus;
  newStatus:  TaskStatus;
  agentId?:   string;
  reason?:    string;
}

export interface TaskCompletedEvent extends TaskStatusChangedEvent {
  type:   "swarm.task.completed";
  output: TaskOutput;
}

// ── Agent events ──────────────────────────────────────────────────────────────

export interface AgentRegisteredEvent extends BaseSwarmEvent {
  type:         "swarm.agent.registered";
  agentId:      string;
  agentName:    string;
  capabilities: string[];
  version:      string;
}

export interface AgentStateChangedEvent extends BaseSwarmEvent {
  type:      "swarm.agent.state_changed";
  agentId:   string;
  prevState: AgentState;
  newState:  AgentState;
  taskId?:   string;
}

export interface AgentHealthChangedEvent extends BaseSwarmEvent {
  type:      "swarm.agent.health_changed";
  agentId:   string;
  health:    AgentHealth;
}

// ── Approval events ───────────────────────────────────────────────────────────

export interface ApprovalRequestedEvent extends BaseSwarmEvent {
  type:       "swarm.approval.requested";
  taskId:     string;
  runId:      string;
  approvers:  string[];
  summary:    string;
  expiresAt:  string;
}

export interface ApprovalDecisionEvent extends BaseSwarmEvent {
  type:      "swarm.approval.granted" | "swarm.approval.rejected";
  taskId:    string;
  runId:     string;
  deciderId: string;
  reason?:   string;
}

// ── Union ─────────────────────────────────────────────────────────────────────

export type SwarmEvent =
  | RunCreatedEvent
  | RunStartedEvent
  | RunCompletedEvent
  | RunFailedEvent
  | TaskStatusChangedEvent
  | TaskCompletedEvent
  | AgentRegisteredEvent
  | AgentStateChangedEvent
  | AgentHealthChangedEvent
  | ApprovalRequestedEvent
  | ApprovalDecisionEvent;

// NATS subject for each event type
export const SWARM_SUBJECTS: Record<SwarmEventType, string> = {
  "swarm.run.created":             "swarm.run.created",
  "swarm.run.started":             "swarm.run.started",
  "swarm.run.completed":           "swarm.run.completed",
  "swarm.run.failed":              "swarm.run.failed",
  "swarm.run.cancelled":           "swarm.run.cancelled",
  "swarm.run.paused":              "swarm.run.paused",
  "swarm.task.queued":             "swarm.task.queued",
  "swarm.task.assigned":           "swarm.task.assigned",
  "swarm.task.started":            "swarm.task.started",
  "swarm.task.completed":          "swarm.task.completed",
  "swarm.task.failed":             "swarm.task.failed",
  "swarm.task.cancelled":          "swarm.task.cancelled",
  "swarm.task.retrying":           "swarm.task.retrying",
  "swarm.task.awaiting_approval":  "swarm.task.awaiting_approval",
  "swarm.agent.registered":        "swarm.agent.registered",
  "swarm.agent.deregistered":      "swarm.agent.deregistered",
  "swarm.agent.state_changed":     "swarm.agent.state_changed",
  "swarm.agent.health_changed":    "swarm.agent.health_changed",
  "swarm.approval.requested":      "swarm.approval.requested",
  "swarm.approval.granted":        "swarm.approval.granted",
  "swarm.approval.rejected":       "swarm.approval.rejected",
};
