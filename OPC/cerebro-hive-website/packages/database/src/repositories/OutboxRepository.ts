import { OutboxEvent } from '@prisma/client';
import { BaseRepository, IRepositoryOptions } from './BaseRepository';

// So we define it without depending on domain package.
export interface SaveOutboxEventInput {
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: any;
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
