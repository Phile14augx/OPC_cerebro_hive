import { ExecutionReplayService } from '../ExecutionReplayService';
import { ExecutionStore } from '../ExecutionStore';

export class ReplayVerifier {
  constructor(
    private readonly store: ExecutionStore,
    private readonly replayService: ExecutionReplayService
  ) {}

  /**
   * Periodically invoked background job.
   * Pulls a random sample of COMPLETED executions and replays them from sequence 0.
   * Compares the final recomputed state against the stored ExecutionSnapshot.
   */
  public async verifyRandomSample(__sampleSize: number = 100): Promise<void> {
    // 1. In a real db, we'd query: SELECT execution_id FROM executions WHERE status = 'COMPLETED' ORDER BY RANDOM() LIMIT __sampleSize
    const executionsToVerify = ['exec-1', 'exec-2']; // Simulated

    for (const execId of executionsToVerify) {
      await this.verifyExecution(execId);
    }
  }

  public async verifyExecution(executionId: string): Promise<boolean> {
    const snapshot = await this.store.getLatestSnapshot(executionId);
    if (!snapshot) {
      // Nothing to verify against
      return true;
    }

    // Force replay from sequence 0 by overriding snapshot optimization
    const pureState = await this.replayService.replay(executionId, { snapshotId: 'ignore' });

    // Compute hash of pureState and compare to snapshot.hash
    // For this simulation, we'll assume a structural comparison
    const isMatch = this.compareStates(pureState, snapshot.state);

    if (!isMatch) {
      console.error(`[ReplayVerifier] Parity failure on execution ${executionId}!`);
      // Emit ReplayParityFailed event for alerting
      return false;
    }

    return true;
  }

  private compareStates(replayedState: unknown, snapshotState: unknown): boolean {
    // Shallow structural check for simulation
    return replayedState.sequence === snapshotState.sequence &&
           replayedState.activeToolCalls.length === snapshotState.activeToolCalls.length;
  }
}
