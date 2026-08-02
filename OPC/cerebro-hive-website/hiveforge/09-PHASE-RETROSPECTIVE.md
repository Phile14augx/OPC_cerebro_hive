# Phase 9 Retrospective — Execution Lifecycle Runtime

**Covers:** `ADR-039` through `ADR-051` (Phases 9a through 9g-6), `packages/domain/src/execution/`, `packages/execution-runtime-adapters/`.
**Companion documents:** `09-EXECUTION-LIFECYCLE-RUNTIME.md` (the living phase doc), `TECHNICAL-DEBT.md` (the debt register), `09g6-EXECUTION-E2E-VERIFICATION.md` (the lifecycle verification record).

## 1. Accomplishments

Phase 9 took the execution runtime from "a `WorkflowExecution` row written once to `status = 'RUNNING'` and never transitioned again, because no transition-legality mechanism existed anywhere" (the original Slice 5 review's own finding) to a fully-specified, contract-driven, real-implementation-backed lifecycle runtime:

- A canonical `Execution` aggregate (9a, `ADR-039`) with a real, enforced transition graph (9b, `ADR-040`) — illegal transitions are rejected, not merely undocumented.
- A standalone production orchestrator (9c, `ADR-041`) coordinating transitions, persistence, and event publication without itself doing any unit of work — providers execute, the orchestrator only coordinates.
- Standalone persistence, checkpointing, and deterministic replay (9d, `ADR-042`), including a user-directed shift mid-phase from optional, revision-based concurrency to mandatory, version-based optimistic concurrency — a real architectural correction, reconciled across every dependent rather than left half-applied.
- A real, investigated (not assumed) choice of event-transport foundation (9e, `ADR-043`) — six candidate systems in the repository were surveyed before adopting `packages/events`' real-but-unwired NATS/outbox-relay code over inventing a seventh mechanism.
- Execution control semantics — authorization, cooperative cancellation, timeout (9f-1, `ADR-044`) — and reliability/ownership semantics — idempotency, leases, failure classification, retry policy (9f-2, `ADR-045`).
- The full 9g runtime-integration roadmap: Postgres/NATS adapters (9g-1, `ADR-046`), a real scheduler (9g-2, `ADR-047`), lease-heartbeat-backed workers (9g-3, `ADR-048`), a transactional outbox and relay (9g-4, `ADR-049`), tracing/metrics/logging contracts wired into the orchestrator (9g-5, `ADR-050`), and a full end-to-end verification pass tying every node together (9g-6, `ADR-051`).
- **188 passing tests, clean `tsc --strict`, across the whole `execution/` package**, plus 9 additional tests for the two Postgres adapters in `packages/execution-runtime-adapters`, all built incrementally and re-verified at every sub-phase rather than accumulated and checked once at the end.
- Two real discoveries surfaced and handled honestly rather than silently: `packages/queue` (a genuinely real, orphaned NATS JetStream client with no `package.json` and zero consumers) and the six-way event-transport landscape in `ADR-043`'s own investigation — both documented, neither silently adopted or ignored.

## 2. Lessons learned

- **"Reuse before invention" paid off repeatedly, but required real investigation each time, not a rule applied on autopilot.** `Clock`/`SystemClock` (9f-1) directly informed `TimerSource`/`RealTimerSource` (9g-3)'s shape; `packages/domain/src/policies/Decision.ts` was reused for authorization instead of a parallel vocabulary; `packages/domain/src/events/{EventBus,InMemoryEventBus}` were confirmed, by direct dependency inspection, to be safely reusable for Execution's event-subscriber need, while the structurally-similar `OutboxPublisher` was correctly excluded for depending on `@cerebro/database`. Each of these calls required actually reading the candidate code, not assuming a name match meant a safe reuse.
- **A mid-phase, user-directed architectural correction (optional-revision to mandatory-version concurrency) is cheaper to absorb early and reconcile immediately than to let drift.** The reconciliation pass (documented as an "Amendment" in `ADR-042`, not a silent rewrite) touched every dependent in one pass — the aggregate, the repository, the orchestrator, the snapshot/replay code, and three test suites — and was re-verified in full (101/101) before any further sub-phase began. Deferring that reconciliation would have compounded the mismatch across every subsequent 9e-9g sub-phase.
- **Explicit Implemented/Verified/Deferred (or equivalent) sections, adopted from 9g-1 onward, made scope creep visible and preventable.** Naming exactly what "adapters only, honestly unverified" meant, sub-phase by sub-phase, is what let 9g-5's proposed full observability stack (Prometheus, Grafana, alerting, OTel) get scoped down to contracts-plus-in-memory-adapters without an argument about whether that was "enough" — the framework for making that call was already established by 9g-1.
- **Documentation drift is real even within a disciplined process.** The Phase 9 stabilization review (this document's own occasion) found a handful of real inconsistencies across the 13 ADRs: a checkpoint-reconciliation gap in `ADR-042`'s Amendment, inconsistent Implemented/Verified/Deferred header vocabulary in `ADR-046`, and an under-explained test-count figure in `ADR-043`. None were functional bugs — all were documentation precision issues — but they show that even a consistent process benefits from a periodic consistency pass rather than assuming each ADR is self-evidently correct forever.
- **Deterministic testability seams (`Clock`, `TimerSource`) were worth the upfront design cost.** Every timeout, heartbeat, and scheduling test in 9f-1 through 9g-6 runs in milliseconds with zero flakiness risk from real elapsed time — a deliberate investment that paid for itself across every subsequent sub-phase that needed "time" as a concept.

## 3. Architectural changes (relative to the original Slice 5 review's baseline)

- `Execution` now has a single canonical aggregate, transition graph, and event contract — replacing the prior state of a written-once, never-transitioned `WorkflowExecution` row with no legality mechanism.
- Optimistic concurrency is now a structural, mandatory guarantee (`ExecutionRepository.save()`'s `expectedVersion`), not an afterthought or an unchecked path.
- `packages/events` is now the platform's adopted, repaired, real event-transport foundation for Execution — a six-system landscape was narrowed to one, with the others (`core-bus`'s `DomainEventBus`, `domain-model`'s `HiveEventBus`, `BaseWorker`/`PlatformEventBus`) explicitly left orphaned rather than silently multiplied.
- A new package, `packages/execution-runtime-adapters`, now exists as the designated home for infrastructure-touching adapters — keeping `packages/domain` itself permanently decoupled from `pg`/NATS client libraries, a boundary maintained without exception across every 9g sub-phase.
- A durable transactional-outbox pattern now exists for Execution's own events, independent of (and not reusing) the existing `OutboxPublisher`'s `@cerebro/database` coupling — a deliberate bounded-context choice, not an oversight.

## 4. Risks

- **The gap between "adapters exist" and "adapters are proven against live infrastructure" is the single largest risk carried forward.** Every Postgres/NATS adapter, and every observability contract, is real code that has never executed against a real Postgres server, NATS broker, or OTel/Prometheus backend. This is disclosed exhaustively in `ADR-046`/`ADR-049`/`ADR-050`/`ADR-051` and in `TECHNICAL-DEBT.md` §2 — but it means the runtime's actual production behavior under real infrastructure is, as of this retrospective, unknown, not merely "untested in one corner."
- **No multi-process or distributed behavior has ever been exercised.** Lease contention, scheduler failover, and worker-fleet coordination are designed to be safe in principle (real SQL atomicity, a real lease contract) but have zero test coverage under real concurrent processes.
- **The runtime is not yet wired into any live caller.** `apps/platform-api`'s `runtime.routes.ts` remains mocked, per the original Slice 5 review — Phase 9 built a complete, real, standalone runtime, but connecting it to an actual live request path is unstarted, separate work.
- **This entire phase was built without a functioning git repository in this sandbox.** No commit history exists marking any of Phase 9's incremental progress — a real operational risk (loss of granular history, no rollback points) until the working copy is confirmed to have real version control and the completed work is committed.

## 5. Future work

Immediate candidates, roughly in dependency order:
1. Resolve the git situation (see `TECHNICAL-DEBT.md` §4 and the open operational note carried in this session) and commit Phase 9 as a milestone.
2. A real, database-backed `ExecutionRepository` — the last major standalone-vs-live gap for persistence itself.
3. Live verification of the Postgres/NATS adapters against actual infrastructure, closing `ADR-046`'s/`ADR-049`'s largest disclosed gaps.
4. Wiring the execution runtime into `apps/platform-api`'s currently-mocked `runtime.routes.ts` — the first real caller.
5. The open research items in `TECHNICAL-DEBT.md` §5 (idempotency-table reconciliation, `packages/queue`'s disposition, `DomainEventBus`/`HiveEventBus`'s disposition, the still-deferred canonical-schema decision).
6. Real OTel/Prometheus/Grafana integration, once a live backend exists to build and verify against.

## 6. Readiness review

Assessing whether Phase 9 is a stable foundation to build on, by area:

**Execution runtime (orchestrator, control semantics, reliability):** Ready as a standalone foundation. `ExecutionOrchestrator` correctly composes authorization, cancellation, timeout, idempotency, leases, retry, and now telemetry — all additive, all with safe defaults, all real-tested (188/188). Not ready for live traffic: no live caller wires it up yet.

**Persistence:** Contract-ready, implementation-not-ready. `ExecutionRepository`'s mandatory-version-concurrency contract is solid and fully exercised via `InMemoryExecutionRepository`; no database-backed implementation exists. This is the most consequential remaining gap before any real deployment.

**Replay:** Ready, within its stated scope. `ExecutionReplay.replayExecution()` is a direct, tested proof that `transitionHistory` is sufficient for deterministic reconstruction — genuinely verified, not merely claimed, in 9d and re-confirmed in 9g-6.

**Outbox:** Contract- and single-process-ready; durability-unverified. `ExecutionEventOutboxStore`/`TransactionalOutboxExecutionEventSink`/`ExecutionEventRelay` correctly implement the transactional-outbox pattern's shape (append, load-pending, mark-published, retry-with-dead-letter) and are proven correct in-memory; no real durable store has ever backed them.

**Telemetry:** Contract-ready, backend-not-ready. Tracing/metrics/logging signals are emitted at every meaningful lifecycle point and correctly correlate back to the originating Execution — genuinely useful today for local debugging via the in-memory adapters, not yet connected to any real observability backend.

**Testing:** Strong. 188 tests across the `execution/` package (plus 9 for the runtime adapters), a documented, repeatable scratch-verification pattern, and an explicit end-to-end suite (9g-6) exercising the full pipeline composition, not just individual nodes. The main gap is infrastructure-dependent testing (§ risks above), which is a sandbox constraint, not a process failure.

**Documentation:** Strong, with minor precision debt now closed. 13 ADRs, a living phase doc, and (as of this stabilization pass) a consistency review that found and fixed a real documentation gap (`ADR-042`'s checkpoint reconciliation note) plus two smaller vocabulary inconsistencies (`ADR-046`, `ADR-043`) — see the Phase 9 ADR consistency review performed as part of this retrospective.

**SDK/contract surface:** Ready. Every public contract (`ExecutionRepository`, `ExecutionEventSink`, `ExecutionProviderPort`, `ExecutionAuthorizationPolicy`, `ExecutionIdempotencyStore`, `ExecutionLeaseStore`, `ExecutionRetryPolicy`, `ExecutionFailureClassifier`, `Tracer`/`Meter`/`Logger`) is small, additive, has a real safe default, and has proven itself stable across every subsequent sub-phase that depended on it — no contract needed a breaking change once introduced (the one exception, `ExecutionRepository.save()`'s concurrency parameter, was corrected early and reconciled fully, per §3).

**Overall:** Phase 9 is a genuinely solid, honestly-verified foundation for the in-process execution lifecycle. It is not yet a deployed, live-infrastructure-proven runtime — that gap is disclosed exhaustively, not hidden, across every ADR from 9g-1 onward and in `TECHNICAL-DEBT.md`. The next phase can build on this with meaningfully lower architectural risk than existed before Phase 9 started, provided it treats "verified in-process" and "verified against live infrastructure" as the two distinct claims this phase was always careful to keep separate.
