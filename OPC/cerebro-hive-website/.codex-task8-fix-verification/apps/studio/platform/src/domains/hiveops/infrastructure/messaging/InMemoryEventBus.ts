import { DomainEvent } from "../../domain/events/DomainEvent";
import { IEventBus } from "../../domain/events/IEventBus";

export class InMemoryEventBus implements IEventBus {
  private handlers: Map<string, Array<(event: DomainEvent) => Promise<void>>> = new Map();

  async publish(event: DomainEvent): Promise<void> {
    const eventHandlers = this.handlers.get(event.eventName) || [];
    // Execute handlers asynchronously to not block the publisher
    Promise.all(eventHandlers.map(handler => handler(event).catch(err => {
      console.error(`Error in event handler for ${event.eventName}:`, err);
    })));
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  subscribe(eventName: string, handler: (event: DomainEvent) => Promise<void>): void {
    const currentHandlers = this.handlers.get(eventName) || [];
    currentHandlers.push(handler);
    this.handlers.set(eventName, currentHandlers);
  }
}
