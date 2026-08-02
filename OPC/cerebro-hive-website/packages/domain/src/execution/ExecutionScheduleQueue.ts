import { ExecutionId } from './ExecutionId';
import { RunExecutionInput } from './ExecutionOrchestrator';

/**
 * Phase 9g-2 — the "what needs attention, and when" contract
 * `ExecutionScheduler.ts` drives. Three concrete task shapes, not a loose
 * `payload: unknown` bag, so each kind stays type-checked end to end:
 * - `run` — a fresh Execution should start no earlier than `dueAt` (real
 *   delayed-execution scheduling).
 * - `retry` — a terminal Execution should be re-evaluated for retry no
 *   earlier than `dueAt` (honoring `ExecutionRetryPolicy.retryDelayMs()`,
 *   Phase 9f-2/`ADR-045`, which nothing before this phase actually enforced).
 * - `timeout-check` — a WAITING Execution should be proactively checked
 *   against its deadline no earlier than `dueAt`, rather than only being
 *   checked reactively the next time something happens to call `resume()`.
 *
 * SCOPE BOUNDARY: this is a standalone, in-memory scheduling contract, same
 * status as `InMemoryExecutionRepository`/`InMemoryExecutionLeaseStore` —
 * real, usable, but single-process. A durable, multi-process-visible queue
 * (Postgres-backed, Redis-backed, or a real job-queue library) is
 * `packages/execution-runtime-adapters`' job in a future sub-phase, not
 * built here.
 */
export interface RunScheduledTask {
  readonly kind: 'run';
  readonly dueAt: Date;
  readonly input: RunExecutionInput;
}

export interface RetryScheduledTask {
  readonly kind: 'retry';
  readonly dueAt: Date;
  readonly executionId: ExecutionId;
  readonly attempt: number;
}

export interface TimeoutCheckScheduledTask {
  readonly kind: 'timeout-check';
  readonly dueAt: Date;
  readonly executionId: ExecutionId;
}

export type ExecutionScheduledTask = RunScheduledTask | RetryScheduledTask | TimeoutCheckScheduledTask;

export interface ExecutionScheduleQueue {
  enqueue(task: ExecutionScheduledTask): Promise<void>;
  /** Returns every task whose `dueAt` is at or before `now`, atomically
   * removing them from the queue (a task is handed to exactly one
   * `pollDue()` caller, not re-returned by a later poll). */
  pollDue(now: Date): Promise<readonly ExecutionScheduledTask[]>;
}

/** Standalone, in-memory reference implementation — real, not a test
 * double, same status as this phase's other `InMemory*` classes. */
export class InMemoryExecutionScheduleQueue implements ExecutionScheduleQueue {
  private tasks: ExecutionScheduledTask[] = [];

  async enqueue(task: ExecutionScheduledTask): Promise<void> {
    this.tasks.push(task);
  }

  async pollDue(now: Date): Promise<readonly ExecutionScheduledTask[]> {
    const nowMs = now.getTime();
    const due = this.tasks.filter((task) => task.dueAt.getTime() <= nowMs);
    this.tasks = this.tasks.filter((task) => task.dueAt.getTime() > nowMs);
    return due.sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
  }

  /** Exposed for tests/introspection — not part of the shared contract. */
  get pendingCount(): number {
    return this.tasks.length;
  }
}
