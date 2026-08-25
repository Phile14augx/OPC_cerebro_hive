import { __ExecutionEvent } from '@cerebro/runtime-contracts/src/events/__ExecutionEvent';
import { ExecutionStore } from '../ExecutionStore';
import { ExecutionProjectionManager } from './ExecutionProjectionManager';

/**
 * Rebuilds projections from the raw event stream.
 * This is used during migrations or when introducing a new read model.
 */
export class RebuildProjectionPipeline {
  constructor(
    private readonly eventStore: ExecutionStore,
    private readonly projectionManager: ExecutionProjectionManager
  ) {}

  /**
   * Rebuilds all read models for a specific execution from sequence 0.
   */
  public async rebuildExecution(executionId: string): Promise<void> {
    const events = await this.eventStore.getEvents(executionId);
    if (!events || events.length === 0) {
      return;
    }
    await this.projectionManager.rebuildFromStream(executionId, events);
  }

  /**
   * Verifies that the projected state matches the event stream state.
   * Useful for background inconsistency detection.
   */
  public async verifyProjectionConsistency(executionId: string, currentProjectedState: unknown): Promise<boolean> {
    // In a real system, we'd hydrate an in-memory projection and deep-compare it to currentProjectedState.
    // For now, we simulate the hydration and return a boolean based on parity.
    const events = await this.eventStore.getEvents(executionId);
    let reconstructedState: unknown = { totalSteps: 0, status: 'RUNNING' };

    for (const event of events) {
      if (event.type === 'StepCompleted') {
        reconstructedState.totalSteps++;
      } else if (event.type === 'ExecutionCompleted') {
        reconstructedState.status = 'COMPLETED';
      } else if (event.type === 'ExecutionFailed') {
        reconstructedState.status = 'FAILED';
      }
    }

    // Simplified comparison logic
    return reconstructedState.totalSteps === currentProjectedState.totalSteps 
        && reconstructedState.status === currentProjectedState.status;
  }
}
