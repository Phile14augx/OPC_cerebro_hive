import { Execution, ExecutionTransitionRecord } from './Execution';
import { ExecutionId } from './ExecutionId';
import { ITransactionContext } from '../transactions/UnitOfWork';
import { ExecutionTransitionRecordSnapshot } from './ExecutionSnapshot';

/**
 * Phase 9a's persistence *contract* for the canonical `Execution` aggregate.
 * Concurrency control is mandatory version-based optimistic concurrency
 * (every `save()` call must state the version it expects to overwrite), not
 * an opt-in parameter — see `save()`'s own doc comment below.
 * `packages/domain/src/execution/InMemoryExecutionRepository.ts` (Phase 9d,
 * reconciled to this contract post-9d) is the first real implementation —
 * standalone, not backed by
 * `@cerebro/db`'s live Prisma schema. Whether/how to migrate
 * `WorkflowExecution`/`AgentExecution` onto this contract remains
 * undecided, per `ADR-039` decision 6, unchanged by this file.
 *
 * Uses this package's own opaque `ITransactionContext` (see
 * `transactions/UnitOfWork.ts`), NOT `@cerebro/db`'s Prisma-coupled
 * `IRepositoryOptions` — the same "don't reach across a bounded-context
 * boundary for one type" reasoning already applied to `ExecutionId` staying
 * off `packages/domain-model`'s `Identifier<Brand>`. A concrete future
 * Prisma-backed implementation is free to accept a `PrismaTransactionClient`
 * cast out of this opaque marker, exactly as `@cerebro/db`'s
 * repositories already do with their own `tx` option — that is an
 * implementation-side decision, not part of this contract.
 *
 * Deliberately excluded from this contract, because they are not this
 * aggregate's job: querying/listing executions by arbitrary filter (a read-
 * model concern, not decided here), and any transactional-outbox event
 * publishing (Phase 9e). Checkpoint persistence is its own separate contract
 * (`ExecutionCheckpointStore.ts`), not folded into this one — a checkpoint is
 * an explicit, named recovery point, distinct from "the current state,"
 * which is what `save`/`findById` already give you.
 */
export interface ExecutionRepository {
  /** 
   * Persists a brand-new or updated Execution.
   * `expectedVersion` is mandatory for optimistic concurrency (enforced by the repository).
   * If the stored version does not match `expectedVersion`, a ConcurrencyError must be thrown.
   * On successful save, the implementation increments the version.
   */
  save(execution: Execution, expectedVersion: number, tx?: ITransactionContext): Promise<void>;

  /** 
   * Loads a single Execution by its canonical id, or `undefined` if no such
   * Execution has been persisted.
   */
  load(id: ExecutionId, tx?: ITransactionContext): Promise<Execution | undefined>;

  /** 
   * Checks if an Execution exists by ID without fully loading it.
   */
  exists(id: ExecutionId, tx?: ITransactionContext): Promise<boolean>;

  /** 
   * Loads all historical transitions for an Execution, used for historical replay or auditing.
   * Note: `load` already rehydrates the aggregate's current state (and potentially its transition history).
   * This is explicitly for loading the raw transition log.
   */
  loadTransitions(
    id: ExecutionId,
    tx?: ITransactionContext
  ): Promise<readonly (ExecutionTransitionRecord | ExecutionTransitionRecordSnapshot)[]>;

  /** 
   * Loads every Execution that declares the given Execution as its strict parent.
   */
  findChildren(parentId: ExecutionId, tx?: ITransactionContext): Promise<readonly Execution[]>;
}
