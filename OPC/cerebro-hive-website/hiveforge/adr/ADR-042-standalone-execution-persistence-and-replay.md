# ADR-042: Standalone execution persistence, checkpointing, and replay

**Status:** Proposed (Phase 9d of `09-EXECUTION-LIFECYCLE-RUNTIME.md`; builds on `ADR-039`'s aggregate, `ADR-040`'s transition graph, `ADR-041`'s orchestrator)

## Context

`ADR-039` deliberately deferred which of `packages/database`'s live schema or `packages/db`'s stranded enum-backed schema (or a new one) becomes the canonical persistence model for `Execution` — a decision this ADR does not make. Before building anything, the same standalone-vs-live question asked before every risk-bearing sub-phase was asked again: should 9d build a real Prisma migration against `packages/database`'s live schema, or a standalone persistence layer that validates the `ExecutionRepository` contract without touching any live schema? Per explicit direction: **standalone.** Building against the live schema now would either force `ADR-039`'s deferred canonical-schema decision prematurely, or produce an adapter likely to be discarded once that decision is actually made.

## Decision

**1. `packages/domain/src/execution/InMemoryExecutionRepository.ts` is the first real `ExecutionRepository` implementation — standalone, not backed by any live database.** It is more than a test fake: it round-trips every `Execution` through real serialize/deserialize functions (`ExecutionSnapshot.ts`) and enforces the same optimistic-concurrency contract a real database-backed implementation would. It is not evidence that persistence works against a real, shared database — that remains a distinct future milestone.

**2. `ExecutionRepository.save()` gains an optional `opts.expectedRevision` parameter for optimistic concurrency — additive, not a breaking change.** "Revision" is defined as an Execution's `transitionHistory.length` at save time, reusing 9b's existing field rather than adding a new version counter to the aggregate. A caller that omits `expectedRevision` (every current caller, including `ExecutionOrchestrator`, unchanged by this ADR) gets no concurrency check; a caller that supplies it gets a `ConcurrencyError` (already defined in `DomainError.ts`) if the stored revision has moved since the caller's own last read.

**3. `ExecutionSnapshot.ts` defines the plain, JSON-serializable representation of an `Execution`'s full state, and real (not passthrough) conversion functions both ways.** `ExecutionId` becomes `string`, `Date` becomes ISO string, `transitionHistory` is fully included. Round-trip fidelity is verified through an actual `JSON.stringify`/`JSON.parse` pass, not just in-memory object identity — this is what makes the snapshot a credible stand-in for what a real database row or serialized message payload would actually carry.

**4. Checkpointing is a separate contract (`ExecutionCheckpointStore.ts`) from `save`/`findById`, not folded into `ExecutionRepository`.** A checkpoint is an explicit, named historical recovery point (`{ executionId, revision, snapshot, createdAt }`); `ExecutionRepository.findById()` only ever returns current state. `InMemoryExecutionCheckpointStore` keeps every checkpoint ever saved (no pruning) — retention policy is not decided by this phase. This shape follows the spirit of `packages/database`'s own unused `ExecutionCheckpoint` model (`contextSnapshot`/`variables`/`pendingActions`/`eventOffset`, found by the Slice 5 review) without being that Prisma model — no live schema is touched.

**5. `replayExecution()` (`ExecutionReplay.ts`) reconstructs an Execution from identity plus `transitionHistory` alone, by literally re-driving `Execution.transitionTo()` in original order with original timestamps.** This is the direct, executable proof of `ADR-040`'s own claim that `transitionHistory` is "sufficient... to support deterministic replay and auditing without needing a separate event store" — no event store, no intermediate snapshot is consulted; only what `findById()` already returns.

**6. Crash recovery is demonstrated, not merely asserted, via the existing standalone orchestrator.** A test drives an Execution to `WAITING` through `ExecutionOrchestrator.run()`, then loads it back from a *fresh* lookup against the same repository (a new object graph, not the same in-memory instance — the same shape a real process restart would produce), and calls `ExecutionOrchestrator.resume()` on the rehydrated object, reaching `COMPLETED`. `ExecutionOrchestrator`'s public API is unchanged by this ADR — it already accepted any `Execution` instance to `resume()`, so no new integration surface was needed to prove this.

## Consequences

- No live behavior changes. `packages/database`'s schema is untouched; `ADR-039`'s deferred canonical-schema decision remains deferred.
- A future real persistence milestone has a concrete contract (`ExecutionRepository` with its now-optional concurrency parameter), a real serialization boundary (`ExecutionSnapshot`) to reuse or adapt, and a checkpoint contract already shaped — reducing that milestone to "implement these against a real store" rather than designing them under live-schema pressure.
- `InMemoryExecutionRepository`/`InMemoryExecutionCheckpointStore` are not disposed of after this phase — they remain real, usable implementations for testing (as `ExecutionOrchestrator.test.ts` could adopt in place of its own bespoke fake, though that migration is not done by this ADR) and for any future in-process-only use case, not solely scaffolding to be deleted.
- Idempotency, authorization, live wiring, and a real database-backed implementation remain explicitly out of scope, same as `ADR-041` named for the orchestrator.

## Implementation status — Complete for 9d's own (standalone) scope; no live database touched

New files: `ExecutionSnapshot.ts` (serialize/deserialize), `InMemoryExecutionRepository.ts` (first real `ExecutionRepository`), `ExecutionCheckpointStore.ts` (+ in-memory implementation), `ExecutionReplay.ts`. `ExecutionRepository.save()`'s signature gained the optional `opts.expectedRevision` parameter. All exported from `packages/domain`'s root `index.ts`. Verified, not assumed:

- Real `tsc --strict` typecheck (scratch-toolchain pattern) — clean across the whole `execution/` package.
- Real `vitest` run — 97/97 tests passing across the package, 17 new in `ExecutionPersistence.test.ts`: snapshot round-trip fidelity (including through real `JSON.stringify`/`JSON.parse`, and through parent/child/contributor-reference identity preservation), repository save/load/`findChildren`, revision tracking, optimistic-concurrency acceptance and rejection (`ConcurrencyError`), checkpoint save/load-latest/restore-reflects-historical-not-current-state, `replayExecution` reconstructing an identical final state for both a multi-hop success path and a failure path (and the zero-transitions edge case), and two crash-recovery tests demonstrating `ExecutionOrchestrator.resume()` continuing a rehydrated (not the original in-memory) Execution instance to completion.
- Scratch verification artifacts removed after the run.
- Not yet done, and not claimed as done: any real database-backed implementation; live wiring; idempotency; authorization; cancellation; timeout detection; a retention/pruning policy for checkpoints; `ADR-039`'s deferred canonical-schema decision remains exactly as deferred as before this ADR.
