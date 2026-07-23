import { RelayStrategy } from './RelayStrategy';
import { OutboxRepository, RequestContext } from '@cerebro/database';

export class PollingRelayStrategy implements RelayStrategy {
  constructor(private readonly outboxRepo: OutboxRepository) {}

  async readEvents(limit: number): Promise<any[]> {
    return this.outboxRepo.getPendingEvents(limit, { context: { tenantId: 'SYSTEM' } });
  }

  async ack(eventId: string): Promise<void> {
    await this.outboxRepo.markPublished(eventId, { context: { tenantId: 'SYSTEM' } });
  }

  async nack(eventId: string, error: string): Promise<void> {
    await this.outboxRepo.markFailed(eventId, error, { context: { tenantId: 'SYSTEM' } });
  }
}
