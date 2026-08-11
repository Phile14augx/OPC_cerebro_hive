# ADR 005: Snapshot Strategy

## Status
Accepted

## Context
Replaying thousands of events from sequence 0 for every worker activation introduces unacceptable latency. However, trusting a stored state without verifying it against the event log risks silent state corruption.

## Decision
We utilize a Snapshot Strategy. The runtime periodically saves the aggregate state as an `ExecutionSnapshot`. On hydration, the engine loads the latest snapshot and replays only the events that occurred after the snapshot's sequence number. 
To ensure integrity, snapshots utilize a `snapshotHash` (Merkle tree representation). If hydration or verification detects a hash mismatch (indicating silent nondeterminism), the system discards the snapshot, falls back to pure replay from sequence 0, and generates a new versioned snapshot.

## Consequences
- **Pros:** Fast O(1) load times regardless of event stream length. Self-healing integrity through hash validation.
- **Cons:** Snapshot schema changes must be managed carefully (versioning). Increased storage overhead for the hot database.
