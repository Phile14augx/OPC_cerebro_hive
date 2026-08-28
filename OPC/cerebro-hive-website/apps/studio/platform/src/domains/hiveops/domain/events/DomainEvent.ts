export type DomainEventPayloadValue =
  | string
  | number
  | boolean
  | null
  | DomainEventPayloadValue[]
  | { [key: string]: DomainEventPayloadValue };

export interface DomainEvent {
  eventId: string;
  aggregateId: string;
  aggregateType: string;
  eventName: string;
  version: number;
  payload: Record<string, DomainEventPayloadValue>;
  createdAt: Date;
}
