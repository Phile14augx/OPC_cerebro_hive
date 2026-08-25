import { ExecutionBatch, ExecutionPlan } from './models';
import { CoordinatorStateMachine } from './CoordinatorStateMachine';
import { ExecutionSessionRegistry } from './ExecutionSessionRegistry';
import { IExecutionQueue } from './InMemoryExecutionQueue';
import { ISchedulingStrategy } from './SchedulingStrategy';
import { RuntimeResolver } from '../runtime/RuntimeResolver';

export class ExecutionCoordinator {
  private readonly stateMachine = new CoordinatorStateMachine();
  private readonly registry = new ExecutionSessionRegistry();

  constructor(
    private readonly queue: IExecutionQueue,
    private readonly scheduler: ISchedulingStrategy,
    private readonly resolver: RuntimeResolver
  ) {}

  async processBatch(plan: ExecutionPlan): Promise<ExecutionBatch> {
    this.stateMachine.transitionTo('Queued');
    
    // Scaffold: The actual loop would use this.scheduler.next(this.queue)
    // and launch sessions mapped in this.registry
    
    this.stateMachine.transitionTo('Scheduling');
    this.stateMachine.transitionTo('Executing');
    
    // Simulate batch execution finishing
    this.stateMachine.transitionTo('Completed');

    return {
      batchId: `batch-${Date.now()}`,
      reviewId: 'rev-123',
      plan,
      state: this.stateMachine.getState(),
      progress: {
        totalAnalyzers: plan.nodes.length,
        queued: 0,
        running: 0,
        completed: plan.nodes.length,
        failed: 0,
        percentComplete: 100
      },
      results: []
    };
  }

  async cancelAll(): Promise<void> {
    this.stateMachine.transitionTo('Cancelled');
    const _sessions = this.registry.getAllActive();
    // For each session, invoke cancellation token or force termination
  }
}
