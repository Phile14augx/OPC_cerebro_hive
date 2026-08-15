/**
 * @module kernel-core/scheduler
 * TaskScheduler — priority queue with dependency resolution.
 *
 * Scheduling semantics:
 *  - Tasks are enqueued with a numeric priority (0–1000; higher = more urgent).
 *  - A task is only eligible to dequeue when ALL its dependencies have reached
 *    "completed" status.
 *  - An optional `scheduledAt` field gates tasks to not dequeue before that time.
 *  - `reschedule` shifts a task's `scheduledAt` without removing it from the queue.
 *  - Priority queue is maintained as a sorted array (insertion O(n), dequeue O(1))
 *    which is correct for the expected queue sizes in a swarm kernel.
 */

import { randomUUID } from "crypto";
import type { SchedulerTask, SchedulerTaskStatus } from "./types.js";

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class SchedulerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SchedulerError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class TaskNotFoundError extends SchedulerError {
  constructor(taskId: string) {
    super(`Scheduler task not found: "${taskId}"`);
    this.name = "TaskNotFoundError";
  }
}

// ---------------------------------------------------------------------------
// Filter type
// ---------------------------------------------------------------------------

export interface SchedulerQueueFilter {
  agentId?: string;
  tenantId?: string;
  missionId?: string;
  status?: SchedulerTaskStatus;
  minPriority?: number;
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export interface SchedulerStats {
  pending: number;
  queued: number;
  assigned: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
  total: number;
}

// ---------------------------------------------------------------------------
// TaskScheduler
// ---------------------------------------------------------------------------

export class TaskScheduler {
  /**
   * All tasks known to this scheduler, keyed by taskId.
   * Canonical source of truth; the `_queue` is a derived sorted view.
   */
  private readonly tasks = new Map<string, SchedulerTask>();

  /**
   * Sorted priority queue of taskIds that are in "pending" or "queued" status.
   * Maintained in descending priority order (highest priority at index 0).
   */
  private queue: string[] = [];

  // -------------------------------------------------------------------------
  // Enqueue
  // -------------------------------------------------------------------------

  /**
   * Add a new task to the scheduler.
   * The task must have a unique `taskId`; duplicate IDs throw.
   */
  enqueue(task: SchedulerTask): void {
    if (this.tasks.has(task.taskId)) {
      throw new SchedulerError(
        `Task "${task.taskId}" is already known to the scheduler. Use setStatus to update it.`,
      );
    }

    const now = new Date().toISOString();
    const stored: SchedulerTask = {
      ...task,
      status: task.status === undefined ? "pending" : task.status,
      attempt: task.attempt ?? 1,
      maxAttempts: task.maxAttempts ?? 3,
      createdAt: task.createdAt ?? now,
      updatedAt: now,
    };

    this.tasks.set(stored.taskId, stored);
    this.insertIntoQueue(stored.taskId, stored.priority);
  }

  // -------------------------------------------------------------------------
  // Dequeue
  // -------------------------------------------------------------------------

  /**
   * Remove and return the highest-priority eligible task.
   *
   * A task is eligible when:
   *  1. Its status is "pending" or "queued".
   *  2. All its dependencies are "completed".
   *  3. Its `scheduledAt` (if set) is in the past.
   *  4. If `agentId` is specified, the task's `agentId` matches.
   */
  dequeue(agentId?: string): SchedulerTask | null {
    const now = Date.now();

    for (let i = 0; i < this.queue.length; i++) {
      const taskId = this.queue[i]!;
      const task = this.tasks.get(taskId);

      if (!task) {
        // Orphaned entry — clean up.
        this.queue.splice(i, 1);
        i--;
        continue;
      }

      // Status gate
      if (task.status !== "pending" && task.status !== "queued") {
        this.queue.splice(i, 1);
        i--;
        continue;
      }

      // Agent filter
      if (agentId !== undefined && task.agentId !== agentId) {
        continue;
      }

      // Scheduled time gate
      if (task.scheduledAt && new Date(task.scheduledAt).getTime() > now) {
        continue;
      }

      // Dependency gate
      if (!this.areDependenciesMet(task)) {
        continue;
      }

      // Task is eligible — remove from queue, update status.
      this.queue.splice(i, 1);
      task.status = "assigned";
      task.updatedAt = new Date().toISOString();

      return { ...task };
    }

    return null;
  }

  // -------------------------------------------------------------------------
  // Status management
  // -------------------------------------------------------------------------

  /**
   * Update the status of a known task.
   * Transitioning to a terminal status ("completed" | "failed" | "cancelled")
   * removes the task from the active queue.
   */
  setStatus(taskId: string, status: SchedulerTaskStatus): void {
    const task = this.requireTask(taskId);
    const previous = task.status;
    task.status = status;
    task.updatedAt = new Date().toISOString();

    // Remove from queue if it was eligible before and is now terminal/active.
    const activeStatuses: SchedulerTaskStatus[] = ["pending", "queued"];
    if (activeStatuses.includes(previous) && !activeStatuses.includes(status)) {
      const idx = this.queue.indexOf(taskId);
      if (idx !== -1) this.queue.splice(idx, 1);
    }

    // If re-queued (e.g. after a retry), ensure it is in the queue.
    if ((status === "pending" || status === "queued") && !this.queue.includes(taskId)) {
      this.insertIntoQueue(taskId, task.priority);
    }
  }

  // -------------------------------------------------------------------------
  // Queue inspection
  // -------------------------------------------------------------------------

  /**
   * Return all tasks matching the optional filter (does not modify the queue).
   */
  getQueue(filters?: SchedulerQueueFilter): SchedulerTask[] {
    let result = Array.from(this.tasks.values());

    if (!filters) return result.map((t) => ({ ...t }));

    if (filters.agentId !== undefined) {
      result = result.filter((t) => t.agentId === filters.agentId);
    }
    if (filters.tenantId !== undefined) {
      result = result.filter((t) => t.tenantId === filters.tenantId);
    }
    if (filters.missionId !== undefined) {
      result = result.filter((t) => t.missionId === filters.missionId);
    }
    if (filters.status !== undefined) {
      result = result.filter((t) => t.status === filters.status);
    }
    if (filters.minPriority !== undefined) {
      result = result.filter((t) => t.priority >= filters.minPriority!);
    }

    return result.map((t) => ({ ...t }));
  }

  /**
   * Return a specific task by ID.  Throws if not found.
   */
  getTask(taskId: string): SchedulerTask {
    return { ...this.requireTask(taskId) };
  }

  // -------------------------------------------------------------------------
  // Reschedule
  // -------------------------------------------------------------------------

  /**
   * Delay a pending/queued task by `delayMs` milliseconds.
   * Sets `scheduledAt` to now + delayMs and resets status to "pending".
   */
  reschedule(taskId: string, delayMs: number): void {
    const task = this.requireTask(taskId);

    const terminal: SchedulerTaskStatus[] = ["completed", "failed", "cancelled"];
    if (terminal.includes(task.status)) {
      throw new SchedulerError(
        `Cannot reschedule task "${taskId}" in terminal status "${task.status}".`,
      );
    }

    const newScheduledAt = new Date(Date.now() + delayMs).toISOString();
    task.scheduledAt = newScheduledAt;
    task.status = "pending";
    task.updatedAt = new Date().toISOString();

    // Ensure it is in the queue.
    if (!this.queue.includes(taskId)) {
      this.insertIntoQueue(taskId, task.priority);
    }
  }

  // -------------------------------------------------------------------------
  // Cancel
  // -------------------------------------------------------------------------

  /**
   * Cancel a task.  Idempotent if already cancelled.
   */
  cancel(taskId: string): void {
    const task = this.requireTask(taskId);
    if (task.status === "cancelled") return;

    const terminal: SchedulerTaskStatus[] = ["completed", "failed"];
    if (terminal.includes(task.status)) {
      throw new SchedulerError(
        `Cannot cancel task "${taskId}" that is already in terminal status "${task.status}".`,
      );
    }

    task.status = "cancelled";
    task.updatedAt = new Date().toISOString();

    const idx = this.queue.indexOf(taskId);
    if (idx !== -1) this.queue.splice(idx, 1);
  }

  // -------------------------------------------------------------------------
  // Retry
  // -------------------------------------------------------------------------

  /**
   * Increment the attempt counter and re-enqueue the task as "pending".
   * Throws if the task has exceeded `maxAttempts`.
   */
  retry(taskId: string, delayMs = 0): void {
    const task = this.requireTask(taskId);

    if (task.attempt >= task.maxAttempts) {
      throw new SchedulerError(
        `Task "${taskId}" has exhausted all ${task.maxAttempts} attempts.`,
      );
    }

    task.attempt += 1;
    task.status = "pending";
    task.scheduledAt = delayMs > 0 ? new Date(Date.now() + delayMs).toISOString() : undefined;
    task.updatedAt = new Date().toISOString();

    if (!this.queue.includes(taskId)) {
      this.insertIntoQueue(taskId, task.priority);
    }
  }

  // -------------------------------------------------------------------------
  // Stats
  // -------------------------------------------------------------------------

  /**
   * Return aggregate counts by status.
   */
  getStats(): SchedulerStats {
    const stats: SchedulerStats = {
      pending: 0,
      queued: 0,
      assigned: 0,
      running: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      total: this.tasks.size,
    };

    for (const task of this.tasks.values()) {
      stats[task.status] = (stats[task.status] ?? 0) + 1;
    }

    return stats;
  }

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------

  /**
   * Insert a taskId into the sorted queue at the correct position
   * (descending priority order, secondary sort by creation time ascending).
   */
  private insertIntoQueue(taskId: string, priority: number): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const insertionPriority = priority;
    const insertionCreatedAt = task.createdAt;

    let lo = 0;
    let hi = this.queue.length;

    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      const midTask = this.tasks.get(this.queue[mid]!);
      if (!midTask) {
        hi = mid;
        continue;
      }
      const midPriority = midTask.priority;
      if (midPriority > insertionPriority) {
        lo = mid + 1;
      } else if (midPriority === insertionPriority) {
        // Earlier creation time has higher scheduling preference.
        if (midTask.createdAt <= insertionCreatedAt) {
          lo = mid + 1;
        } else {
          hi = mid;
        }
      } else {
        hi = mid;
      }
    }

    this.queue.splice(lo, 0, taskId);
  }

  /**
   * Returns `true` if all dependency taskIds have status "completed".
   */
  private areDependenciesMet(task: SchedulerTask): boolean {
    for (const depId of task.dependencies) {
      const dep = this.tasks.get(depId);
      if (!dep || dep.status !== "completed") {
        return false;
      }
    }
    return true;
  }

  private requireTask(taskId: string): SchedulerTask {
    const task = this.tasks.get(taskId);
    if (!task) throw new TaskNotFoundError(taskId);
    return task;
  }

  // -------------------------------------------------------------------------
  // Bulk helpers
  // -------------------------------------------------------------------------

  /**
   * Remove all tasks in terminal states to reclaim memory.
   */
  purgeTerminal(): number {
    const terminal: SchedulerTaskStatus[] = ["completed", "failed", "cancelled"];
    let removed = 0;

    for (const [taskId, task] of this.tasks.entries()) {
      if (terminal.includes(task.status)) {
        this.tasks.delete(taskId);
        removed++;
      }
    }

    // Rebuild queue from remaining tasks (O(n log n) but infrequent operation).
    this.rebuildQueue();
    return removed;
  }

  private rebuildQueue(): void {
    this.queue = [];
    for (const task of this.tasks.values()) {
      if (task.status === "pending" || task.status === "queued") {
        this.insertIntoQueue(task.taskId, task.priority);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Factory helper
// ---------------------------------------------------------------------------

/**
 * Create a minimal SchedulerTask with sensible defaults.
 */
export function createSchedulerTask(
  partial: Partial<SchedulerTask> & Pick<SchedulerTask, "missionId" | "agentId" | "tenantId">,
): SchedulerTask {
  const now = new Date().toISOString();
  return {
    taskId: partial.taskId ?? randomUUID(),
    missionId: partial.missionId,
    instanceId: partial.instanceId,
    agentId: partial.agentId,
    tenantId: partial.tenantId,
    priority: partial.priority ?? 500,
    scheduledAt: partial.scheduledAt,
    recurringCron: partial.recurringCron,
    dependencies: partial.dependencies ?? [],
    status: partial.status ?? "pending",
    attempt: partial.attempt ?? 1,
    maxAttempts: partial.maxAttempts ?? 3,
    createdAt: partial.createdAt ?? now,
    updatedAt: now,
  };
}
