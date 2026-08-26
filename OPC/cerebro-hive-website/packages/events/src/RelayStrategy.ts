export interface RelayEvent {
  id: string;
  tenantId?: string | null;
  traceId?: string | null;
  correlationId?: string | null;
  eventType: string;
  payload: unknown;
}

export interface RelayStrategy {
  readEvents(limit: number): Promise<RelayEvent[]>;
  ack(eventId: string): Promise<void>;
  nack(eventId: string, error: string): Promise<void>;
}
