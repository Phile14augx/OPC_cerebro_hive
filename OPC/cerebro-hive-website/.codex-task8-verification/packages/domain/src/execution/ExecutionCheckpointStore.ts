import { ExecutionId } from './ExecutionId';
import { ExecutionSnapshot } from './ExecutionSnapshot';

/**
 * Phase 9d — an explicit, named recovery point for an `Execution`, distinct
 * from `ExecutionRepository.save()`/`findById()`, which reflect only "the
 * current state." A checkpoint is a deliberate snapshot at a point in time
 * that recovery logic can rewind to — the Slice 5 review's own finding
 * (`packages/database`'s unused `ExecutionCheckpoint` model, with
 * `contextSnapshot`/`variables`/`pendingActions`/`eventOffset`) is the
 * precedent this shape follows in spirit ("reuse before invention"), though
 * this is a new, package-local type, not that Prisma model — this phase
 * does not touch `packages/database`'s schema at all, per explicit
 * direction to stay standalone.
 */
export interface ExecutionCheckpoint {
  readonly executionId: string;
  /** The Execution's `transitionHistory.length` at the moment this
   * checkpoint was taken — lets a caller compare a checkpoint's age against
   * the current persisted revision (`InMemoryExecutionRepository.getRevision()`
   * or its future real-database equivalent). */
  readonly revision: number;
  readonly snapshot: ExecutionSnapshot;
  readonly createdAt: Date;
}

export interface ExecutionCheckpointStore {
  saveCheckpoint(checkpoint: ExecutionCheckpoint): Promise<void>;
  /** Returns the checkpoint with the highest `revision` recorded for this
   * Execution, or `undefined` if none has ever been saved. */
  loadLatestCheckpoint(executionId: ExecutionId): Promise<ExecutionCheckpoint | undefined>;
}

/** Phase 9d's standalone in-memory implementation — keeps every checkpoint
 * ever saved (no pruning), since this phase does not decide a retention
 * policy; that is a future operational concern, not fixed here. */
export class InMemoryExecutionCheckpointStore implements ExecutionCheckpointStore {
  private readonly checkpointsByExecutionId = new Map<string, ExecutionCheckpoint[]>();

  async saveCheckpoint(checkpoint: ExecutionCheckpoint): Promise<void> {
    const existing = this.checkpointsByExecutionId.get(checkpoint.executionId) ?? [];
    this.checkpointsByExecutionId.set(checkpoint.executionId, [...existing, checkpoint]);
  }

  async loadLatestCheckpoint(executionId: ExecutionId): Promise<ExecutionCheckpoint | undefined> {
    const checkpoints = this.checkpointsByExecutionId.get(executionId.toString());
    if (!checkpoints || checkpoints.length === 0) {
      return undefined;
    }
    return checkpoints.reduce((latest, candidate) => (candidate.revision > latest.revision ? candidate : latest));
  }
}
