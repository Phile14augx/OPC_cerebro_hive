import { RequestContext } from '@cerebro/db';
import { UnitOfWork } from '../transactions/UnitOfWork';
import { OutboxPublisher } from '../events/OutboxPublisher';
import { ExecutionRepository } from '../execution/ExecutionRepository';
import { ExecutionId } from '../execution/ExecutionId';
import { ExecutionTransitionOptions } from '../execution/Execution';
import { ExecutionStatus } from '../execution/ExecutionStatus';

/**
 * Coordinates Execution aggregate lifecycle transitions.
 * Responsible for loading the aggregate, performing a transition,
 * persisting the state, and publishing the emitted domain event
 * durably within a single transaction.
 */
export class ExecutionApplicationService {
  constructor(
    private readonly executionRepo: ExecutionRepository,
    private readonly uow: UnitOfWork,
    private readonly outboxPublisher: OutboxPublisher
  ) {}

  /**
   * Transitions an existing execution to a new state and durably publishes the lifecycle event.
   */
  async transition(
    executionId: string,
    targetStatus: ExecutionStatus,
    options: ExecutionTransitionOptions,
    context: RequestContext
  ): Promise<void> {
    const id = ExecutionId.of(executionId);

    await this.uow.execute(async (tx) => {
      // 1. Load Aggregate
      const execution = await this.executionRepo.load(id, tx);
      if (!execution) {
        throw new Error(`Execution not found: ${executionId}`);
      }
      
      const expectedVersion = execution.version;

      // 2. Transition Aggregate (Aggregate enforces all business rules)
      const event = execution.transitionTo(targetStatus, options);

      // 3. Persist Aggregate
      await this.executionRepo.save(execution, expectedVersion, tx);

      // 4. Persist Outbox Event
      await this.outboxPublisher.publish(event, context, tx);
    });
  }
}
