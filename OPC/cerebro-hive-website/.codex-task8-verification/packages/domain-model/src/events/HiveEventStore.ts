import type { HiveEventEnvelope } from './HiveEventEnvelope';

/**
 * Contract for an append-only event store, keyed by aggregate id —
 * consistent with the append-only evidence/audit-trail principle already
 * established for `Operation`/`UsageRecord` (01-DOMAIN-MODEL.md §2).
 * Interface only: no EventStoreDB, database, or file-backed implementation
 * lives in this package.
 */
export interface HiveEventStore {
  append(aggregateId: string, envelopes: readonly HiveEventEnvelope[]): Promise<void>;
  loadEvents(aggregateId: string): Promise<readonly HiveEventEnvelope[]>;
}
