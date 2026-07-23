import { RequestContext } from '@cerebro/database';

export abstract class DomainEvent {
  constructor(public readonly type: string) {}
}

export abstract class IntegrationEvent {
  constructor(public readonly type: string) {}
}

export interface IEventHandler<TEvent extends DomainEvent | IntegrationEvent> {
  handle(event: TEvent, context: RequestContext): Promise<void>;
}
