import { ExecutionEvent, ExecutionEventType } from './ExecutionEvents';

export interface ExecutionEventSubscriber {
  onEvent(event: ExecutionEvent): void | Promise<void>;
}

export class ExecutionEventPublisher {
  private subscribers: ExecutionEventSubscriber[] = [];

  subscribe(subscriber: ExecutionEventSubscriber) {
    this.subscribers.push(subscriber);
  }

  async publish(type: ExecutionEventType, executionId: string, payload?: any): Promise<void> {
    const event: ExecutionEvent = {
      type,
      executionId,
      timestamp: Date.now(),
      payload
    };

    // Dispatch to all subscribers asynchronously to avoid blocking the hot path
    Promise.allSettled(
      this.subscribers.map(sub => sub.onEvent(event))
    ).catch(err => {
      console.error(`Error publishing execution event ${type}:`, err);
    });
  }
}
