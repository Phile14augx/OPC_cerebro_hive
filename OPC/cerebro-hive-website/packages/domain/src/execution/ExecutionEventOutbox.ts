import { ExecutionEventContext, ExecutionIntegrationEventLike } from './ExecutionOutboxEventPublisher';

/**
 * Phase 9g-4 — a real transactional-outbox store for Execution's canonical
 * events, closing a gap `OutboxRelayExecutionEventSink` (Phase 9e) left
 * open: that sink publishes directly/synchronously — if the publish call
 * fails, the event is simply lost, with no durable record to retry from.
 * `ExecutionEventOutboxStore` is the durable "write it down first" half of
 * the classic transactional-outbox pattern; `ExecutionEventRelay.ts` is the
 * "read it back and actually deliver it, with retry" half.
 *
 * Deliberately a NEW, execution-specific contract — NOT a reuse of
 * `packages/domain/src/events/OutboxPublisher.ts`'s existing `OutboxPublisher`
 * class, even though that class already implements exactly this pattern for
 * other aggregates. `OutboxPublisher` requires `@cerebro/db`'s
 * `OutboxRepository`/`RequestContext` — importing it here would break the
 * same bounded-context separation `ADR-039` established for `Execution`
 * staying off `@cerebro/db` throughout every prior Phase 9 sub-phase.
 * A real Postgres-backed `ExecutionEventOutboxStore` implementation
 * (packages/execution-runtime-adapters' job, not built in this sandbox) is
 * free to reuse `OutboxPublisher`'s own table/schema conventions internally
 * if that turns out to make sense — an open, undecided option, same as
 * `ExecutionIdempotency.ts`'s own note about `IdempotencyRecord`.
 */
export type ExecutionOutboxEntryStatus = 'pending' | 'published' | 'failed';

export interface ExecutionOutboxEntry {
  readonly id: string;
  readonly event: ExecutionIntegrationEventLike;
  readonly context: ExecutionEventContext;
  readonly status: ExecutionOutboxEntryStatus;
  readonly attempts: number;
  readonly lastError?: string;
  readonly createdAt: Date;
}

export interface ExecutionEventOutboxStore {
  /** Durably records an event for later delivery. Real implementations
   * (e.g. a Postgres-backed one) should do this in the SAME transaction
   * that persists the Execution's own state change, which is exactly what
   * makes the outbox pattern atomic — this in-memory reference
   * implementation has no transaction to join, so that guarantee is only as
   * real as a future durable implementation makes it. */
  append(event: ExecutionIntegrationEventLike, context: ExecutionEventContext): Promise<ExecutionOutboxEntry>;

  /** Returns entries still awaiting delivery (`status === 'pending'`),
   * oldest first, up to `limit` if given. */
  loadPending(limit?: number): Promise<readonly ExecutionOutboxEntry[]>;

  markPublished(id: string): Promise<void>;

  /** Records a failed delivery attempt, incrementing `attempts`. If
   * `opts.permanent` is true, the entry moves to `'failed'` (a dead-letter
   * equivalent — no further delivery will be attempted); otherwise it stays
   * `'pending'` for a future `ExecutionEventRelay.relayOnce()` call to retry. */
  markFailed(id: string, error: string, opts?: { permanent?: boolean }): Promise<void>;
}

/** Standalone, in-memory reference implementation — real, not a test
 * double, same status as this phase's other `InMemory*` classes. */
export class InMemoryExecutionEventOutboxStore implements ExecutionEventOutboxStore {
  private readonly entries = new Map<string, ExecutionOutboxEntry>();
  private sequence = 0;

  async append(event: ExecutionIntegrationEventLike, context: ExecutionEventContext): Promise<ExecutionOutboxEntry> {
    this.sequence += 1;
    const entry: ExecutionOutboxEntry = {
      id: `outbox-${this.sequence}`,
      event,
      context,
      status: 'pending',
      attempts: 0,
      createdAt: new Date(),
    };
    this.entries.set(entry.id, entry);
    return entry;
  }

  async loadPending(limit?: number): Promise<readonly ExecutionOutboxEntry[]> {
    const pending = Array.from(this.entries.values())
      .filter((entry) => entry.status === 'pending')
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    return limit !== undefined ? pending.slice(0, limit) : pending;
  }

  async markPublished(id: string): Promise<void> {
    const entry = this.entries.get(id);
    if (!entry) {
      return;
    }
    this.entries.set(id, { ...entry, status: 'published' });
  }

  async markFailed(id: string, error: string, opts: { permanent?: boolean } = {}): Promise<void> {
    const entry = this.entries.get(id);
    if (!entry) {
      return;
    }
    this.entries.set(id, {
      ...entry,
      attempts: entry.attempts + 1,
      lastError: error,
      status: opts.permanent ? 'failed' : 'pending',
    });
  }

  /** Exposed for tests/introspection — not part of the shared contract. */
  get(id: string): ExecutionOutboxEntry | undefined {
    return this.entries.get(id);
  }
}
