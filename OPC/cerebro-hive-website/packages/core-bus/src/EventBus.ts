import { RequestContext } from '@cerebro/database';
import { DomainEvent, IntegrationEvent, IEventHandler } from './Event';

export class DomainEventBus {
  private handlers = new Map<string, IEventHandler<DomainEvent>[]>();

  register(type: string, handler: IEventHandler<DomainEvent>) {
    const handlers = this.handlers.get(type) || [];
    handlers.push(handler);
    this.handlers.set(type, handlers);
  }

  async publish(event: DomainEvent, context: RequestContext): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    await Promise.all(handlers.map(h => h.handle(event, context)));
  }
}

export interface IIntegrationEventPublisher {
  publish(event: IntegrationEvent, context: RequestContext): Promise<void>;
}
