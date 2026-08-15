# ADR-049: Execution Event Delivery — Transactional Outbox, Relay, Subscriber Reuse (Phase 9g-4)

**Status:** Proposed (Phase 9g-4 of `09-EXECUTION-LIFECYCLE-RUNTIME.md`; builds on `ADR-039` through `ADR-048`)

## Context

`OutboxRelayExecutionEventSink` (Phase 9e, `ADR-043`) publishes an Execution's canonical events directly and synchronously through an `ExecutionOutboxEventPublisher`. That leaves a real gap, named at the time but not closed: if the publish call fails (a broker is briefly unreachable, a network blip), the event is simply lost — there is no durable record to retry from, and no relationship to the transaction that persisted the Execution's own state change. 9g-4's job is closing that gap with a real transactional-outbox pair — a durable write half and a retrying-delivery half — plus demonstrating that Execution's existing event-subscription needs (in-process listeners, not cross-service delivery) can be met by reusing an already-existing generic component rather than building a new one.

Per the same standalone discipline as 9g-1 through 9g-3: real, deterministic components, verified without a live broker or live outbox table.

## Decision

**1. `ExecutionEventOutboxStore` (`ExecutionEventOutbox.ts`) is the durable "write it down first" half.** `append()` records an event with `status: 'pending'`; `loadPending()` returns entries awaiting delivery, oldest first; `markPublished()`/`markFailed()` (the latter taking an `opts.permanent` flag) close the loop. `InMemoryExecutionEventOutboxStore` is a real, standalone reference implementation — not a test double — with a `get(id)` introspection helper for tests.

Deliberately a NEW, execution-specific contract, not a reuse of `packages/domain/src/events/OutboxPublisher.ts`'s existing `OutboxPublisher` class, even though that class already implements the same pattern for other aggregates: `OutboxPublisher` requires `@cerebro/database`'s `OutboxRepository`/`RequestContext`, and importing it would break the bounded-context separation `ADR-039` established for `Execution` staying off `@cerebro/database` throughout every prior Phase 9 sub-phase. A real Postgres-backed `ExecutionEventOutboxStore` (an `execution-runtime-adapters` job, not built here) remains free to reuse `OutboxPublisher`'s own table/schema conventions internally — an open, undecided option, same posture as `ExecutionIdempotency.ts`'s note about `IdempotencyRecord`.

**2. `toExecutionIntegrationEvent()` (`ExecutionOutboxEventPublisher.ts`) is the one shared `DomainEvent` → `{ type, aggregateId, ... }` conversion, used by both sinks.** Previously `OutboxRelayExecutionEventSink` had this logic inlined; it has been refactored to call the shared function instead of duplicating it, so the two sinks (publish-immediately vs. append-to-outbox) cannot drift apart on how an event is shaped.

**3. `TransactionalOutboxExecutionEventSink` (`TransactionalOutboxExecutionEventSink.ts`) is the durable counterpart to `OutboxRelayExecutionEventSink`.** It implements the same `ExecutionEventSink` seam `ExecutionOrchestrator` already calls (`transitionAndPersist()` → `this.events?.publish(event, tx)`, unchanged), but only appends to an `ExecutionEventOutboxStore` — it never calls a publisher directly. The `tx` parameter it receives is the same transaction context the Execution's own state change is persisted under; a real implementation is expected to make the outbox write part of that same transaction (the in-memory reference implementation has no transaction to join, so that atomicity guarantee is only as real as a future durable implementation makes it — stated here, not glossed over).

**4. `ExecutionEventRelay` (`ExecutionEventRelay.ts`) is the "read it back and actually deliver it" half, mirroring `packages/events`' `PollingRelayStrategy`/`OutboxRelayWorker` conceptually (per `ADR-043`) without importing them** — same bounded-context-separation reasoning as everywhere else in Phase 9. `relayOnce()` processes one batch of pending entries (`batchSize`, default 50) and returns a summary (`processed`/`published`/`failed`/`permanentlyFailed`); a publish failure increments the entry's `attempts` and, once `attempts` reaches `maxAttempts` (default 5), moves it to `'failed'` (dead-lettered, no further retries) rather than leaving it `'pending'` forever. `relayOnce()` does not loop, sleep, or schedule itself — a real process calling it on an interval (or via `ExecutionScheduler`/`TimerSource`) is deliberately out of this phase's scope, same boundary `ExecutionScheduler.tick()` itself drew in 9g-2.

**5. `packages/domain/src/events/{EventBus.ts, InMemoryEventBus.ts}` are reused, as-is, for Execution's in-process event-subscriber need — no new adapter class was written.** Investigation confirmed `EventBus.publish(event: DomainEvent): Promise<void>` is structurally identical to `ExecutionEventSink.publish()`, and `InMemoryEventBus` has no dependency on `@cerebro/database` (unlike `OutboxPublisher`), so it is safe to reuse across the bounded-context boundary that excludes `OutboxPublisher`. A test demonstrates passing an `InMemoryEventBus` instance directly as `ExecutionOrchestrator`'s `events` constructor argument, with a subscriber registered via `bus.subscribe('ExecutionValidatedEvent', handler)` correctly receiving the event fired by a real orchestrator run — proving in-process pub/sub delivery needs Execution's own outbox/relay pair to do nothing extra for; the outbox pattern exists specifically for the cross-process (NATS) delivery case the in-memory bus cannot serve.

## Consequences — Implemented / Verified / Deferred

**Implemented:**
- `ExecutionEventOutboxStore` contract + `InMemoryExecutionEventOutboxStore`.
- `toExecutionIntegrationEvent()` shared conversion helper, with `OutboxRelayExecutionEventSink` refactored to use it (no behavior change, no more duplicated conversion logic).
- `TransactionalOutboxExecutionEventSink`, `ExecutionEventRelay`.
- Confirmation (via a passing test, not just a type-compatibility claim) that `InMemoryEventBus` needs no adapter to serve as an `ExecutionEventSink`.

**Verified (in this sandbox):**
- Real `tsc --strict` typecheck — clean across the whole `execution/` package, including all new/refactored files.
- Real `vitest` run — **155/155 tests passing** across the whole `execution/` package (6 new, in `ExecutionEventDelivery.test.ts`): the sink appending durably instead of publishing directly; every transition through a full orchestrator run recorded to the outbox in order; the relay publishing pending entries and marking them published; a transient failure being retried on a subsequent `relayOnce()` call without being dead-lettered; an entry reaching `maxAttempts` being marked permanently failed (and no longer picked up by a further `relayOnce()` call); and `InMemoryEventBus`, passed directly as the orchestrator's event sink, correctly delivering a real transition event to a registered subscriber.

**Deferred (explicitly, not glossed over):**
- Any real durable (e.g. Postgres-backed) `ExecutionEventOutboxStore` implementation — this phase built the contract and an in-memory reference implementation only, same posture as `ADR-046`'s lease/idempotency stores before their Postgres adapters were written.
- Real atomicity between an Execution's state-change persistence and its outbox append — the in-memory store has no transaction to join; a real guarantee requires a real transactional persistence layer neither built nor available in this sandbox.
- A live NATS-connected `ExecutionEventRelay` process — no live broker exists here to verify delivery against; `ExecutionOutboxEventPublisher`'s own doc comment already discloses this same constraint for 9e.
- Any process that calls `relayOnce()` on a real recurring schedule — that composition (relay + scheduler + timer, running continuously) remains future live-wiring work, not built or claimed here.
- Cross-process / multi-worker relay behavior (two relay processes racing over the same pending entries) — untested; the in-memory store's `loadPending()`/`markPublished()` are not designed to guarantee exactly-once delivery under concurrent relay instances.

## Implementation status — Complete for 9g-4's own (standalone) scope; no durable outbox store, live NATS relay, or scheduled/recurring relay process built

New files: `packages/domain/src/execution/{ExecutionEventOutbox.ts, TransactionalOutboxExecutionEventSink.ts, ExecutionEventRelay.ts}`, all exported from `packages/domain`'s root `index.ts`. Modified: `ExecutionOutboxEventPublisher.ts` (added the shared `toExecutionIntegrationEvent()` function), `OutboxRelayExecutionEventSink.ts` (refactored to call it instead of duplicating the conversion inline) — both changes behavior-preserving, confirmed by the pre-existing `OutboxRelayExecutionEventSink.test.ts` suite still passing unchanged. Scratch verification artifacts removed after the run. Not yet done, and not claimed as done: 9g-5 (Observability) and 9g-6 (End-to-End) remain future, separate sub-phases.
