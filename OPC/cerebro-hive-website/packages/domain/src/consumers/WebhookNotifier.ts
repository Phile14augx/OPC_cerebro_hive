import { HiveEventSubscriber, HiveEventHandler, HiveEventEnvelope } from '@cerebro/domain-model';
import { PrismaClient } from '@prisma/client';

/**
 * Consumer that listens for Execution events and dispatches them as webhooks
 * to URLs configured in WebhookSubscription.
 */
export class WebhookNotifier {
  constructor(
    private readonly eventBus: HiveEventSubscriber,
    private readonly prisma: PrismaClient
  ) {
    this.register();
  }

  private register(): void {
    const handler: HiveEventHandler = async (envelope: HiveEventEnvelope) => {
      await this.handleEvent(envelope);
    };

    // Subscribing to known execution events. 
    // In a real system, we might subscribe to a base event type or register multiple explicitly.
    this.eventBus.subscribe('ExecutionCreatedEvent', handler);
    this.eventBus.subscribe('ExecutionStartedEvent', handler);
    this.eventBus.subscribe('ExecutionCompletedEvent', handler);
    this.eventBus.subscribe('ExecutionFailedEvent', handler);
  }

  private async handleEvent(envelope: HiveEventEnvelope): Promise<void> {
    const tenantId = envelope.metadata.tenantId;
    if (!tenantId) return; // Webhooks are tenant-scoped

    // Fetch active subscriptions for this tenant
    const subscriptions = await this.prisma.webhookSubscription.findMany({
      where: {
        tenantId,
        enabled: true,
        // The events array should contain the specific event type, or '*' for all
        events: {
          hasSome: [envelope.metadata.eventType, '*']
        }
      }
    });

    if (subscriptions.length === 0) return;

    // Dispatch webhook to all matching subscriptions
    const payload = JSON.stringify({
      id: envelope.metadata.eventId,
      type: envelope.metadata.eventType,
      timestamp: envelope.metadata.timestamp,
      data: envelope.event
    });

    for (const sub of subscriptions) {
      try {
        // We use fetch to dispatch the HTTP POST request.
        await fetch(sub.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-secret': sub.secret, // typically we would HMAC the payload instead of sending raw secret
            'x-cerebro-event': envelope.metadata.eventType
          },
          body: payload
        });
      } catch (err) {
        console.error(`Failed to dispatch webhook to ${sub.url}`, err);
        // Delivery failures are swallowed here; a robust implementation would queue these for retry
      }
    }
  }
}
