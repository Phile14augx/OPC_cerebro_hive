import { EventBus, EventHandler } from '../contracts/EventBus';
import { DomainEvent } from '../contracts/DomainEvent';

export class MemoryEventBus implements EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private responders: Map<string, (payload: any) => Promise<any>> = new Map();
  private middlewares: Array<(event: DomainEvent, next: () => Promise<void>) => Promise<void>> = [];

  async publish<T>(event: DomainEvent<T>): Promise<void> {
    const runHandlers = async () => {
      const typeHandlers = this.handlers.get(event.eventType);
      if (typeHandlers) {
        const promises = Array.from(typeHandlers).map(h => h(event));
        await Promise.allSettled(promises);
      }
    };

    let index = 0;
    const next = async (): Promise<void> => {
      if (index < this.middlewares.length) {
        const mw = this.middlewares[index++];
        await mw(event, next);
      } else {
        await runHandlers();
      }
    };

    await next();
  }

  subscribe<T>(eventType: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler as EventHandler);
  }

  unsubscribe<T>(eventType: string, handler: EventHandler<T>): void {
    const typeHandlers = this.handlers.get(eventType);
    if (typeHandlers) {
      typeHandlers.delete(handler as EventHandler);
    }
  }

  once<T>(eventType: string, handler: EventHandler<T>): void {
    const onceHandler: EventHandler<T> = async (event) => {
      this.unsubscribe(eventType, onceHandler);
      await handler(event);
    };
    this.subscribe(eventType, onceHandler);
  }

  async request<Req, Res>(eventType: string, payload: Req): Promise<Res> {
    const responder = this.responders.get(eventType);
    if (!responder) {
      throw new Error(`No responder registered for event request: ${eventType}`);
    }
    return await responder(payload);
  }

  respond<Req, Res>(eventType: string, handler: (payload: Req) => Promise<Res>): void {
    if (this.responders.has(eventType)) {
      throw new Error(`Responder already registered for: ${eventType}`);
    }
    this.responders.set(eventType, handler);
  }

  middleware(fn: (event: DomainEvent, next: () => Promise<void>) => Promise<void>): void {
    this.middlewares.push(fn);
  }

  interceptors(): void {
    // Placeholder for request/response interceptors
  }
}
