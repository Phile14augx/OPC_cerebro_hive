import { ExecutionPlanNode } from './models';

export interface IExecutionQueue {
  enqueue(node: ExecutionPlanNode): Promise<void>;
  dequeue(): Promise<ExecutionPlanNode | null>;
  peek(): Promise<ExecutionPlanNode | null>;
  size(): Promise<number>;
  clear(): Promise<void>;
}

export class InMemoryExecutionQueue implements IExecutionQueue {
  private queue: ExecutionPlanNode[] = [];

  async enqueue(node: ExecutionPlanNode): Promise<void> {
    this.queue.push(node);
  }

  async dequeue(): Promise<ExecutionPlanNode | null> {
    return this.queue.shift() || null;
  }

  async peek(): Promise<ExecutionPlanNode | null> {
    if (this.queue.length === 0) return null;
    return this.queue[0];
  }

  async size(): Promise<number> {
    return this.queue.length;
  }

  async clear(): Promise<void> {
    this.queue = [];
  }
}
