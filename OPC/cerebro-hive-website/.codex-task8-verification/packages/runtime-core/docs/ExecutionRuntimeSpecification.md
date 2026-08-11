# Execution Runtime Specification

## 1. Overview
The CerebroHive Durable Execution Runtime is an event-sourced, CQRS-driven workflow platform. All state changes are driven by commands which emit immutable events, deterministically mapped to state via reducers.

## 2. Determinism Contract
Reducers MUST NOT:
- Read from databases or external APIs.
- Call `Date.now()`. Use `ReplayContext.clock`.
- Call `Math.random()`. Use `ReplayContext.random`.
- Mutate global state.

## 3. Concurrency & Lease Fencing
All writes to the event store MUST include an optimistic concurrency `version`.
Distributed workers MUST acquire a lease and receive a monotonic Fencing Token (e.g. `lease #104`).
The Store MUST reject any write that does not supply the current valid fencing token, ensuring split-brain network partitions cannot corrupt the event stream.

## 4. Idempotency Guarantees
Incoming requests to resume an execution MUST provide the `expectedSequence`. If the execution is already past `expectedSequence`, the system MUST return `409 Conflict`, signifying another worker already processed the trigger.

## 5. Event Ordering Guarantees
Events within a single `executionId` are strictly totally ordered by the `sequence` `bigint`. No gaps or re-orderings are permitted.

## 6. Snapshot & Projection Consistency
Projections are Eventually Consistent. Snapshots are strongly consistent optimization boundaries; they do not alter the source of truth (the event stream).

## 7. Backward Compatibility Guarantees
The Runtime enforces strict backward compatibility over the lifecycle of an execution:
- **Command Compatibility**: Older commands MUST remain valid or be explicitly transformed via a defined compatibility layer.
- **Event Compatibility**: If an event's schema changes, an `EventUpcaster` MUST be registered to lazily transform the older payload during replay.
- **Replay Compatibility**: Reducers MUST correctly process all historical events. A newer version of the runtime MUST be able to replay a V1 event stream.
- **Snapshot Compatibility**: Snapshots from older versions (`minimumSnapshotVersion`) MUST either be hydrated correctly or discarded entirely (forcing replay from an earlier sequence).
- **Projection Compatibility**: Read models MUST be rebuildable from the unified event store at any time without dropping historical data.
