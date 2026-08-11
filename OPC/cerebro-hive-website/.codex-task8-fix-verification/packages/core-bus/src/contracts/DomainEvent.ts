import { IdentityContext } from '@cerebro/identity-core';

export interface DomainEvent<T = any> {
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
