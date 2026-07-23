import { RequestContext } from '@cerebro/database';
import { IntegrationEvent, IIntegrationEventPublisher } from '@cerebro/core-bus';
import { connect, NatsConnection, StringCodec, JetStreamClient } from 'nats';
import { EventEnvelope } from './EventEnvelope';

export class NatsIntegrationEventPublisher implements IIntegrationEventPublisher {
  private nc?: NatsConnection;
  private js?: JetStreamClient;
  private sc = StringCodec();

  constructor(private readonly natsUrl: string = 'nats://localhost:4222') {}

  async connect() {
    if (!this.nc) {
      this.nc = await connect({ servers: this.natsUrl });
      this.js = this.nc.jetstream();
    }
  }

  async close() {
    if (this.nc) {
      await this.nc.close();
      this.nc = undefined;
      this.js = undefined;
    }
  }

  async publish(event: IntegrationEvent, context: RequestContext): Promise<void> {
    if (!this.js) {
      await this.connect();
    }

    const envelope: EventEnvelope = {
      eventId: crypto.randomUUID(),
      eventType: event.type,
      eventVersion: '1.0',
      aggregateId: (event as any).aggregateId || 'unknown',
      correlationId: context.correlationId,
      traceId: context.traceId,
      tenantId: context.tenantId,
      occurredAt: new Date().toISOString(),
      payload: event,
      metadata: {},
    };

    const subject = `events.${event.type}`;
    const data = this.sc.encode(JSON.stringify(envelope));

    await this.js!.publish(subject, data);
  }
}
