# ADR 008: Archive Strategy

## Status
Accepted

## Context
A heavily utilized durable execution platform processes millions of events per month. Keeping all historical events in the hot transactional database (PostgreSQL/MongoDB) degrades performance and drives up infrastructure costs, especially since COMPLETED and CANCELED executions are rarely accessed after 30 days.

## Decision
We implement a Cold Storage Archive Strategy. Executions older than a configurable threshold (e.g., 30 days) and in a terminal state (COMPLETED, FAILED, CANCELED) are serialized and moved to cold storage (e.g., AWS S3). The hot database only retains the `ExecutionSnapshot` and `ExecutionSummary` (CQRS read model) for these executions to allow UI dashboards to function normally. An API is provided to restore the full event stream from S3 back into the hot database for deep auditing or time-travel replay.

## Consequences
- **Pros:** Keeps the hot database lean and performant. Massively reduces storage costs.
- **Cons:** Time-travel replay on archived executions requires an asynchronous restore phase, introducing latency for operators pulling historical forensics.
