export interface DomainEvent<T = any> {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  workspaceId?: string;
  tenantId: string;
  correlationId?: string;
  causationId?: string;
  timestamp: Date;
  version: number;
  actor: {
    id: string;
    type: 'Human' | 'Service' | 'Robot';
  };
  source: string;
  payload: T;
}
