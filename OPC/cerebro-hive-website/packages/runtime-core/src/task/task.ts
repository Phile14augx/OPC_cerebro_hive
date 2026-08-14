/**
 * @module runtime-core/task
 * Task domain model and repository.
 *
 * A Task is one discrete unit of work within a Mission.  Tasks may
 * carry dependencies on each other (forming a DAG), have a single assigned
 * agent, and generate one or more ExecutionRuns (one per attempt).
 */

import { randomUUID } from "crypto";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TaskStatus =
  | "pending"
  | "planning"
  | "queued"
  | "running"
  | "waiting_dependency"
  | "paused"
  | "awaiting_approval"
  | "completed"
  | "failed"
  | "cancelled"
  | "skipped";

export type TaskPriority = "critical" | "high" | "normal" | "low" | "background";

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  critical:   1000,
  high:       750,
  normal:     500,
  low:        250,
  background: 100,
};

export function priorityWeight(p: TaskPriority): number {
  return PRIORITY_WEIGHT[p] ?? 500;
}

export interface TaskInput {
  /** Free-form key/value payload for the assigned agent. */
  [key: string]: unknown;
}

export interface TaskOutput {
  /** Summary produced by the completing agent. */
  summary?: string;
  /** Structured result artefacts (file refs, JSON blobs, etc.). */
  artefacts?: Array<{ name: string; type: string; ref: string }>;
  /** Raw key/value result map. */
  [key: string]: unknown;
}

export interface Task {
  id: string;
  missionId: string;
  /** Human-readable name, e.g. "Gather market data". */
  name: string;
  description: string;
  /** The specific thing this task needs to accomplish. */
  objective: string;
  capability: string;           // matched against AgentDefinition.capabilities
  status: TaskStatus;
  priority: TaskPriority;
  assignedAgentId?: string;     // AgentDefinition.id
  assignedInstanceId?: string;  // AgentControlBlock.instanceId
  /** Task IDs that must reach "completed" before this one starts. */
  dependsOn: string[];
  /** Task IDs that are blocked by this task. */
  blocks: string[];
  /** Number of execution attempts so far. */
  retryCount: number;
  maxRetries: number;
  input: TaskInput;
  output?: TaskOutput;
  errorMessage?: string;
  /** IDs of ExecutionRun records produced for this task. */
  executionRunIds: string[];
  /** If AWAITING_APPROVAL, the linked approval request ID. */
  approvalRequestId?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  metadata: Record<string, string>;
  tags: string[];
}

// ---------------------------------------------------------------------------
// Repository (in-memory; the Next.js API layer persists to JSON via store.ts)
// ---------------------------------------------------------------------------

export interface CreateTaskInput {
  missionId: string;
  name: string;
  description: string;
  objective: string;
  capability: string;
  priority?: TaskPriority;
  assignedAgentId?: string;
  dependsOn?: string[];
  input?: TaskInput;
  metadata?: Record<string, string>;
  tags?: string[];
  maxRetries?: number;
}

export function createTaskRecord(input: CreateTaskInput): Task {
  const now = new Date().toISOString();
  return {
    id: `tsk_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
    missionId: input.missionId,
    name: input.name,
    description: input.description,
    objective: input.objective,
    capability: input.capability,
    status: "pending",
    priority: input.priority ?? "normal",
    assignedAgentId: input.assignedAgentId,
    dependsOn: input.dependsOn ?? [],
    blocks: [],
    retryCount: 0,
    maxRetries: input.maxRetries ?? 3,
    input: input.input ?? {},
    executionRunIds: [],
    createdAt: now,
    updatedAt: now,
    metadata: input.metadata ?? {},
    tags: input.tags ?? [],
  };
}

// ---------------------------------------------------------------------------
// State machine
// ---------------------------------------------------------------------------

const VALID_TASK_TRANSITIONS: Record<TaskStatus, readonly TaskStatus[]> = {
  pending:             ["planning", "queued", "cancelled"],
  planning:            ["queued", "cancelled", "failed"],
  queued:              ["running", "paused", "cancelled"],
  running:             ["paused", "awaiting_approval", "completed", "failed", "cancelled"],
  waiting_dependency:  ["queued", "cancelled"],
  paused:              ["queued", "running", "cancelled"],
  awaiting_approval:   ["queued", "running", "cancelled", "failed"],
  completed:           [],
  failed:              ["queued", "cancelled"],
  cancelled:           [],
  skipped:             [],
};

export class TaskTransitionError extends Error {
  constructor(from: TaskStatus, to: TaskStatus, taskId: string) {
    super(`Task ${taskId}: invalid transition ${from} → ${to}`);
    this.name = "TaskTransitionError";
  }
}

export function assertValidTaskTransition(
  task: Task,
  to: TaskStatus,
): void {
  const allowed = VALID_TASK_TRANSITIONS[task.status];
  if (!allowed.includes(to)) {
    throw new TaskTransitionError(task.status, to, task.id);
  }
}

export function applyTaskTransition(task: Task, to: TaskStatus): Task {
  assertValidTaskTransition(task, to);
  const now = new Date().toISOString();
  const updates: Partial<Task> = { status: to, updatedAt: now };
  if (to === "running" && !task.startedAt) updates.startedAt = now;
  if (to === "completed" || to === "failed" || to === "cancelled") updates.completedAt = now;
  return { ...task, ...updates };
}

// ---------------------------------------------------------------------------
// In-memory store (used by kernel/scheduler; API layer delegates to store.ts)
// ---------------------------------------------------------------------------

class TaskRepository {
  private readonly tasks = new Map<string, Task>();

  add(task: Task): void { this.tasks.set(task.id, task); }

  get(id: string): Task | undefined { return this.tasks.get(id); }

  getRequired(id: string): Task {
    const t = this.tasks.get(id);
    if (!t) throw new Error(`Task '${id}' not found`);
    return t;
  }

  update(id: string, patch: Partial<Task>): Task {
    const existing = this.getRequired(id);
    const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    this.tasks.set(id, updated);
    return updated;
  }

  listByMission(missionId: string): Task[] {
    return [...this.tasks.values()].filter(t => t.missionId === missionId);
  }

  listReady(): Task[] {
    return [...this.tasks.values()].filter(t => {
      if (t.status !== "pending" && t.status !== "queued") return false;
      // All dependencies must be completed
      return t.dependsOn.every(depId => {
        const dep = this.tasks.get(depId);
        return dep?.status === "completed";
      });
    });
  }

  all(): Task[] { return [...this.tasks.values()]; }
}

export const taskRepository = new TaskRepository();
