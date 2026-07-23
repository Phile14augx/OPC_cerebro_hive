import { RelayStrategy } from './RelayStrategy';
import { IIntegrationEventPublisher } from '@cerebro/core-bus';
import { RequestContext } from '@cerebro/database';

export class OutboxRelayWorker {
  private running = false;
  private intervalId?: NodeJS.Timeout;

  constructor(
    private readonly strategy: RelayStrategy,
    private readonly publisher: IIntegrationEventPublisher,
    private readonly pollIntervalMs: number = 5000
  ) {}

  start() {
    if (this.running) return;
    this.running = true;
    this.intervalId = setInterval(() => this.processOutbox(), this.pollIntervalMs);
  }

  stop() {
    this.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private async processOutbox() {
    if (!this.running) return;

    try {
      const events = await this.strategy.readEvents(50);
      for (const event of events) {
        try {
          const context: RequestContext = { tenantId: event.tenantId || 'SYSTEM' };
          if (event.tenantId) context.tenantId = event.tenantId;
          if (event.traceId) context.traceId = event.traceId;
          if (event.correlationId) context.correlationId = event.correlationId;

          await this.publisher.publish({
            type: event.eventType,
            ...event.payload as any,
          }, context);

          await this.strategy.ack(event.id);
        } catch (err: any) {
          await this.strategy.nack(event.id, err.message);
        }
      }
    } catch (error) {
      console.error('Error processing outbox events:', error);
    }
  }
}
