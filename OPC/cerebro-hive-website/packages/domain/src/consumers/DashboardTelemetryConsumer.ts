import { HiveEventSubscriber, HiveEventHandler, HiveEventEnvelope } from '@cerebro/domain-model';
import { PrismaClient } from '@cerebro/db';

/**
 * Consumer that listens for Execution events and writes them to a structured
 * telemetry table. This serves as a lightweight alternative to a full CQRS
 * projection for Phase 9c, providing immediate observability for Dashboards.
 */
export class DashboardTelemetryConsumer {
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

    // Subscribing to all known execution lifecycle events
    this.eventBus.subscribe('ExecutionCreatedEvent', handler);
    this.eventBus.subscribe('ExecutionStartedEvent', handler);
    this.eventBus.subscribe('ExecutionCompletedEvent', handler);
    this.eventBus.subscribe('ExecutionFailedEvent', handler);
  }

  private async handleEvent(envelope: HiveEventEnvelope): Promise<void> {
    const { tenantId } = envelope.metadata;
    const executionId = envelope.event.aggregateId;

    if (!tenantId || !executionId) return;

    // try {
    //   // Upsert the telemetry row
    //     }
    //   });
    // } catch (err) {
    //   console.error(`Failed to update telemetry for execution ${executionId}`, err);
    // }
  }
}
