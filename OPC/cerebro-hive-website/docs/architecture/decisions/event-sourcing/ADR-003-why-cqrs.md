# ADR 003: Why CQRS?

## Status
Accepted

## Context
The Event Store is optimized for append-only writes and sequential reads for a single execution stream. However, UI dashboards need to query aggregate states across thousands of executions (e.g., "Show all FAILED executions for Agent X"). Querying the Event Store directly for this would require full table scans and expensive on-the-fly hydration.

## Decision
We adopt Command Query Responsibility Segregation (CQRS). The Event Store handles writes (Commands). An `ExecutionProjectionManager` subscribes to the event stream and hydrates dedicated Read Models (Queries) into a separate `ExecutionProjectionStore`.

## Consequences
- **Pros:** Read queries are extremely fast and can be indexed efficiently. Read schemas can evolve independently of write schemas.
- **Cons:** Eventual consistency. UI dashboards may experience a slight lag (milliseconds) before reflecting the latest event. Projections must be rebuilt if the read schema changes.
