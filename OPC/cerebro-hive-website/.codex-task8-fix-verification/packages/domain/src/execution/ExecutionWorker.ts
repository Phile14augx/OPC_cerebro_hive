import { Execution } from './Execution';
import { ExecutionId } from './ExecutionId';
import { ExecutionRepository } from './ExecutionRepository';
import { ExecutionOrchestrator } from './ExecutionOrchestrator';
import { ExecutionLeaseStore } from './ExecutionLease';
import { ExecutionLeaseHeartbeat } from './ExecutionLeaseHeartbeat';
import { TimerSource } from './Timer';
import { NotFoundError } from '../errors/DomainError';

/**
 * Phase 9g-3 — a real worker: the component that actually holds ownership
 * of an in-flight Execution for the FULL duration of a potentially
 * long-running provider call, via `ExecutionLeaseHeartbeat` (heartbeat
 * renewal), rather than `ExecutionOrchestrator.resumeOwned()`'s simpler
 * acquire-once/release-after pattern (`ADR-045`), which is fine for short
 * work but risks the lease expiring mid-flight otherwise. This class is the
 * intended real caller for anything expected to run longer than a single
 * lease duration; `resumeOwned()` remains the right choice for short,
 * bounded work that doesn't need a heartbeat.
 *
 * SCOPE BOUNDARY: this is a single-process worker abstraction — real
 * composition of 9f/9g-1/9g-2's already-built contracts (leases, the
 * orchestrator, cooperative cancellation), not a distributed worker fleet.
 * Multiple `ExecutionWorker` instances running in separate processes would
 * correctly avoid double-processing the same Execution (the lease contract
 * itself already guarantees that — `ADR-045`), but nothing here starts,
 * supervises, or load-balances across such a fleet; that remains explicit,
 * deferred, future live-wiring work.
 */
export interface ExecutionWorkerOptions {
  readonly leaseDurationMs?: number;
  readonly timerSource?: TimerSource;
  readonly heartbeatIntervalMs?: number;
}

const DEFAULT_LEASE_DURATION_MS = 60_000;

export class ExecutionWorker {
  private readonly leaseDurationMs: number;
  private readonly timerSource?: TimerSource;
  private readonly heartbeatIntervalMs?: number;

  constructor(
    private readonly orchestrator: ExecutionOrchestrator,
    private readonly repository: ExecutionRepository,
    private readonly leaseStore: ExecutionLeaseStore,
    private readonly owner: string,
    opts: ExecutionWorkerOptions = {}
  ) {
    this.leaseDurationMs = opts.leaseDurationMs ?? DEFAULT_LEASE_DURATION_MS;
    this.timerSource = opts.timerSource;
    this.heartbeatIntervalMs = opts.heartbeatIntervalMs;
  }

  /** Loads, leases, and resumes a WAITING Execution — holding the lease,
   * renewed via heartbeat, for the entire duration of the resulting
   * provider call, not just the moment `resume()` is invoked. Releases the
   * lease (and stops the heartbeat) whether `resume()` succeeds or throws.
   * Throws `NotFoundError` if no Execution exists for `executionId` (a real,
   * surfaced error — not silently returning `undefined`, since a worker
   * being handed a nonexistent id to work on is itself a real condition
   * worth failing loudly on). */
  async resume(executionId: ExecutionId): Promise<Execution> {
    await this.leaseStore.acquire(executionId, this.owner, this.leaseDurationMs);
    const heartbeat = new ExecutionLeaseHeartbeat(this.leaseStore, executionId, this.owner, this.leaseDurationMs, {
      timerSource: this.timerSource,
      heartbeatIntervalMs: this.heartbeatIntervalMs,
    });
    heartbeat.start();

    try {
      const execution = await this.repository.load(executionId);
      if (!execution) {
        throw new NotFoundError(`No Execution found for id ${executionId.toString()}.`);
      }
      return await this.orchestrator.resume(execution);
    } finally {
      heartbeat.stop();
      await this.leaseStore.release(executionId, this.owner);
    }
  }

  /** Requests cooperative cancellation of `execution` as this worker
   * (`this.owner` becomes the transition's recorded actor). Delegates
   * directly to `ExecutionOrchestrator.requestCancellation()` (`ADR-044`) —
   * the actual cancellation mechanism (`ExecutionCancellationTokenSource`/
   * `ExecutionCancellationSignal`) already exists and is not reinvented
   * here; this method exists only so a worker's own caller has one obvious,
   * named entry point for it. */
  async requestCancellation(execution: Execution, opts: { reason?: string } = {}): Promise<Execution> {
    return this.orchestrator.requestCancellation(execution, { actor: this.owner, reason: opts.reason });
  }
}
