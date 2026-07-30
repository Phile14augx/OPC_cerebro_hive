import { Execution } from './Execution';
import { ExecutionId } from './ExecutionId';
import { ExecutionRepository } from './ExecutionRepository';
import { ExecutionSnapshot, toExecutionSnapshot, fromExecutionSnapshot } from './ExecutionSnapshot';
import { ConcurrencyError } from '../errors/DomainError';
import { ITransactionContext } from '../transactions/UnitOfWork';

/**
 * Phase 9d's first real `ExecutionRepository` implementation — standalone,
 * per explicit direction: an in-memory store, not `@cerebro/database`'s live
 * Prisma schema. This is deliberately more than a test fake (it round-trips
 * through `ExecutionSnapshot`'s real serialize/deserialize functions and
 * enforces the same optimistic-concurrency contract a real database-backed
 * implementation would), but it is still not evidence that persistence
 * works against a real database — that remains a future, separate
 * milestone once `ADR-039`'s deferred canonical-schema decision is made.
 *
 * Each stored entry tracks a `revision` (the persisted Execution's
 * `transitionHistory.length` at save time) alongside its snapshot, which is
 * what makes `save()`'s optional `expectedRevision` optimistic-concurrency
 * check possible without adding a version field to the aggregate itself.
 */
export class InMemoryExecutionRepository implements ExecutionRepository {
  private readonly store = new Map<string, { revision: number; snapshot: ExecutionSnapshot }>();

  async save(execution: Execution, _tx?: ITransactionContext, opts?: { expectedRevision?: number }): Promise<void> {
    const key = execution.id.toString();
    const existing = this.store.get(key);
    const currentRevision = existing?.revision ?? 0;

    if (opts?.expectedRevision !== undefined && opts.expectedRevision !== currentRevision) {
      throw new ConcurrencyError(
        `Execution ${key} was modified concurrently — expected revision ${opts.expectedRevision}, found ${currentRevision}.`
      );
    }

    this.store.set(key, {
      revision: execution.transitionHistory.length,
      snapshot: toExecutionSnapshot(execution),
    });
  }

  async findById(id: ExecutionId, _tx?: ITransactionContext): Promise<Execution | undefined> {
    const entry = this.store.get(id.toString());
    return entry ? fromExecutionSnapshot(entry.snapshot) : undefined;
  }

  async findChildren(parentId: ExecutionId, _tx?: ITransactionContext): Promise<readonly Execution[]> {
    return Array.from(this.store.values())
      .map((entry) => fromExecutionSnapshot(entry.snapshot))
      .filter((execution) => execution.parentExecutionId?.equals(parentId));
  }

  /** Exposed for tests and for callers that need to reason about optimistic
   * concurrency explicitly (e.g. "read the current revision before I attempt
   * a conditional save") — not part of the shared `ExecutionRepository`
   * contract, since a real Prisma-backed implementation might expose this
   * differently (e.g. a row version column queried some other way). */
  getRevision(id: ExecutionId): number | undefined {
    return this.store.get(id.toString())?.revision;
  }
}
