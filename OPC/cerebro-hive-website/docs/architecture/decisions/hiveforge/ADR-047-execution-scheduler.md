# ADR-047: Execution Scheduler — Delayed Runs, Proactive Timeout, Retry Scheduling (Phase 9g-2)

**Status:** Proposed (Phase 9g-2 of `09-EXECUTION-LIFECYCLE-RUNTIME.md`; builds on `ADR-039` through `ADR-046`)

## Context

`ADR-046` (9g-1) built production adapters for leases and idempotency, but nothing yet *exercises* them, or the retry/timeout contracts `ADR-044`/`ADR-045` defined: `ExecutionOrchestrator.retryIfEligible()`, `resumeOwned()`, and its reactive timeout checks only run when something already calls them — nothing decides *when* a delayed run should start, when a retry should be attempted, or proactively checks a WAITING Execution's deadline if nobody happens to call `resume()` again. Per the same standalone discipline as every prior sub-phase (confirmed explicitly before starting): 9g-2 defines a real scheduler and its own in-memory reference queue, verified deterministically, without starting any live recurring process (a cron job, a `setInterval` loop, an HA leader-election mechanism) — that remains explicit, deferred, not-yet-done work for a later 9g sub-phase.

## Decision

**1. `ExecutionScheduleQueue` (`ExecutionScheduleQueue.ts`) is the "what needs attention, and when" contract**, with three concrete, type-safe task shapes rather than a loose `payload: unknown` bag: `RunScheduledTask` (a fresh Execution due no earlier than `dueAt` — real delayed-execution scheduling), `RetryScheduledTask` (a terminal Execution's retry-eligibility due for re-evaluation), and `TimeoutCheckScheduledTask` (a WAITING Execution's deadline due for a proactive check). `pollDue(now)` atomically removes and returns every task due at or before `now` — a task is handed to exactly one caller, not re-returned by a later poll. `InMemoryExecutionScheduleQueue` is a real, standalone reference implementation, the same status as this phase's other `InMemory*` classes (not a test double).

**2. `ExecutionScheduler` (`ExecutionScheduler.ts`) composes `ExecutionOrchestrator` + `ExecutionRepository` + `ExecutionScheduleQueue` + an injected `Clock` to decide and act on timing**, via `scheduleRun()`, `scheduleRetry()`, `scheduleTimeoutCheck()`, and a single `tick()` that processes everything currently due. `scheduleRetry()` honors `ExecutionRetryPolicy.retryDelayMs()` (`ADR-045`) if the injected policy defines one — the first real caller of a method every prior phase left defined but unenforced. Retry *eligibility* itself (failure classification, attempt-cap checking) is deliberately re-evaluated at `tick()` time via `retryIfEligible()`, not decided at `scheduleRetry()`-call time, since eligibility is only meaningful to check when the task actually becomes due, not when it's first enqueued.

**3. `tick()` is the explicit, sole unit of scheduled work — not a recurring process.** It processes every currently-due task exactly once and returns; nothing in this class calls it repeatedly, starts a timer, or elects a leader among multiple scheduler instances. This is a deliberate scope boundary, matching the "standalone contract, deferred live wiring" pattern every Phase 9 sub-phase has used — see the Implemented/Verified/Deferred breakdown below.

**4. Proactive timeout checking is scoped to WAITING Executions only, not RUNNING ones.** A RUNNING Execution's timeout is already checked reactively inside `ExecutionOrchestrator.invokeProviderAndFinalize()` once its in-flight provider call returns (`ADR-044`) — there is no in-flight call for the scheduler to interrupt proactively without a real cancellation-propagation mechanism reaching wherever that provider call is actually executing (a distributed concern, explicitly deferred to a later 9g sub-phase, not invented here). A WAITING Execution has no such in-flight call, so without a proactive check it would sit past its deadline indefinitely until something else happened to call `resume()` — `scheduleTimeoutCheck()` closes exactly that gap, via a leased `resumeOwned()` call (`ADR-045`) so concurrent scheduler instances don't race to resume the same Execution.

**5. This scheduler lives in `packages/domain` alongside 9a-9f's other contracts, not in `packages/execution-runtime-adapters`.** It composes only `packages/domain` concepts (`ExecutionOrchestrator`, `ExecutionRepository`, `Clock`) and needs no infrastructure client library — the same reasoning that put `InMemoryExecutionRepository`/`InMemoryExecutionLeaseStore` in `packages/domain` itself rather than the adapters package. A durable, multi-process-visible queue (Postgres- or Redis-backed) is `packages/execution-runtime-adapters`' job in a future sub-phase, not built here.

## Consequences — Implemented / Verified / Deferred (stated explicitly, per direction)

**Implemented:**
- `ExecutionScheduleQueue` contract + `InMemoryExecutionScheduleQueue`.
- `ExecutionScheduler`: `scheduleRun()`, `scheduleRetry()`, `scheduleTimeoutCheck()`, `tick()`.
- Real use of `ExecutionRetryPolicy.retryDelayMs()` and lease-gated `resumeOwned()` — both previously defined, unenforced.

**Verified (in this sandbox):**
- Real `tsc --strict` typecheck (scratch-toolchain pattern) — clean across the whole `execution/` package, including both new files.
- Real `vitest` run — **141/141 tests passing** across the whole `execution/` package (9 new, in `ExecutionScheduler.test.ts`): a scheduled run not firing before its due time and firing once due, a WAITING Execution being proactively resumed via a leased `resumeOwned()` once its deadline passes (and remaining untouched before then), a timeout-check being a no-op against an already-terminal Execution, a scheduled retry actually producing a real child Execution once due, a retry being correctly declined once the attempt cap is reached, a retry being a no-op against a non-terminal Execution, `retryDelayMs()` correctly delaying when a retry becomes due, and multiple due tasks all being processed within a single `tick()` call — all against a deterministic fake clock, the real in-memory queue/repository/lease-store, and fake providers. No real timers (`setInterval`/`setTimeout`) were used anywhere in this verification; every "due" transition was driven by manually advancing the fake clock between explicit `tick()` calls.

**Deferred (explicitly, not glossed over):**
- Any real recurring process actually calling `tick()` on a live schedule (a cron job, a `setInterval` loop, a durable queue-consumer process).
- Multi-process/multi-instance scheduling — whether two scheduler instances would correctly avoid double-processing the same due task (the in-memory queue is single-process by construction; a durable, atomically-poppable shared queue is required for this and does not exist yet).
- HA scheduler leader-election — which instance is "the" scheduler in a multi-instance deployment.
- Production load characteristics — how many due tasks `tick()` can process per invocation, queue growth under sustained load, backpressure.
- A Postgres/Redis-backed `ExecutionScheduleQueue` (packages/execution-runtime-adapters' future job, not this ADR's).

## Implementation status — Complete for 9g-2's own (standalone) scope; no live recurring process, multi-instance deployment, or durable shared queue built

New files: `packages/domain/src/execution/{ExecutionScheduleQueue.ts, ExecutionScheduler.ts}`, both exported from `packages/domain`'s root `index.ts`. No existing Phase 9 file was modified — 9g-2 is purely additive, a new consumer of `ExecutionOrchestrator`'s existing public API (`run()`, `resumeOwned()`, `retryIfEligible()`), calling nothing not already exposed by `ADR-041`/`ADR-044`/`ADR-045`. Scratch verification artifacts removed after the run. Not yet done, and not claimed as done: 9g-3 (Workers) through 9g-6 (End-to-End) remain future, separate sub-phases.
