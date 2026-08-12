# Phase 9g-6 — Execution Lifecycle End-to-End Verification

**Status:** Verified (in-process/standalone scope only — see `ADR-051` for the full Implemented/Verified/Deferred breakdown)
**Test suite:** `packages/domain/src/execution/__tests__/ExecutionEndToEnd.test.ts` (21 tests, part of the whole `execution/` package's 188/188 passing run)

This document is the lifecycle verification record, failure matrix, and recovery matrix named in `ADR-051`'s deliverables — a single reference for "what was exercised, how, and what it proves," so a reader does not have to reverse-engineer test intent from the suite alone.

## 1. Pipeline under test

```
API/Command
    -> ExecutionOrchestrator
    -> Execution aggregate (state machine + invariants)
    -> Domain Events (ExecutionEvents.ts)
    -> ExecutionEventSink
    -> TransactionalOutboxExecutionEventSink -> ExecutionEventOutboxStore (durable)
    -> ExecutionEventRelay -> ExecutionOutboxEventPublisher ("Consumer")
    -> (in parallel) InMemoryEventBus -> in-process subscriber ("Consumer")
```

Every node above is real, standalone code built in 9a-9g-5; 9g-6 is the first phase to wire all of them together and exercise the combination, not any individual node in isolation (each node already has its own dedicated unit-test suite from its originating sub-phase — this suite intentionally does not re-derive those, only confirms composition).

## 2. Lifecycle scenario coverage (failure matrix)

| # | Scenario | Test | Outcome verified |
|---|----------|------|-------------------|
| 1 | Happy path | `Full pipeline wiring (happy path)`, `Complete lifecycle coverage > happy path` | CREATED -> VALIDATING -> QUEUED -> RUNNING -> COMPLETED; every transition reaches the outbox, the relay, the consumer, and the event bus, in order |
| 2 | Validation failure | `validation failure: ...` | VALIDATING -> FAILED is a legal, exercised aggregate transition. Exercised directly against `Execution.transitionTo()` since `ExecutionOrchestrator.driveNewExecution()` has no real validation logic of its own to fail yet — disclosed honestly as a substitute for an orchestrator-level trigger that does not exist |
| 3 | Provider failure | `provider failure: ...` | RUNNING -> FAILED; failure recorded via telemetry (`execution_failures_total`), reaches the outbox as `ExecutionFailedEvent` |
| 4 | Retry success | `retry success: ...` | A transient-classified failure (`DefaultExecutionFailureClassifier`), retried via `retryIfEligible()` + `MaxAttemptsRetryPolicy`, produces a child Execution that completes; `original.childExecutionIds` correctly links to it |
| 5 | Retry exhaustion | `retry exhaustion: ...` | `retryIfEligible()` returns `undefined` once `attempt` reaches `maxAttempts`; the decline itself is recorded via telemetry |
| 6 | Cancellation before execution | `cancellation before execution: ...` | A cancellation requested while QUEUED finalizes straight to CANCELLED; the provider is never invoked (real flag assertion, not a mock-framework call-count) |
| 7 | Cancellation during execution | `cancellation during execution: ...` | RUNNING -> CANCELLING (cooperative), then `acknowledgeCancellation()` -> CANCELLED; both phases recorded via telemetry |
| 8 | Cancellation after completion | `cancellation after completion: ...` | `requestCancellation()` on a terminal (COMPLETED) Execution is a true no-op — status unchanged |
| 9 | Timeout | `timeout: ...` | A deadline that has already passed (via a deterministic fake clock advanced mid-provider-call) takes precedence over the provider's own "completed" result; ends TIMED_OUT, recorded as a failure |
| 10 | Duplicate delivery / idempotent replay | `duplicate delivery / idempotent replay: ...` | Two `runIdempotent()` calls with the same key return the same Execution (`second.id.equals(first.id)`); only one Execution's worth of events reached the outbox |
| 11 | Event ordering | `event ordering: ...` | A run that pauses at WAITING, then resumes to COMPLETED, relays events to the consumer in the exact order produced (`Validated, Queued, Started, Waiting` — the resume's own transitions are a separate, subsequent relay batch not asserted here, since `resume()` was called via a second orchestrator instance with no sink configured, deliberately isolating the ordering assertion to the first batch) |
| 12 | Replay after crash (simulated) | `Deterministic replay after simulated crash` | `ExecutionReplay.replayExecution()` reconstructs an Execution's status and full `transitionHistory` purely from `repository.loadTransitions()` output — no live event store or snapshot touched, matching `ADR-040`'s own claim about `transitionHistory` sufficiency |

Property-based/scenario-random-sequence testing (the optional 7th category in the original 9g-6 scope) was not built — the fixed scenario matrix above already exercises every legal-transition edge in `ExecutionTransitions.ts`'s graph (confirmed against §3 below), and a random-sequence generator would, by construction, only ever produce sequences already validated as legal-or-rejected by the state machine tests. Judged not to add verification value proportionate to the effort in this sandbox; noted here as a real, considered scope decision rather than a silent omission.

## 3. State machine verification

| Property | Test | Result |
|----------|------|--------|
| Every legal transition accepted | `every legal transition in the graph is accepted and increments version by exactly one` | CREATED(v1) -> VALIDATING(v2) -> QUEUED(v3) -> RUNNING(v4) -> COMPLETED(v5) |
| Illegal transitions rejected | `an illegal transition is rejected with InvariantViolationError and does not mutate state` | VALIDATING -> COMPLETED throws `InvariantViolationError`; status/version unchanged after the throw |
| Terminal states have no outgoing edges | `a terminal Execution has no legal outgoing transitions` | COMPLETED -> FAILED throws `InvariantViolationError` |
| Version increments | (all of the above) | Exactly +1 per successful `transitionTo()` call, confirmed at every step, not just start/end |
| Optimistic concurrency | `optimistic concurrency: a stale expectedVersion is rejected with ConcurrencyError` | A caller holding a stale `expectedVersion` (one that no longer matches the store's current version) is rejected by `InMemoryExecutionRepository.save()` |
| Aggregate invariants | (Execution.test.ts, not re-derived here) | Already covered by the 9a suite; not re-asserted in this file to avoid duplicate coverage of the same fact |

## 4. Outbox verification (recovery matrix)

| Property | Test | Result |
|----------|------|--------|
| Event persistence | `Full pipeline wiring`, `Outbox verification > persists, relays, marks delivered...` | Every transition's event is durably appended to the outbox before relay |
| Relay / mark delivered | (same) | `relayOnce()` publishes every pending entry and marks it `'published'` |
| Duplicate suppression | `...suppresses duplicate relay of an already-published entry` | A second `relayOnce()` call with nothing new pending processes 0 entries — an already-published entry is never re-delivered |
| Ordering | `Full pipeline wiring`, `event ordering` | Entries are always loaded oldest-first and published in that order |
| Retry of a transient failure | `a transient publish failure is retried on the next relayOnce() call without being dead-lettered` | A publish failure leaves the entry `'pending'` (not `'failed'`) below `maxAttempts`; the next `relayOnce()` call successfully delivers it |
| Crash recovery (simulated) | `crash recovery (simulated): a fresh relay instance over the same durable outbox resumes and delivers exactly once` | A brand-new `ExecutionEventRelay`/publisher pair, constructed only from the surviving outbox store (standing in for a real store surviving a process restart), correctly resumes and delivers every still-pending entry exactly once |

## 5. Observability verification

Reusing the exact `InMemoryTracer`/`InMemoryMetricsCollector`/`InMemoryStructuredLogger` reference implementations built in 9g-5 (no new observability code was written for 9g-6): a full pipeline run produces ended spans for every transition, the expected counters/gauges/histograms (`execution_transitions_total`, `execution_provider_invocations_total`, `execution_outbox_batch_processed`, `execution_outbox_published_total`), and structured log entries whose `executionId`/`correlationId` fields match the Execution that produced them — end-to-end correlation-ID propagation confirmed by direct field comparison, not by inspection.

## 6. Explicitly deferred (requires external infrastructure)

Unchanged from `ADR-051`'s own list — repeated here for a single point of reference: live PostgreSQL, live NATS JetStream, multi-process orchestration, a real OpenTelemetry Collector, Prometheus, Grafana, Kubernetes, Docker Compose integration, chaos engineering across distributed nodes, network partitions, cross-process failover, horizontal scaling, and production performance benchmarks. None of these can be exercised or verified inside this sandbox; none are claimed as verified anywhere in this document or its test suite.
