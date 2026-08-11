import { describe, it, expect } from 'vitest';
import { ExecutionId } from '@cerebro/domain/src/execution/ExecutionId';
import { ConflictError } from '@cerebro/domain/src/errors/DomainError';
import { Clock } from '@cerebro/domain/src/execution/Clock';
import { PostgresExecutionLeaseStore } from '../PostgresExecutionLeaseStore';
import { PgQueryable, PgQueryResult } from '../PgQueryable';

/**
 * A fake standing in for a real `pg.Pool` — this proves the adapter's SQL
 * construction, parameter binding, and result-interpretation logic is
 * correct; it does NOT prove the SQL is correct against a real PostgreSQL
 * engine (no such engine is reachable in this sandbox — see `ADR-046`).
 * Simulates a single `execution_leases` table in memory, applying the same
 * conditional-update semantics the adapter's real SQL expresses, so tests
 * can assert end-to-end behavior through the adapter's public API rather
 * than just "was this exact SQL string sent."
 */
class FakePgLeasePool implements PgQueryable {
  private readonly rows = new Map<string, { execution_id: string; owner: string; expires_at: string }>();

  constructor(private readonly now: () => Date = () => new Date()) {}

  async query(text: string, params: readonly unknown[] = []): Promise<PgQueryResult> {
    const normalized = text.replace(/\s+/g, ' ').trim();

    if (normalized.startsWith('INSERT INTO execution_leases')) {
      const [executionId, owner, expiresAt] = params as [string, string, string];
      const existing = this.rows.get(executionId);
      const nowMs = this.now().getTime();
      const conflictBlocksWrite =
        existing !== undefined && existing.owner !== owner && new Date(existing.expires_at).getTime() > nowMs;
      if (conflictBlocksWrite) {
        return { rows: [] };
      }
      const row = { execution_id: executionId, owner, expires_at: expiresAt };
      this.rows.set(executionId, row);
      return { rows: [row] };
    }

    if (normalized.startsWith('SELECT owner, expires_at FROM execution_leases WHERE execution_id = $1 AND expires_at > now()')) {
      const [executionId] = params as [string];
      const existing = this.rows.get(executionId);
      if (existing && new Date(existing.expires_at).getTime() > this.now().getTime()) {
        return { rows: [existing] };
      }
      return { rows: [] };
    }

    if (normalized.startsWith('SELECT owner, expires_at FROM execution_leases WHERE execution_id = $1')) {
      const [executionId] = params as [string];
      const existing = this.rows.get(executionId);
      return { rows: existing ? [existing] : [] };
    }

    if (normalized.startsWith('UPDATE execution_leases')) {
      const [executionId, owner, expiresAt] = params as [string, string, string];
      const existing = this.rows.get(executionId);
      const nowMs = this.now().getTime();
      const valid = existing && existing.owner === owner && new Date(existing.expires_at).getTime() > nowMs;
      if (!valid) {
        return { rows: [] };
      }
      const row = { execution_id: executionId, owner, expires_at: expiresAt };
      this.rows.set(executionId, row);
      return { rows: [row] };
    }

    if (normalized.startsWith('DELETE FROM execution_leases')) {
      const [executionId, owner] = params as [string, string];
      const existing = this.rows.get(executionId);
      if (existing && existing.owner === owner) {
        this.rows.delete(executionId);
      }
      return { rows: [] };
    }

    throw new Error(`FakePgLeasePool: unrecognized query: ${normalized}`);
  }
}

class FixedClock implements Clock {
  constructor(public current: Date) {}
  now(): Date {
    return this.current;
  }
  advance(ms: number): void {
    this.current = new Date(this.current.getTime() + ms);
  }
}

describe('PostgresExecutionLeaseStore', () => {
  it('acquires a lease on an unclaimed Execution', async () => {
    const pool = new FakePgLeasePool();
    const store = new PostgresExecutionLeaseStore(pool, new FixedClock(new Date('2024-01-01T00:00:00Z')));
    const id = ExecutionId.generate();

    const lease = await store.acquire(id, 'worker-1', 30_000);
    expect(lease.owner).toBe('worker-1');
    expect(lease.executionId.equals(id)).toBe(true);
  });

  it('throws ConflictError acquiring a lease a different, still-valid owner holds', async () => {
    const clock = new FixedClock(new Date('2024-01-01T00:00:00Z'));
    const pool = new FakePgLeasePool(() => clock.now());
    const store = new PostgresExecutionLeaseStore(pool, clock);
    const id = ExecutionId.generate();

    await store.acquire(id, 'worker-1', 60_000);
    await expect(store.acquire(id, 'worker-2', 30_000)).rejects.toThrow(ConflictError);
  });

  it('allows re-acquiring by the same owner (idempotent extension)', async () => {
    const clock = new FixedClock(new Date('2024-01-01T00:00:00Z'));
    const pool = new FakePgLeasePool(() => clock.now());
    const store = new PostgresExecutionLeaseStore(pool, clock);
    const id = ExecutionId.generate();

    await store.acquire(id, 'worker-1', 30_000);
    const second = await store.acquire(id, 'worker-1', 60_000);
    expect(second.owner).toBe('worker-1');
  });

  it('renew() extends a lease the same owner holds, and throws for a non-holder', async () => {
    const clock = new FixedClock(new Date('2024-01-01T00:00:00Z'));
    const pool = new FakePgLeasePool(() => clock.now());
    const store = new PostgresExecutionLeaseStore(pool, clock);
    const id = ExecutionId.generate();

    await store.acquire(id, 'worker-1', 30_000);
    const renewed = await store.renew(id, 'worker-1', 60_000);
    expect(renewed.owner).toBe('worker-1');

    await expect(store.renew(id, 'worker-2', 30_000)).rejects.toThrow(ConflictError);
  });

  it('release() then currentLease() confirms the lease is gone', async () => {
    const pool = new FakePgLeasePool();
    const store = new PostgresExecutionLeaseStore(pool);
    const id = ExecutionId.generate();

    await store.acquire(id, 'worker-1', 30_000);
    await store.release(id, 'worker-1');
    expect(await store.currentLease(id)).toBeUndefined();
  });

  it('currentLease() returns undefined for an expired lease', async () => {
    const clock = new FixedClock(new Date('2024-01-01T00:00:00Z'));
    const pool = new FakePgLeasePool(() => clock.now());
    const store = new PostgresExecutionLeaseStore(pool, clock);
    const id = ExecutionId.generate();

    await store.acquire(id, 'worker-1', 1_000);
    expect(await store.currentLease(id)).toBeDefined();

    clock.advance(2_000); // past the 1000ms lease duration
    expect(await store.currentLease(id)).toBeUndefined();
  });
});
