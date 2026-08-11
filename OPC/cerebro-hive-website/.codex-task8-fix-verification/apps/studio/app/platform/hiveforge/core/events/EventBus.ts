import { EventBus, DomainEvent, EventCategory, EventHandler } from "../contracts/event";

export class InMemoryEventBus implements EventBus {
  private subscribers: Map<EventCategory, Map<string, Set<EventHandler>>> = new Map();
  private globalSubscribers: Set<EventHandler> = new Set();

  publish<T>(event: Omit<DomainEvent<T>, "id" | "timestamp">): void {
    const fullEvent: DomainEvent<T> = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    // Notify global subscribers
    for (const handler of Array.from(this.globalSubscribers)) {
      this.safeInvoke(handler, fullEvent);
    }

    // Notify specific subscribers
    const categoryMap = this.subscribers.get(event.category);
    if (categoryMap) {
      const typeSet = categoryMap.get(event.type);
      if (typeSet) {
        for (const handler of Array.from(typeSet)) {
          this.safeInvoke(handler, fullEvent);
        }
      }
    }
  }

  subscribe<T>(category: EventCategory, type: string, handler: EventHandler<T>): () => void {
    if (!this.subscribers.has(category)) {
      this.subscribers.set(category, new Map());
    }
    const categoryMap = this.subscribers.get(category)!;
    
    if (!categoryMap.has(type)) {
      categoryMap.set(type, new Set());
    }
    const typeSet = categoryMap.get(type)!;

    typeSet.add(handler as EventHandler<unknown>);

    return () => {
      typeSet.delete(handler as EventHandler<unknown>);
    };
  }

  subscribeAll(handler: EventHandler<unknown>): () => void {
    this.globalSubscribers.add(handler);
    return () => {
      this.globalSubscribers.delete(handler);
    };
  }

  private async safeInvoke(handler: EventHandler<unknown>, event: DomainEvent<unknown>) {
    try {
      await handler(event);
    } catch (error) {
      console.error(`[EventBus] Error in event handler for ${event.category}:${event.type}`, error);
    }
  }
}

export const eventBus = new InMemoryEventBus();
