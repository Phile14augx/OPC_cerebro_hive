# ADR 002: Why Lease Fencing?

## Status
Accepted

## Context
In a distributed environment, multiple workers may attempt to process the same execution due to network partitions, delayed heartbeats, or duplicate webhook deliveries. We must prevent split-brain writes where two workers interleave events into the same execution stream, causing state corruption.

## Decision
We use a Distributed Lease Fencing mechanism (`ExecutionLeaseManager`). Every worker must acquire a lease to process an execution. The lease grants a strictly monotonic `fencingToken` (a BigInt). Every write to the Event Store or Snapshot Store requires passing this `fencingToken`. The underlying storage engine enforces optimistic concurrency checks, rejecting any writes that carry a stale token.

## Consequences
- **Pros:** Absolute guarantee against split-brain writes. Workers can be stateless and crash at any time.
- **Cons:** Slight performance overhead for token verification on every write. Requires accurate monotonic sequence generation in the persistence layer.
