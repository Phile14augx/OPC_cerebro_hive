# ADR 006: Projection Consistency Model

## Status
Accepted

## Context
When an event is appended to the event store, it must also update various CQRS read models (projections) used by UI dashboards. Updating the read models synchronously in the same transaction as the event store guarantees immediate consistency but drastically impacts write throughput and couples the write model to the read schema.

## Decision
The Event Store is Strongly Consistent (authoritative). All Projections are Eventually Consistent. 
The `ExecutionProjectionManager` subscribes to the event stream asynchronously. If a user queries the dashboard immediately after a mutation, they may see stale data for a few milliseconds (Projection Lag). Replay APIs and Time Travel debugging always read directly from the authoritative event stream to guarantee perfect consistency.

## Consequences
- **Pros:** Maximum write throughput. Projections can be rebuilt offline without impacting the core execution engine.
- **Cons:** UI must be designed to tolerate eventual consistency. Operators must monitor Projection Lag.
