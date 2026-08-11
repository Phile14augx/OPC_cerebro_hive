import { ExecutionId } from './ExecutionId';
import { ExecutionLeaseStore } from './ExecutionLease';
import { TimerHandle, TimerSource, RealTimerSource } from './Timer';

/**
 * Phase 9g-3 — closes a real gap `ExecutionOrchestrator.resumeOwned()`
 * (Phase 9f-2/`ADR-045`) left open: that method acquires a lease once and
 * releases it after `resume()` returns, with no renewal in between. Fine
 * for short work; if the provider call runs longer than `leaseDurationMs`,
 * the lease can expire while legitimately still being worked on, letting a
 * second worker incorrectly acquire it out from under the first. A
 * heartbeat — periodically renewing the lease while work is still in
 * flight — is the standard fix, the same pattern distributed job queues and
 * container orchestrators use for long-running work under a lease/liveness
 * model.
 *
 * Defaults `heartbeatIntervalMs` to half of `leaseDurationMs` — a
 * conventional safety margin (renew well before expiry, not right at the
 * edge, so a single missed/delayed renewal doesn't immediately lose the
 * lease).
 */
export interface ExecutionLeaseHeartbeatOptions {
  readonly heartbeatIntervalMs?: number;
  readonly timerSource?: TimerSource;
  /** Called if a renewal attempt fails (e.g. the lease was lost/expired
   * before this heartbeat could renew it). Not calling this is not silent
   * failure — `ExecutionLeaseStore.renew()`'s own `ConflictError` still
   * propagates to whatever awaits the renewal promise; this callback exists
   * so a caller can additionally observe it without needing to await
   * anything (the heartbeat's renewal calls are fire-and-forget from
   * `start()`'s own perspective, since nothing here blocks the timer loop
   * waiting for a renewal to finish). */
  readonly onRenewalFailure?: (error: unknown) => void;
}

export class ExecutionLeaseHeartbeat {
  private handle?: TimerHandle;
  private readonly timerSource: TimerSource;
  private readonly heartbeatIntervalMs: number;
  private readonly onRenewalFailure?: (error: unknown) => void;

  constructor(
    private readonly leaseStore: ExecutionLeaseStore,
    private readonly executionId: ExecutionId,
    private readonly owner: string,
    private readonly leaseDurationMs: number,
    opts: ExecutionLeaseHeartbeatOptions = {}
  ) {
    this.timerSource = opts.timerSource ?? new RealTimerSource();
    this.heartbeatIntervalMs = opts.heartbeatIntervalMs ?? Math.max(1, Math.floor(leaseDurationMs / 2));
    this.onRenewalFailure = opts.onRenewalFailure;
  }

  /** Idempotent — calling `start()` while already started is a no-op, not a
   * second timer. */
  start(): void {
    if (this.handle !== undefined) {
      return;
    }
    this.handle = this.timerSource.setInterval(() => {
      this.leaseStore.renew(this.executionId, this.owner, this.leaseDurationMs).catch((err) => {
        this.onRenewalFailure?.(err);
      });
    }, this.heartbeatIntervalMs);
  }

  /** Idempotent — calling `stop()` when not started (or twice) is a no-op. */
  stop(): void {
    if (this.handle !== undefined) {
      this.timerSource.clearInterval(this.handle);
      this.handle = undefined;
    }
  }
}
