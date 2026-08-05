import { OutboxEvent } from '@prisma/client';
import { BaseRepository, IRepositoryOptions } from './BaseRepository';

// So we define it without depending on domain package.
export interface SaveOutboxEventInput {
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: any;
  headers?: any;
  traceId?: string;
  correlationId?: string;
  tenantId?: string;
  partitionKey?: string;
  schemaVersion?: string;
}

export class OutboxRepository extends BaseRepository {
  async save(input: SaveOutboxEventInput, options: IRepositoryOptions): Promise<OutboxEvent> {
    const db = this.getClient(options);

    return db.outboxEvent.create({
      data: {
        eventType: input.eventType,
        aggregateType: input.aggregateType,
        aggregateId: input.aggregateId,
        payload: input.payload ? JSON.parse(JSON.stringify(input.payload)) : undefined,
        headers: input.headers ? JSON.parse(JSON.stringify(input.headers)) : {},
        traceId: input.traceId,
        correlationId: input.correlationId,
        tenantId: input.tenantId,
        partitionKey: input.partitionKey,
        schemaVersion: input.schemaVersion || "1.0",
      }
    });
  }

  async getPendingEvents(limit = 50, options: IRepositoryOptions): Promise<OutboxEvent[]> {
    const db = this.getClient(options);
    return db.outboxEvent.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  async markPublished(eventId: string, options: IRepositoryOptions): Promise<void> {
    const db = this.getClient(options);
    await db.outboxEvent.update({
      where: { id: eventId },
      data: { status: 'published', publishedAt: new Date() }
    });
  }

  async markFailed(eventId: string, error: string, options: IRepositoryOptions): Promise<void> {
    const db = this.getClient(options);
    await db.outboxEvent.update({
      where: { id: eventId },
      data: { status: 'failed', error }
    });
  }
}
