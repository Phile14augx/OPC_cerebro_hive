import { ExecutionEvent } from '@cerebro/runtime-contracts/src/events/ExecutionEvent';
import { ExecutionProjectionStore, ExecutionSummary } from './ExecutionProjectionStore';

/**
 * Subscribes to the Event Stream and routes events to the appropriate Read Models.
 */
export class ExecutionProjectionManager {
  constructor(private readonly store: ExecutionProjectionStore) {}

  public async handleEvent(executionId: string, event: ExecutionEvent<any>): Promise<void> {
    switch (event.type) {
      case 'ExecutionStarted':
        await this.handleExecutionStarted(executionId, event);
        break;
      case 'StepCompleted':
        await this.handleStepCompleted(executionId, event);
        break;
      case 'ExecutionCompleted':
      case 'ExecutionFailed':
        await this.handleExecutionTerminal(executionId, event);
        break;
    }
  }

  public async rebuildFromStream(executionId: string, events: ExecutionEvent<any>[]): Promise<void> {
    for (const event of events) {
      await this.handleEvent(executionId, event);
    }
  }

  private async handleExecutionStarted(executionId: string, event: ExecutionEvent<any>): Promise<void> {
    const summary: ExecutionSummary = {
      executionId,
      agentId: event.payload.agentId || 'unknown',
      status: 'RUNNING',
      startedAt: new Date(),
      totalSteps: 0,
      totalCost: 0,
      projectionVersion: 1,
      schemaVersion: 1,
      rebuiltAt: new Date(),
      originatingEventSequence: event.sequence
    };
    await this.store.saveExecutionSummary(summary);
  }

  private async handleStepCompleted(executionId: string, event: ExecutionEvent<any>): Promise<void> {
    const summary = await this.store.getExecutionSummary(executionId);
    if (summary) {
      summary.totalSteps += 1;
      // If we had cost in the event payload, we'd add it here.
      await this.store.saveExecutionSummary(summary);
    }
  }

  private async handleExecutionTerminal(executionId: string, event: ExecutionEvent<any>): Promise<void> {
    const summary = await this.store.getExecutionSummary(executionId);
    if (summary) {
      summary.status = event.type === 'ExecutionCompleted' ? 'COMPLETED' : 'FAILED';
      summary.completedAt = new Date();
      await this.store.saveExecutionSummary(summary);
    }
  }
}
