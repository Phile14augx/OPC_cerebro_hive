/**
 * Phase 9f-1 — a cooperative cancellation primitive, deliberately mirroring
 * the standard `AbortController`/`AbortSignal` split: `ExecutionOrchestrator`
 * holds the full `ExecutionCancellationTokenSource` (it alone may request
 * cancellation), while an `ExecutionProviderPort` implementation is only
 * ever handed the read-only `ExecutionCancellationSignal` view (it may
 * observe, not request). This is real, reusable cooperative-cancellation
 * infrastructure, not a test double — the equivalent of the standard
 * `AbortController` pattern, scoped to this aggregate's vocabulary.
 *
 * SCOPE BOUNDARY: this is single-process, in-memory, best-effort
 * cancellation — "the orchestrator noticed and stopped driving further
 * transitions," not a distributed preemption/lease-revocation mechanism.
 * Cross-process cancellation propagation (e.g. a worker on another node
 * actually stopping) is explicitly out of scope for 9f and belongs to a
 * future live-runtime integration milestone (9g) built against a real
 * execution-ownership/lease model (9f-2), which this primitive does not
 * attempt to be.
 */
export interface ExecutionCancellationSignal {
  readonly isCancellationRequested: boolean;
  readonly reason?: string;
}

export class ExecutionCancellationTokenSource implements ExecutionCancellationSignal {
  private _isCancellationRequested = false;
  private _reason?: string;

  get isCancellationRequested(): boolean {
    return this._isCancellationRequested;
  }

  get reason(): string | undefined {
    return this._reason;
  }

  /** Idempotent — requesting cancellation twice keeps the first reason. */
  requestCancellation(reason?: string): void {
    if (this._isCancellationRequested) {
      return;
    }
    this._isCancellationRequested = true;
    this._reason = reason;
  }
}
