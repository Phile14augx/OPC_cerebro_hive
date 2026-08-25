import { IdentityContext } from '@cerebro/identity-core';

export interface DomainEvent<T = unknown> {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  timestamp: Date;
  version: number;
  source: string;
  identity: IdentityContext;
  payload: T;
}
