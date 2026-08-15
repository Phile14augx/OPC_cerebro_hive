# ADR-046: Execution Runtime Providers — Postgres Leases/Idempotency, NATS Event Delivery (Phase 9g-1)

**Status:** Proposed (Phase 9g-1 of `09-EXECUTION-LIFECYCLE-RUNTIME.md`; builds on `ADR-039` through `ADR-045`)

## Context

`ADR-039` through `ADR-045` (Phases 9a-9f) built a complete set of standalone execution contracts and in-memory reference implementations, verified entirely through this repository's scratch `tsc`/`vitest` toolchain — deliberately never touching a live database, message broker, or scheduler. Phase 9g is the first phase where that changes: its job is making 9a-9f's semantics operate in a distributed system, which by definition requires real infrastructure (PostgreSQL, NATS, a scheduler, worker processes).

Before starting, how 9g should handle a hard constraint of this environment was raised explicitly: this sandbox has no generated `@prisma/client` (a known, already-documented limitation from Phase 9e) and no reachable live PostgreSQL or NATS server. Per direction: **9g stops at production-ready adapters, honestly disclosing what has and has not been verified** — not "distributed execution verified" or "NATS integration validated" claims the environment cannot back up. 9g is further split, per direction, into 9g-1 (Runtime Providers) through 9g-6 (End-to-End), starting with 9g-1 since every later sub-phase depends on it.

**A discovery made before writing any adapter code, reported here rather than acted on silently**: while surveying the repository for existing infrastructure to reuse (the same "reuse before invention" discipline applied throughout Phase 9), `packages/queue/src/{client.ts, subjects.ts, schemas.ts, index.ts}` was found — a genuinely real, well-written NATS JetStream client (`CerebroQueueClient`: stream bootstrapping, Zod schema validation, DLQ routing, exponential-backoff redelivery) that was NOT part of `ADR-043`'s Phase 9e landscape survey. Investigated directly: `packages/queue` has **no `package.json`** (not a registered workspace member) and **zero consumers** anywhere in `apps/`/`packages/` (`grep -rl "@cerebro/queue"` returns nothing). This confirms it is orphaned, unreachable code — the same category `ADR-043` already used for `BaseWorker`/`PlatformEventBus` (real-looking code, never wired in), not a seventh live event-transport system invalidating `ADR-043`'s conclusion. Flagged for the record; not adopted, not deleted, not further investigated beyond confirming its unreachability.

## Decision

**1. New package `packages/execution-runtime-adapters`** houses the production adapters — deliberately NOT inside `packages/domain` itself, which must stay decoupled from infrastructure client libraries (`ADR-039`'s bounded-context-separation discipline, maintained through every prior sub-phase). This package's entire purpose is to bridge that boundary for real wiring: it depends on `@cerebro/domain` (for the contracts), `@cerebro/events` (for the real NATS publisher `ADR-043` adopted), and `pg` (for Postgres).

**2. `PostgresExecutionLeaseStore` and `PostgresExecutionIdempotencyStore`** implement `ExecutionLeaseStore`/`ExecutionIdempotencyStore` (`ADR-045`) against real, idiomatic Postgres SQL — `INSERT ... ON CONFLICT ... DO UPDATE ... WHERE` for atomic conditional lease acquisition, `ON CONFLICT (key) DO NOTHING ... RETURNING` for atomic idempotency-key reservation. Both target a documented, **not migrated**, schema (two new tables: `execution_leases`, `execution_idempotency_keys`) — consistent with `ADR-039`'s deferred-canonical-schema discipline. The idempotency table is deliberately a NEW, dedicated table rather than force-fit onto `packages/database`'s existing, real `IdempotencyRecord` model (found during this phase): that model is a generic `(tenantId, requestHash)`-keyed shape for arbitrary idempotent operations with `status`/`responseHash` fields this contract doesn't need; reconciling the two is left open for a future decision, not resolved under this phase's pressure.

**3. Both Postgres adapters are typed against a package-local `PgQueryable` interface, not `pg`'s own `Pool` type.** A real `pg.Pool` instance satisfies `PgQueryable` structurally (its `query()` method is a superset of what's declared), so production code can pass one in directly, while this sandbox's tests use a lightweight, real (not mocked-via-library) fake implementing just `query()`. This was a deliberate choice to keep both adapters typecheckable in this sandbox's scratch-toolchain pattern without requiring a live Postgres connection.

**4. `NatsExecutionEventPublisher`** is a thin, explicit, named adapter wrapping `packages/events`' real `NatsIntegrationEventPublisher` (`ADR-043`) behind `ExecutionOutboxEventPublisher`, adding `connect()`/`close()` lifecycle methods. `ADR-043` already established these interfaces are structurally compatible by design; this class exists for explicit, discoverable production wiring, not because structural typing alone was insufficient.

**5. `wiring.ts`'s `buildProductionExecutionOrchestrator()`** is a real composition root demonstrating actual usage — constructing a fully-wired `ExecutionOrchestrator` with the new Postgres lease/idempotency stores and the NATS event sink. `repository` still defaults to the standalone `InMemoryExecutionRepository` (Phase 9d): a Postgres-backed `ExecutionRepository` was explicitly NOT part of 9g-1's narrowed scope (leases, idempotency, and event delivery only) and is not invented here to fill that gap.

**6. Imports throughout this package target specific `@cerebro/domain` submodule paths (e.g. `@cerebro/domain/src/execution/ExecutionLease`), not the package's root barrel.** The root `index.ts` also re-exports files (`AgentApplicationService.ts`, `PolicyEngine.ts`, `AuditLogger.ts`, `OutboxPublisher.ts`) that depend on `@cerebro/database`'s generated `@prisma/client`, unavailable in this sandbox — importing the whole barrel would pull that unrelated, unresolvable subtree into every file's typecheck. This mirrors the "scope tsc to `execution/` only" pattern used throughout Phase 9's own verification.

## Consequences — Implemented / Verified / Deferred

**Implemented:**
- `PostgresExecutionLeaseStore`, `PostgresExecutionIdempotencyStore` — real SQL, real adapter code, a documented (not migrated) schema.
- `NatsExecutionEventPublisher` — real adapter code wrapping the real `NatsIntegrationEventPublisher`.
- `wiring.ts` — real composition/DI code.
- `config.ts` — real, simple environment-variable-based configuration.

**Verified (in this sandbox):**
- Real `tsc --strict` typecheck of `PgQueryable.ts`, `config.ts`, `PostgresExecutionLeaseStore.ts`, `PostgresExecutionIdempotencyStore.ts`, and their test files — clean.
- Real `vitest` run — **9/9 tests passing**: lease acquisition on an unclaimed Execution, `ConflictError` on a contested still-valid lease, idempotent same-owner re-acquisition, `renew()`'s same-owner-succeeds/different-owner-throws behavior, release-then-`currentLease()`-confirms-gone, expiry-based reclaim, and idempotency-key reservation/duplicate-detection/independent-key behavior — all against a real (not framework-mocked) fake `PgQueryable`, proving the adapters' SQL construction, parameter binding, and result-interpretation logic, not that the SQL is correct against a real Postgres engine.
- `NatsExecutionEventPublisher.ts` and `wiring.ts` could **not** be typechecked in this sandbox: `@cerebro/events` transitively depends on `@cerebro/core-bus`/`@cerebro/database`, whose generated `@prisma/client` does not exist here — the same disclosed limitation `ADR-043`/`ExecutionOutboxEventPublisher.ts` already named for cross-package builds. Their `publish()` boundary uses explicit `as any` casts specifically because true structural compatibility could not be confirmed by the compiler here — a disclosed risk point, not a silent shortcut.

**Deferred (explicitly, not glossed over):**
- Any behavior requiring a live PostgreSQL server: whether the documented schema actually creates correctly, whether the `ON CONFLICT`/`RETURNING` SQL behaves as written under real concurrent writers, transaction/isolation-level behavior, connection pooling under load.
- Any behavior requiring a live NATS server: whether `NatsExecutionEventPublisher`/`NatsIntegrationEventPublisher` actually connects, publishes, or that JetStream stream/subject configuration is correct.
- Multi-worker/multi-process lease contention (only single-process, in-memory-fake-backed behavior is exercised).
- `NatsExecutionEventPublisher.ts`/`wiring.ts`'s own compilation against a real `@cerebro/events`/`@cerebro/core-bus`/`@cerebro/database` dependency graph with a generated Prisma client.
- Scheduler execution, distributed failover, crash recovery under real infrastructure, and any production performance characteristic — all explicitly out of scope for 9g-1 (see 9g-2 through 9g-6).

## Implementation status — Complete for 9g-1's own (adapters-only) scope; no live Postgres or NATS server touched or required to exist

New package: `packages/execution-runtime-adapters` (`package.json`, `index.ts`, `src/{config.ts, PgQueryable.ts, PostgresExecutionLeaseStore.ts, PostgresExecutionIdempotencyStore.ts, NatsExecutionEventPublisher.ts, wiring.ts}`, `src/__tests__/{PostgresExecutionLeaseStore.test.ts, PostgresExecutionIdempotencyStore.test.ts}`). No files in `packages/domain` were modified — 9g-1 is purely additive, a new consumer of 9f's already-frozen contracts. Scratch verification artifacts removed after the run. Not yet done, and not claimed as done: 9g-2 (Scheduler) through 9g-6 (End-to-End) — all remain future, separate sub-phases per the roadmap this ADR's own scoping discussion established.
