export interface DomainEvent {
  eventId: string;
  aggregateId: string;
  aggregateType: string;
  eventName: string;
  version: number;
  payload: Record<string, any>;
  createdAt: Date;
}
