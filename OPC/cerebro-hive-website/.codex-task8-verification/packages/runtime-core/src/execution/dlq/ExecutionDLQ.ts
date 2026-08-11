import { ExecutionStore } from '../ExecutionStore';

export interface PoisonExecution {
  executionId: string;
  failedSequence: bigint;
  errorMessage: string;
  errorStack?: string;
  retryCount: number;
  quarantinedAt: Date;
  status: 'QUARANTINED' | 'REQUEUED' | 'DROPPED';
}

export interface DLQMetrics {
  dlqDepth: number;
  poisonExecutionCount: number;
  retryAttempts: number;
  successfulRecoveries: number;
}

export interface ExecutionDLQStore {
  savePoisonExecution(execution: PoisonExecution): Promise<void>;
  getPoisonExecution(executionId: string): Promise<PoisonExecution | null>;
  listQuarantined(): Promise<PoisonExecution[]>;
  
  // Metrics
  getDLQMetrics(): Promise<DLQMetrics>;
}

/**
 * Manages Poison Executions (executions that deterministically crash 
 * on the same sequence) to prevent Head-of-Line blocking.
 */
export class ExecutionDLQManager {
  private static readonly MAX_RETRIES = 3;

  constructor(
    private readonly dlqStore: ExecutionDLQStore,
    private readonly executionStore: ExecutionStore
  ) {}

  /**
   * Tracks an execution failure. If it fails too many times at the exact same sequence,
   * it is quarantined to the DLQ.
   */
  public async handleExecutionFailure(executionId: string, currentSequence: bigint, error: Error): Promise<void> {
    let poison = await this.dlqStore.getPoisonExecution(executionId);
    
    if (poison && poison.failedSequence === currentSequence && poison.status !== 'REQUEUED') {
      poison.retryCount++;
    } else {
      poison = {
        executionId,
        failedSequence: currentSequence,
        errorMessage: error.message,
        errorStack: error.stack,
        retryCount: 1,
        quarantinedAt: new Date(),
        status: 'QUARANTINED'
      };
    }

    if (poison.retryCount >= ExecutionDLQManager.MAX_RETRIES) {
      poison.status = 'QUARANTINED';
      
      // Mark the actual execution as POISONED in the main store to stop workers from picking it up
      await this.executionStore.updateExecution(
        executionId,
        { status: 'POISONED' as any }, // Assuming POISONED is added to ExecutionState
        -1, // We would normally use expectedVersion here
        0n  // Fake fencing token for DLQ quarantine (in real system, DLQ worker needs lease)
      );
    }

    await this.dlqStore.savePoisonExecution(poison);
  }

  /**
   * Manually requeues a quarantined execution after an operator has patched the runtime 
   * or fixed the poison event.
   */
  public async requeue(executionId: string): Promise<void> {
    const poison = await this.dlqStore.getPoisonExecution(executionId);
    if (!poison || poison.status !== 'QUARANTINED') {
      throw new Error(`Execution ${executionId} is not quarantined.`);
    }

    poison.status = 'REQUEUED';
    poison.retryCount = 0;
    await this.dlqStore.savePoisonExecution(poison);

    // Update the execution status back to PENDING/RUNNING to allow workers to pick it up again
    await this.executionStore.updateExecution(
      executionId,
      { status: 'PENDING' as any },
      -1,
      0n
    );
  }
}
