import { OutboxRepository, RequestContext } from '@cerebro/db';
import { HiveEventBus } from '@cerebro/domain-model';
import { HiveEventEnvelope } from '@cerebro/domain-model';
import { DomainEvent } from './DomainEvent';

/**
 * Generic delivery worker that polls the Outbox table, deserializes events,
 * and dispatches them to the canonical HiveEventBus.
 * 
 * Responsibilities:
 * - Read unpublished records
 * - Deserialize
 * - Dispatch to Event Bus
 * - Retry failures
 * - Mark delivered
 */
export class OutboxRelay {
  private isPolling = false;
  private intervalId?: NodeJS.Timeout;

  constructor(
    private readonly outboxRepository: OutboxRepository,
    private readonly eventBus: HiveEventBus,
    private readonly pollIntervalMs: number = 5000,
    private readonly batchSize: number = 50
  ) {}

  start(): void {
    if (this.isPolling) return;
    this.isPolling = true;
    this.intervalId = setInterval(() => this.processOutbox(), this.pollIntervalMs);
  }

  stop(): void {
    this.isPolling = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  async processOutbox(): Promise<void> {
    if (!this.isPolling) return;

    try {
      // 1. Fetch unpublished outbox events
      const events = await this.outboxRepository.findUnpublished(this.batchSize);
      if (events.length === 0) return;

      for (const record of events) {
        try {
          // 2. Deserialize payload to DomainEvent
          // Note: Real implementations would map the JSON payload to the specific DomainEvent class.
          // For now, we trust the JSON payload format.
          const domainEvent = record.payload as any;
          
          const envelope: HiveEventEnvelope = {
            event: domainEvent,
            metadata: {
              eventId: record.id,
              eventType: record.eventType,
              timestamp: record.createdAt,
              correlationId: record.correlationId || undefined,
              traceId: record.traceId || undefined,
              tenantId: record.tenantId || undefined,
            }
          };

          // 3. Dispatch to HiveEventBus
          await this.eventBus.publish(envelope);

          // 4. Mark as delivered
          await this.outboxRepository.markPublished(record.id);

        } catch (error: any) {
          // 5. Retry / Failure handling
          await this.outboxRepository.markFailed(record.id, error.message);
        }
      }
    } catch (err) {
      console.error('OutboxRelay failed to process outbox batch', err);
    }
  }
}
