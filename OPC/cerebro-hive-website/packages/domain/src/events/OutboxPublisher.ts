import { OutboxRepository, RequestContext } from '@cerebro/database';
import { DomainEvent } from './DomainEvent';
import { ITransactionContext } from '../transactions/UnitOfWork';

export class OutboxPublisher {
  constructor(private outboxRepository: OutboxRepository) {}

  async publish(event: DomainEvent, context: RequestContext, tx: ITransactionContext): Promise<void> {
    await this.outboxRepository.save({
      eventType: event.constructor.name,
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      payload: event, // saving the entire event as payload
      headers: {},
      traceId: context.traceId,
      correlationId: context.correlationId,
      tenantId: context.tenantId,
      partitionKey: event.aggregateId, // Default partition by aggregate ID
      schemaVersion: '1.0',
    }, { context, tx: tx as any });
  }
}
