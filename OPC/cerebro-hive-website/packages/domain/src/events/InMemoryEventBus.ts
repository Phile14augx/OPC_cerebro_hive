import { DomainEvent } from './DomainEvent';
import { EventBus } from './EventBus';

export class InMemoryEventBus implements EventBus {
  private handlers: Map<string, Array<(event: DomainEvent) => Promise<void>>> = new Map();

  async publish(event: DomainEvent): Promise<void> {
    const eventType = event.constructor.name;
    const typeHandlers = this.handlers.get(eventType) || [];
    
    // Fire handlers concurrently but gracefully handle rejections
    await Promise.allSettled(typeHandlers.map(handler => handler(event)));
  }

  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
    const typeHandlers = this.handlers.get(eventType) || [];
    typeHandlers.push(handler);
    this.handlers.set(eventType, typeHandlers);
  }

  unsubscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
    const typeHandlers = this.handlers.get(eventType) || [];
    this.handlers.set(
      eventType,
      typeHandlers.filter(h => h !== handler)
    );
  }
}
