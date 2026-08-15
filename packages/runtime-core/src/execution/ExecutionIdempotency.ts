import { ExecutionStore } from './ExecutionStore.js';

export class ExecutionIdempotencyGuard {
  constructor(private readonly store: ExecutionStore) {}

  /**
   * Validates if a resume request is safe.
   * Compares the provided expected sequence/step against the latest state in the store.
   * Prevents re-executing tools or re-running already completed states.
   */
  async assertIdempotentResume(executionId: string, expectedSequence: bigint): Promise<void> {
    const events = await this.store.getEvents(executionId);
    
    if (events.length === 0) {
      if (expectedSequence > 0n) {
        throw new Error(`Idempotency violation: execution ${executionId} has no events, but resume expected sequence ${expectedSequence}`);
      }
      return; // Safe to start
    }

    const latest = events[events.length - 1];
    if (!latest) {
      return;
    }
    const latestSequence = latest.sequence;

    if (latestSequence !== expectedSequence) {
      throw new Error(
        `Idempotency violation: Execution ${executionId} is at sequence ${latestSequence}, but resume requested for sequence ${expectedSequence}. ` +
        `This usually means another worker already processed this step.`
      );
    }
  }
}
