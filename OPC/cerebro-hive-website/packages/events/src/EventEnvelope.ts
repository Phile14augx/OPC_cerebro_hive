export interface EventEnvelope<T = any> {
  eventId: string;
  eventType: string;
  eventVersion: string;
  aggregateId: string;
  aggregateVersion?: number;
  correlationId?: string;
  causationId?: string;
  traceId?: string;
  tenantId?: string;
  occurredAt: string; // ISO 8601 string
  payload: T;
  metadata?: Record<string, any>;
}
