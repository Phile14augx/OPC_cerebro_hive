import { Execution } from './Execution';
import { ExecutionId } from './ExecutionId';
import { ExecutionRepository } from './ExecutionRepository';
import {
  ExecutionSnapshot,
  ExecutionTransitionRecordSnapshot,
  toExecutionSnapshot,
  fromExecutionSnapshot,
} from './ExecutionSnapshot';
import { ConcurrencyError } from '../errors/DomainError';
import { ITransactionContext } from '../transactions/UnitOfWork';

/**
 * Phase 9d's first real `ExecutionRepository` implementation — standalone,
 * per explicit direction: an in-memory store, not `@cerebro/db`'s live
 * Prisma schema. Reconciled (post-9d) to the mandatory-`expectedVersion`
 * contract `ExecutionRepository.ts` now declares: every stored entry tracks
 * the `version` value that was true the last time this Execution was
 * successfully persisted, alongside its snapshot.
 *
 * Concurrency contract: `save()`'s `expectedVersion` must equal whatever
 * version is currently stored (0 if nothing has been persisted for this id
 * yet), or a `ConcurrencyError` is thrown. On success, the stored version
 * becomes `execution.version` — the aggregate's own version (incremented by
 * `Execution.transitionTo()` on every legal transition; unchanged by
 * non-transition mutators like `addChildExecution()`). This repository does
 * not invent its own version arithmetic; it only trusts and persists
 * whatever `execution.version` already is, which is what makes "the caller
 * captures the version immediately before mutating, then passes that as
 * `expectedVersion`" a correct, general calling convention — see
 * `ExecutionOrchestrator.ts`'s `transitionAndPersist()` for the canonical
 * example.
 *
 * Still not evidence that persistence works against a real database — that
 * remains a future, separate milestone once `ADR-039`'s deferred
 * canonical-schema decision is made.
 */
export class InMemoryExecutionRepository implements ExecutionRepository {
  private readonly store = new Map<string, { version: number; snapshot: ExecutionSnapshot }>();

  async save(execution: Execution, expectedVersion: number, _tx?: ITransactionContext): Promise<void> {
    const key = execution.id.toString();
    const existing = this.store.get(key);
    const currentVersion = existing?.version ?? 0;

    if (currentVersion !== expectedVersion) {
      throw new ConcurrencyError(
        `Execution ${key} was modified concurrently — expected version ${expectedVersion}, found ${currentVersion}.`
      );
    }

    this.store.set(key, {
      version: execution.version,
      snapshot: toExecutionSnapshot(execution),
    });
  }

  async load(id: ExecutionId, _tx?: ITransactionContext): Promise<Execution | undefined> {
    const entry = this.store.get(id.toString());
    return entry ? fromExecutionSnapshot(entry.snapshot) : undefined;
  }

  async exists(id: ExecutionId, _tx?: ITransactionContext): Promise<boolean> {
    return this.store.has(id.toString());
  }

  async loadTransitions(
    id: ExecutionId,
    _tx?: ITransactionContext
  ): Promise<readonly ExecutionTransitionRecordSnapshot[]> {
    const entry = this.store.get(id.toString());
    return entry ? entry.snapshot.transitionHistory : [];
  }

  async findChildren(parentId: ExecutionId, _tx?: ITransactionContext): Promise<readonly Execution[]> {
    return Array.from(this.store.values())
      .map((entry) => fromExecutionSnapshot(entry.snapshot))
      .filter((execution) => execution.parentExecutionId?.equals(parentId));
  }

  /** Exposed for tests and for callers that need to reason about optimistic
   * concurrency explicitly (e.g. "read the current stored version before I
   * attempt a conditional save") — not part of the shared
   * `ExecutionRepository` contract, since a real Prisma-backed
   * implementation might expose this differently (e.g. a row version column
   * queried some other way). */
  getVersion(id: ExecutionId): number | undefined {
    return this.store.get(id.toString())?.version;
  }

  /** Phase 10 — a real, additive listing capability, not part of the shared
   * `ExecutionRepository` contract (which was deliberately scoped to
   * per-id operations only, since the orchestrator itself never needs to
   * list). Added because a real live caller (a REST "list executions"
   * endpoint) genuinely needs one — a query capability a database-backed
   * implementation would express as a real indexed query (`WHERE tenant_id
   * = ? [AND status = ?] ORDER BY created_at DESC LIMIT ?`), not a full
   * table scan. This in-memory implementation is honest about being O(n) —
   * fine for tests and small in-process deployments, not a claim about
   * performance at scale. */
  listByTenant(
    tenantId: string,
    opts: { status?: ExecutionSnapshot['status']; limit?: number } = {}
  ): readonly Execution[] {
    const all = Array.from(this.store.values())
      .map((entry) => fromExecutionSnapshot(entry.snapshot))
      .filter((execution) => execution.tenantId === tenantId)
      .filter((execution) => (opts.status ? execution.status === opts.status : true))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return opts.limit !== undefined ? all.slice(0, opts.limit) : all;
  }
}
