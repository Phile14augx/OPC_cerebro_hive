import { describe, it, expect } from 'vitest';
import { ExecutionId } from '@cerebro/domain/src/execution/ExecutionId';
import { PostgresExecutionIdempotencyStore } from '../PostgresExecutionIdempotencyStore';
import { PgQueryable, PgQueryResult } from '../PgQueryable';

/** Same "proves adapter logic, not a real Postgres engine" caveat as
 * `PostgresExecutionLeaseStore.test.ts`'s own fake. */
class FakePgIdempotencyPool implements PgQueryable {
  private readonly rows = new Map<string, string>(); // key -> execution_id

  async query(text: string, params: readonly unknown[] = []): Promise<PgQueryResult> {
    const normalized = text.replace(/\s+/g, ' ').trim();

    if (normalized.startsWith('INSERT INTO execution_idempotency_keys')) {
      const [key, executionId] = params as [string, string];
      if (this.rows.has(key)) {
        return { rows: [] }; // ON CONFLICT DO NOTHING -> no returning row
      }
      this.rows.set(key, executionId);
      return { rows: [{ execution_id: executionId }] };
    }

    if (normalized.startsWith('SELECT execution_id FROM execution_idempotency_keys')) {
      const [key] = params as [string];
      const executionId = this.rows.get(key);
      return { rows: executionId ? [{ execution_id: executionId }] : [] };
    }

    throw new Error(`FakePgIdempotencyPool: unrecognized query: ${normalized}`);
  }
}

describe('PostgresExecutionIdempotencyStore', () => {
  it('reserves a brand-new key, returning the same executionId', async () => {
    const pool = new FakePgIdempotencyPool();
    const store = new PostgresExecutionIdempotencyStore(pool);
    const id = ExecutionId.generate();

    const record = await store.reserve('order-1', id);
    expect(record.executionId.equals(id)).toBe(true);
  });

  it('returns the original owner for a duplicate key, not the new caller\'s id', async () => {
    const pool = new FakePgIdempotencyPool();
    const store = new PostgresExecutionIdempotencyStore(pool);
    const first = ExecutionId.generate();
    const second = ExecutionId.generate();

    await store.reserve('order-1', first);
    const record = await store.reserve('order-1', second);

    expect(record.executionId.equals(first)).toBe(true);
    expect(record.executionId.equals(second)).toBe(false);
  });

  it('different keys reserve independently', async () => {
    const pool = new FakePgIdempotencyPool();
    const store = new PostgresExecutionIdempotencyStore(pool);
    const a = ExecutionId.generate();
    const b = ExecutionId.generate();

    const recordA = await store.reserve('a', a);
    const recordB = await store.reserve('b', b);

    expect(recordA.executionId.equals(a)).toBe(true);
    expect(recordB.executionId.equals(b)).toBe(true);
  });
});
