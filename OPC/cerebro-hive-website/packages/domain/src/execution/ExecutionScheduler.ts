import { Execution } from './Execution';
import { ExecutionId } from './ExecutionId';
import { ExecutionStatus } from './ExecutionStatus';
import { ExecutionOrchestrator, RunExecutionInput } from './ExecutionOrchestrator';
import { ExecutionRepository } from './ExecutionRepository';
import { ExecutionScheduleQueue } from './ExecutionScheduleQueue';
import { Clock, SystemClock } from './Clock';
import { ExecutionFailureClass } from './ExecutionFailureClassification';
import { ExecutionRetryPolicy, NeverRetryPolicy } from './ExecutionRetryPolicy';

/**
 * Phase 9g-2 — the first component that actually EXERCISES 9f's contracts
 * (leases, idempotency's sibling concern, retry policy, timeout) rather than
 * merely defining them: `ExecutionScheduler` is what decides *when* a
 * delayed run, a retry, or a proactive timeout check should happen, and
 * drives `ExecutionOrchestrator` accordingly once that time arrives.
 *
 * SCOPE BOUNDARY (read before extending this class): `tick()` processes
 * every currently-due task exactly once — it is the unit of work a real
 * recurring process (a cron job, a `setInterval` loop, a durable queue
 * consumer) would call repeatedly. **Nothing in this class starts such a
 * process itself.** No `setInterval`, no live cron, no HA leader-election
 * for "which instance runs the scheduler" — all of that is live-wiring
 * work for a later 9g sub-phase, deliberately not built here, the same
 * standalone discipline every prior Phase 9 sub-phase used.
 *
 * Also deliberately NOT covered: proactively interrupting a RUNNING
 * Execution whose timeout deadline passes mid-provider-call. That already
 * happens reactively inside `ExecutionOrchestrator.invokeProviderAndFinalize()`
 * once the in-flight call returns (`ADR-044`) — this scheduler's own
 * `timeout-check` task only re-drives a WAITING Execution (via
 * `resumeOwned()`), since a WAITING Execution has no in-flight call to wait
 * on and would otherwise sit past its deadline forever until something else
 * happens to call `resume()`.
 */
export interface ExecutionSchedulerOptions {
  readonly clock?: Clock;
  readonly retryPolicy?: ExecutionRetryPolicy;
  /** Identifies this scheduler instance as a lease owner when it drives a
   * WAITING Execution forward via `resumeOwned()` — distinct schedulers (or
   * scheduler replicas, in a future multi-instance deployment) should use
   * distinct owners so contention is real, not accidental self-conflict. */
  readonly leaseOwner?: string;
  readonly leaseDurationMs?: number;
}

export class ExecutionScheduler {
  private readonly clock: Clock;
  private readonly retryPolicy: ExecutionRetryPolicy;
  private readonly leaseOwner: string;
  private readonly leaseDurationMs: number;

  constructor(
    private readonly orchestrator: ExecutionOrchestrator,
    private readonly repository: ExecutionRepository,
    private readonly queue: ExecutionScheduleQueue,
    opts: ExecutionSchedulerOptions = {}
  ) {
    this.clock = opts.clock ?? new SystemClock();
    this.retryPolicy = opts.retryPolicy ?? new NeverRetryPolicy();
    this.leaseOwner = opts.leaseOwner ?? 'execution-scheduler';
    this.leaseDurationMs = opts.leaseDurationMs ?? 60_000;
  }

  /** Enqueues a fresh Execution to start no earlier than `runAt` — real
   * delayed-execution scheduling. The `run()` call itself does not happen
   * until a `tick()` finds this task due. */
  async scheduleRun(input: RunExecutionInput, runAt: Date): Promise<void> {
    await this.queue.enqueue({ kind: 'run', dueAt: runAt, input });
  }

  /** Enqueues a proactive timeout check for a WAITING Execution at
   * `deadline`. */
  async scheduleTimeoutCheck(executionId: ExecutionId, deadline: Date): Promise<void> {
    await this.queue.enqueue({ kind: 'timeout-check', dueAt: deadline, executionId });
  }

  /** Enqueues a retry-eligibility check for `original` (a terminal
   * Execution), honoring the injected `ExecutionRetryPolicy.retryDelayMs()`
   * if it defines one (default: due immediately, i.e. at the next `tick()`).
   * Does not itself decide whether to retry — that's `retryIfEligible()`'s
   * job, deferred until the task is actually due, since eligibility (e.g.
   * failure classification) is only meaningful to (re-)evaluate at
   * process time, not enqueue time. */
  async scheduleRetry(original: Execution, attempt: number, failureClass: ExecutionFailureClass): Promise<void> {
    const delayMs = this.retryPolicy.retryDelayMs?.({ execution: original, failureClass, attempt }) ?? 0;
    const dueAt = new Date(this.clock.now().getTime() + delayMs);
    await this.queue.enqueue({ kind: 'retry', dueAt, executionId: original.id, attempt });
  }

  /** Processes every currently-due task exactly once. See this class's own
   * scope-boundary doc comment: this method is the "one tick" of work a real
   * recurring process would call repeatedly — nothing here starts such a
   * process. */
  async tick(): Promise<void> {
    const due = await this.queue.pollDue(this.clock.now());
    for (const task of due) {
      switch (task.kind) {
        case 'run':
          await this.orchestrator.run(task.input);
          break;
        case 'timeout-check':
          await this.processTimeoutCheck(task.executionId);
          break;
        case 'retry':
          await this.processRetry(task.executionId, task.attempt);
          break;
      }
    }
  }

  private async processTimeoutCheck(executionId: ExecutionId): Promise<void> {
    const execution = await this.repository.load(executionId);
    if (!execution || execution.isTerminal) {
      // Already resolved by some other path (e.g. a caller resumed it
      // directly) — nothing left for the scheduler to do.
      return;
    }
    if (execution.status === ExecutionStatus.Waiting) {
      await this.orchestrator.resumeOwned(execution, {
        owner: this.leaseOwner,
        leaseDurationMs: this.leaseDurationMs,
      });
    }
  }

  private async processRetry(executionId: ExecutionId, attempt: number): Promise<void> {
    const original = await this.repository.load(executionId);
    if (!original || !original.isTerminal) {
      // Nothing to retry — either already retried by another path, or not
      // (yet, or no longer) in a terminal status.
      return;
    }
    await this.orchestrator.retryIfEligible(original, { attempt });
  }
}
