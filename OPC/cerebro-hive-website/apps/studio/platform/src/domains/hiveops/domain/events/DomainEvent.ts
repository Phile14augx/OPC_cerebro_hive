export interface DomainEvent {
  eventId: string;
  aggregateId: string;
  aggregateType: string;
  eventName: string;
  version: number;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
  payload: Record<string, any>;
  createdAt: Date;
}
