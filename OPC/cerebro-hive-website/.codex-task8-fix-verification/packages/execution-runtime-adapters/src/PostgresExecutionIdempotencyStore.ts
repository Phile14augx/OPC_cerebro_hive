import { ExecutionId } from '@cerebro/domain/src/execution/ExecutionId';
import {
  ExecutionIdempotencyRecord,
  ExecutionIdempotencyStore,
} from '@cerebro/domain/src/execution/ExecutionIdempotency';
import { PgQueryable } from './PgQueryable';

// See PostgresExecutionLeaseStore.ts's own note on why these are submodule
// imports, not the `@cerebro/domain` root barrel.

/**
 * Phase 9g-1 — a real Postgres-backed implementation of
 * `ExecutionIdempotencyStore` (`ExecutionIdempotency.ts`, Phase 9f-2/`ADR-045`),
 * replacing `InMemoryExecutionIdempotencyStore` for a multi-process
 * deployment where an idempotency key must be visible across worker
 * instances.
 *
 * SCHEMA (not migrated by this phase): a dedicated table, deliberately NOT
 * force-fit into `packages/database`'s existing, real `IdempotencyRecord`
 * model — that model is a generic cross-cutting shape keyed on
 * `(tenantId, requestHash)` with `operation`/`responseHash`/`status`
 * semantics for arbitrary idempotent operations; this contract's `reserve(key,
 * executionId)` is narrower and Execution-specific (no tenantId, no response
 * caching). Reconciling the two — e.g. by having this store's `key`
 * parameter *be* a `(tenantId, requestHash)` composite the caller
 * constructs, backed by the real shared table — is a real future option
 * this ADR deliberately leaves open rather than deciding under this phase's
 * pressure, mirroring `ADR-039`'s own deferred-canonical-schema discipline.
 * ```sql
 * CREATE TABLE execution_idempotency_keys (
 *   key          TEXT PRIMARY KEY,
 *   execution_id TEXT NOT NULL,
 *   created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
 * );
 * ```
 *
 * VERIFICATION BOUNDARY (see `ADR-046`): typechecked and unit-tested against
 * a fake `PgQueryable`; NOT run against a real PostgreSQL server in this
 * sandbox.
 */
export class PostgresExecutionIdempotencyStore implements ExecutionIdempotencyStore {
  constructor(private readonly pool: PgQueryable) {}

  async reserve(key: string, executionId: ExecutionId): Promise<ExecutionIdempotencyRecord> {
    const result = await this.pool.query(
      `INSERT INTO execution_idempotency_keys (key, execution_id)
       VALUES ($1, $2)
       ON CONFLICT (key) DO NOTHING
       RETURNING execution_id`,
      [key, executionId.toString()]
    );

    if (result.rows.length > 0) {
      // We won the reservation.
      return { executionId };
    }

    // Key already reserved by someone else — look up who.
    const existing = await this.pool.query(
      `SELECT execution_id FROM execution_idempotency_keys WHERE key = $1`,
      [key]
    );
    const row = existing.rows[0];
    return { executionId: ExecutionId.of(row.execution_id) };
  }
}
