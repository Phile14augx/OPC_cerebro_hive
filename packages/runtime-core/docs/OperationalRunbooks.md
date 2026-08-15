# Operational Runbooks

## 1. Worker Crash Recovery
If a worker crashes mid-execution:
1. The lease attached to the execution will expire after `LEASE_TIMEOUT` (default: 30s).
2. The `ExecutionLeaseManager` will heartbeat the `AgentWorkerHeartbeat` table. The dead worker will fail to renew.
3. Another worker will sweep for stale leases, claim the execution, and mint a new Fencing Token.
4. The new worker hydrates state from the event store and continues from `expectedSequence`.

## 2. Projection Rebuild Procedures
To rebuild a corrupted CQRS read model without downtime:
1. Spin up a secondary Projection schema (e.g., `ExecutionProjection_v2`).
2. Run the `RebuildProjectionPipeline` which replays all events from `sequence=0` into `_v2`.
3. Once lag hits 0, atomically swap read aliases or feature flags from `_v1` to `_v2`.
4. Drop `_v1`.

## 3. Snapshot Corruption & Replay Mismatch Investigation
If a snapshot's `snapshotHash` fails to match the recomputed aggregate hash or a nondeterminism mismatch is flagged by `ReplayVerifier`:
1. The Replay Service will silently discard the snapshot and rollback to the next oldest valid snapshot, or `sequence=0`.
2. A new valid snapshot will be generated on the next save cycle.
3. For deep investigation, use the Time-Travel API (`GET /executions/:id/state?sequence=N`) and compare delta events to identify the offending reducer.

## 4. Poison Execution Isolation
If an execution fails to process the same outbox message 5 times (due to deterministic crashes in reducers):
1. The execution transitions to `POISONED` status.
2. It is moved to the Dead Letter Queue (DLQ).
3. The queue processor will skip it to prevent head-of-line blocking.
4. An operator must manually inspect the DLQ, patch the reducer, and requeue the DLQ message.

## 5. Failed Migration Rollback
If a schema migration corrupts the write path:
1. Immediately disable the execution API using the global feature flag to pause new commands.
2. Revert the database schema to the previous valid state using Prisma `db push --accept-data-loss` (only safe if projection read-models are affected, not event store).
3. Re-run `RebuildProjectionPipeline` for the affected views.
4. Re-enable the API once read models are synced.

## 6. Archive Restore
To restore historical events that were compacted and moved to cold storage (e.g., S3):
1. Execute the `RestoreArchiveCommand` passing the `executionId` and desired `sequence` bounds.
2. The runtime kernel pulls the archived segment, decompresses it, and temporarily persists it in the `ExecutionArchive` cache table.
3. Time-Travel APIs and Replay Service can then hydrate using this cached segment.
