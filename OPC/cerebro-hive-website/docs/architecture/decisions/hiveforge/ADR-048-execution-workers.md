# ADR-048: Execution Workers — Lease Heartbeat, Cooperative Cancellation Delegation (Phase 9g-3)

**Status:** Proposed (Phase 9g-3 of `09-EXECUTION-LIFECYCLE-RUNTIME.md`; builds on `ADR-039` through `ADR-047`)

## Context

`ADR-045`'s `ExecutionOrchestrator.resumeOwned()` acquires a lease once, calls `resume()`, and releases the lease afterward — a real gap, named but not fixed at the time: if the resulting provider call runs longer than `leaseDurationMs`, the lease can expire while the Execution is legitimately still being worked on, letting a second worker incorrectly acquire it. `ADR-047`'s `ExecutionScheduler` proactively drives WAITING Executions forward via that same `resumeOwned()` path, inheriting the same gap. 9g-3's job is closing it: a real worker abstraction that holds a lease for the FULL duration of long-running work via periodic renewal ("heartbeat"), plus a clear, named entry point for cooperative cancellation — matching the user's own proposed 9g-3 scope ("execution workers, lease acquisition, heartbeat renewal, cooperative cancellation").

Per the same standalone discipline as 9g-1/9g-2: real, standalone components, deterministically verified, with a real timer ABSTRACTION (not real `setInterval` waits) so tests never depend on elapsed wall-clock time — the same reasoning `Clock.ts` already established for "now."

## Decision

**1. `TimerSource` (`Timer.ts`) abstracts "run this repeatedly" the same way `Clock.ts` abstracts "what time is it."** `RealTimerSource` is the real, production default (a thin wrapper over the global `setInterval`/`clearInterval`); tests use a fake that fires its registered callback on command instead of waiting on real elapsed time.

**2. `ExecutionLeaseHeartbeat` (`ExecutionLeaseHeartbeat.ts`) is a real, standalone heartbeat: it periodically calls `ExecutionLeaseStore.renew()` (`ADR-045`) at `heartbeatIntervalMs` (default: half of `leaseDurationMs`, a conventional safety margin — renew well before expiry, not at the edge).** `start()`/`stop()` are both idempotent. Renewal failures (e.g. the lease was already lost to another owner) are reported via an optional `onRenewalFailure` callback rather than silently swallowed — the heartbeat's own renewal calls are fire-and-forget from the timer loop's perspective (nothing blocks the interval waiting on a renewal promise), so this callback is the only way a caller observes a failed renewal without itself polling.

**3. `ExecutionWorker` (`ExecutionWorker.ts`) composes lease acquisition, the heartbeat, and `ExecutionOrchestrator.resume()` into the real long-running-work path** — superseding `resumeOwned()` for anything expected to run longer than a single lease duration; `resumeOwned()` remains the correct, simpler choice for short, bounded work that doesn't need a heartbeat. `ExecutionWorker.resume()` loads the Execution itself (throwing the pre-existing `NotFoundError` — `DomainError.ts`, previously unused in this package — for an unknown id, a real, surfaced failure rather than a silent `undefined`), and always stops the heartbeat and releases the lease in a `finally` block, whether `resume()` succeeds or throws.

**4. `ExecutionWorker.requestCancellation()` is a thin, named delegation to `ExecutionOrchestrator.requestCancellation()` (`ADR-044`), not a new cancellation mechanism.** The real mechanism (`ExecutionCancellationTokenSource`/`ExecutionCancellationSignal`) already exists; this method exists only so a worker's own caller has one obvious entry point that records the worker itself (`this.owner`) as the transition's actor.

**5. Scope boundary, stated explicitly (not implied): this is a single-process worker abstraction.** The lease contract itself (`ADR-045`) already guarantees multiple `ExecutionWorker` instances in separate processes would correctly avoid double-processing the same Execution — but nothing here starts, supervises, or load-balances across such a fleet. That remains explicit, deferred, future live-wiring work (a later 9g sub-phase or 9g-6's end-to-end integration), not built or claimed here.

## Consequences — Implemented / Verified / Deferred

**Implemented:**
- `TimerSource`/`RealTimerSource`, `ExecutionLeaseHeartbeat`, `ExecutionWorker`.
- The heartbeat mechanism itself — the first real fix for the lease-expiring-mid-flight gap `ADR-045` named but did not close.

**Verified (in this sandbox):**
- Real `tsc --strict` typecheck — clean across the whole `execution/` package, including all three new files.
- Real `vitest` run — **149/149 tests passing** across the whole `execution/` package (8 new, in `ExecutionWorker.test.ts`): a heartbeat renewing a lease past its original duration once fired, `stop()` correctly halting further renewals, `start()`'s idempotency, a failed renewal correctly surfacing via `onRenewalFailure` (not swallowed), `ExecutionWorker.resume()`'s full acquire→resume→release cycle, the lease surviving a genuinely long-running provider call (elapsed time exceeding the original lease duration, kept alive by a mid-flight heartbeat fire), `NotFoundError` on an unknown execution id (with the lease still correctly released), and `requestCancellation()`'s delegation recording the worker as actor — all against a deterministic fake clock and a manually-driven fake `TimerSource`, no real timers anywhere in this verification.

**Deferred (explicitly, not glossed over):**
- Any real multi-process worker fleet — starting, supervising, health-checking, or load-balancing across multiple `ExecutionWorker` instances.
- A durable, shared work-assignment mechanism (which worker picks up which due Execution) — 9g-2's `ExecutionScheduler`/`ExecutionScheduleQueue` remain single-process; a distributed version is a future sub-phase's job.
- Real elapsed-time heartbeat behavior — every test here manually fires the timer callback; no test waits on a real `setInterval`.
- Production load characteristics (heartbeat overhead at scale, renewal contention under many concurrent workers).

## Implementation status — Complete for 9g-3's own (standalone) scope; no live multi-process worker fleet, real timers, or distributed work-assignment built

New files: `packages/domain/src/execution/{Timer.ts, ExecutionLeaseHeartbeat.ts, ExecutionWorker.ts}`, all exported from `packages/domain`'s root `index.ts`. No existing Phase 9 file was modified — 9g-3 is purely additive, composing already-existing public APIs (`ExecutionLeaseStore.renew()`, `ExecutionOrchestrator.resume()`/`requestCancellation()`) rather than changing any of them. Scratch verification artifacts removed after the run. Not yet done, and not claimed as done: 9g-4 (Event Delivery) through 9g-6 (End-to-End) remain future, separate sub-phases.
