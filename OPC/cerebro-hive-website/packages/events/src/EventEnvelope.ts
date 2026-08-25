export interface EventEnvelope<T = unknown> {
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
  metadata?: Record<string, unknown>;
}
