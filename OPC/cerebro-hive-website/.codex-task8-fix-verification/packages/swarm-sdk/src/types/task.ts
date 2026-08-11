/**
 * HiveSwarm — Task Types
 *
 * Core task model: input/output, priority, status, budget,
 * and the full lifecycle transition enum.
 */

import type { CapabilityRequirement } from "./capability.js";

// ── Status ─────────────────────────────────────────────────────────────────────

export type TaskStatus =
  | "pending"       // Created, waiting for a slot in the scheduler
  | "queued"        // Picked up by the scheduler, waiting for an agent
  | "assigned"      // Assigned to a specific agent, not yet started
  | "running"       // Agent is actively working
  | "paused"        // Paused by governance gate or human approval
  | "awaiting_approval" // Blocked on a human-approval gate
  | "completed"     // Finished successfully
  | "failed"        // Terminal failure (all retries exhausted)
  | "cancelled"     // Explicitly cancelled
  | "skipped";      // Skipped by a conditional edge that evaluated false

// Terminal states — no further transitions possible
export const TERMINAL_STATUSES: ReadonlySet<TaskStatus> = new Set([
  "completed", "failed", "cancelled", "skipped",
]);

// ── Priority ───────────────────────────────────────────────────────────────────

export type TaskPriority =
  | "critical"    // 1000 — SLA-bound, preempts other tasks
  | "high"        // 750
  | "normal"      // 500  (default)
  | "low"         // 250
  | "background"; // 100  — runs only when capacity is available

export const PRIORITY_VALUES: Record<TaskPriority, number> = {
  critical:   1000,
  high:       750,
  normal:     500,
  low:        250,
  background: 100,
};

// ── Budget ─────────────────────────────────────────────────────────────────────

export interface TaskBudget {
  maxTokens?:     number;    // Hard token limit (across all LLM calls for this task)
  maxCostUsd?:    number;    // Hard cost cap in USD
  deadlineMs?:    number;    // Absolute deadline (epoch ms)
  timeoutMs?:     number;    // Relative timeout from assignment (ms)
  maxIterations?: number;    // Max LLM/tool call iterations
}

// ── Input / Output ─────────────────────────────────────────────────────────────

export interface TaskInput {
  /** Natural-language objective */
  objective: string;
  /** Structured key/value context passed to the agent */
  context:   Record<string, unknown>;
  /** IDs of tasks whose outputs are available as context */
  dependsOn?: string[];
  /** Artifact IDs (files, docs) the agent should access */
  artifacts?: string[];
}

export interface TaskOutput {
  /** Primary result payload (format is task-type dependent) */
  result:     unknown;
  /** Summary in plain English, always present */
  summary:    string;
  /** Confidence score 0.0–1.0 */
  confidence: number;
  /** Artifacts produced (file IDs, doc IDs, etc.) */
  artifacts:  string[];
  /** LLM usage tracking */
  usage: {
    promptTokens:     number;
    completionTokens: number;
    totalTokens:      number;
    costUsd:          number;
  };
}

// ── Task ──────────────────────────────────────────────────────────────────────

export interface SwarmTask {
  /** ULID or UUID, set by swarm-api on creation */
  id:           string;
  /** Parent DAG run this task belongs to */
  runId:        string;
  /** Human-readable name */
  name:         string;
  priority:     TaskPriority;
  status:       TaskStatus;
  capability:   CapabilityRequirement;
  input:        TaskInput;
  output?:      TaskOutput;
  budget?:      TaskBudget;

  /** Agent assigned to execute this task */
  assignedAgentId?: string;
  /** Temporal workflow/activity ID for durable tracking */
  temporalId?:     string;

  /** Retry tracking */
  retryCount:   number;
  maxRetries:   number;

  /** Timestamps */
  createdAt:    string;
  queuedAt?:    string;
  assignedAt?:  string;
  startedAt?:   string;
  completedAt?: string;

  /** Metadata for governance / observability */
  metadata:     Record<string, unknown>;
  /** Tags for routing and filtering */
  tags:         string[];
}

// ── Task events ───────────────────────────────────────────────────────────────

export interface TaskStatusChange {
  taskId:    string;
  runId:     string;
  prevStatus: TaskStatus;
  newStatus:  TaskStatus;
  agentId?:   string;
  reason?:    string;
  timestamp:  string;
}
