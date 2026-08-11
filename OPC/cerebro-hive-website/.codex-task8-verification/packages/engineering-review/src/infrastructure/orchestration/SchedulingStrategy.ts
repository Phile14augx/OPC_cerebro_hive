import { ExecutionPlanNode, ExecutionPlan } from './models';
import { IExecutionQueue } from './InMemoryExecutionQueue';

export interface ISchedulingStrategy {
  /**
   * Defines how nodes should be extracted from the queue for execution.
   */
  next(queue: IExecutionQueue): Promise<ExecutionPlanNode | null>;
}

export class FIFOStrategy implements ISchedulingStrategy {
  async next(queue: IExecutionQueue): Promise<ExecutionPlanNode | null> {
    return queue.dequeue();
  }
}

import { AdmissionDecision } from './models';

export class AdmissionController {
  constructor(private readonly globalConcurrencyLimit: number) {}

  admit(plan: ExecutionPlan): AdmissionDecision {
    if (plan.nodes.length > this.globalConcurrencyLimit) {
      return { decision: 'Rejected', reason: 'Concurrency quota exceeded' };
    }
    return { decision: 'Accepted' };
  }
}
