import { ExecutionId } from '@cerebro/domain/src/execution/ExecutionId';
import { ExecutionLease, ExecutionLeaseStore } from '@cerebro/domain/src/execution/ExecutionLease';
import { Clock, SystemClock } from '@cerebro/domain/src/execution/Clock';
import { ConflictError } from '@cerebro/domain/src/errors/DomainError';
import { PgQueryable } from './PgQueryable';

// NOTE: imported from these specific submodule paths, not the `@cerebro/domain`
// root barrel — the root `index.ts` also re-exports files (e.g.
// `AgentApplicationService.ts`, `PolicyEngine.ts`) that depend on
// `@cerebro/db`'s generated `@prisma/client`, which does not exist in
// this sandbox. Importing the specific execution/ submodules this file
// actually needs avoids pulling that unrelated, unresolvable subtree into
// this file's own typecheck — the same "scope tsc to execution/ only" pattern
// used throughout Phase 9.

/**
 * Phase 9g-1 — a real Postgres-backed implementation of `ExecutionLeaseStore`
 * (`ExecutionLease.ts`, Phase 9f-2/`ADR-045`), replacing
 * `InMemoryExecutionLeaseStore` for a multi-process deployment where leases
 * must be visible across worker instances, not just within one Node
 * process's memory.
 *
 * SCHEMA (not migrated by this phase — no live Prisma schema is touched,
 * same deferred-canonical-schema discipline `ADR-039` established):
 * ```sql
 * CREATE TABLE execution_leases (
 *   execution_id TEXT PRIMARY KEY,
 *   owner        TEXT NOT NULL,
 *   expires_at   TIMESTAMPTZ NOT NULL
 * );
 * ```
 *
 * `acquire()`'s conditional `ON CONFLICT ... DO UPDATE ... WHERE` clause is
 * what makes the "succeed if unclaimed, expired, or already held by the same
 * owner; fail if a different still-valid owner holds it" contract atomic at
 * the database level, not a check-then-write race in application code — the
 * same real-world correctness property `InMemoryExecutionLeaseStore`
 * approximates in-memory (single-process) via a plain `Map`.
 *
 * VERIFICATION BOUNDARY (see `ADR-046`): this class is typechecked and its
 * SQL/parameter-binding/result-interpretation logic is unit-tested against a
 * fake `PgQueryable` in this sandbox. It has NOT been run against a real
 * PostgreSQL server — there is none reachable here. The SQL above is
 * standard, idiomatic Postgres, but "the SQL is correct against a real
 * engine" is explicitly NOT claimed as verified, only as written.
 */
export class PostgresExecutionLeaseStore implements ExecutionLeaseStore {
  constructor(
    private readonly pool: PgQueryable,
    private readonly clock: Clock = new SystemClock()
  ) {}

  async acquire(executionId: ExecutionId, owner: string, durationMs: number): Promise<ExecutionLease> {
    const key = executionId.toString();
    const expiresAt = new Date(this.clock.now().getTime() + durationMs);

    const result = await this.pool.query(
      `INSERT INTO execution_leases (execution_id, owner, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (execution_id) DO UPDATE
         SET owner = EXCLUDED.owner, expires_at = EXCLUDED.expires_at
         WHERE execution_leases.owner = EXCLUDED.owner OR execution_leases.expires_at <= now()
       RETURNING execution_id, owner, expires_at`,
      [key, owner, expiresAt.toISOString()]
    );

    if (result.rows.length === 0) {
      // The conditional UPDATE did not apply — a different, still-valid
      // owner holds the lease. Look it up to build an informative error,
      // mirroring InMemoryExecutionLeaseStore's own ConflictError message.
      const existing = await this.pool.query(
        `SELECT owner, expires_at FROM execution_leases WHERE execution_id = $1`,
        [key]
      );
      const row = existing.rows[0] as { owner: string; expires_at: string } | undefined;
      throw new ConflictError(
        `Execution ${key} is already leased by "${row?.owner}" until ${row?.expires_at}.`
      );
    }

    const row = result.rows[0] as { owner: string; expires_at: string };
    return { executionId, owner: row.owner, expiresAt: new Date(row.expires_at) };
  }

  async renew(executionId: ExecutionId, owner: string, durationMs: number): Promise<ExecutionLease> {
    const key = executionId.toString();
    const expiresAt = new Date(this.clock.now().getTime() + durationMs);

    const result = await this.pool.query(
      `UPDATE execution_leases
         SET expires_at = $3
         WHERE execution_id = $1 AND owner = $2 AND expires_at > now()
       RETURNING execution_id, owner, expires_at`,
      [key, owner, expiresAt.toISOString()]
    );

    if (result.rows.length === 0) {
      throw new ConflictError(`"${owner}" does not currently hold a valid lease on Execution ${key} to renew.`);
    }

    const row = result.rows[0] as { owner: string; expires_at: string };
    return { executionId, owner: row.owner, expiresAt: new Date(row.expires_at) };
  }

  async release(executionId: ExecutionId, owner: string): Promise<void> {
    await this.pool.query(`DELETE FROM execution_leases WHERE execution_id = $1 AND owner = $2`, [
      executionId.toString(),
      owner,
    ]);
    // 0 rows affected (no lease, or held by someone else) is not an error —
    // same no-op-for-non-holder contract as InMemoryExecutionLeaseStore.
  }

  async currentLease(executionId: ExecutionId): Promise<ExecutionLease | undefined> {
    const result = await this.pool.query(
      `SELECT owner, expires_at FROM execution_leases WHERE execution_id = $1 AND expires_at > now()`,
      [executionId.toString()]
    );
    if (result.rows.length === 0) {
      return undefined;
    }
    const row = result.rows[0] as { owner: string; expires_at: string };
    return { executionId, owner: row.owner, expiresAt: new Date(row.expires_at) };
  }
}
