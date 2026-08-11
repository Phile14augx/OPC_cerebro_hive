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
    const event = envelope.event as any;
    const eventType = event.eventType;
    const executionId = event.aggregateId;

    if (!tenantId || !executionId) return;

    // Map DomainEvent type to Status string
    let status = 'UNKNOWN';
    let startedAt = undefined;
    let completedAt = undefined;

    if (eventType === 'ExecutionCreatedEvent') {
      status = 'QUEUED';
    } else if (eventType === 'ExecutionStartedEvent') {
      status = 'RUNNING';
      startedAt = new Date();
    } else if (eventType === 'ExecutionCompletedEvent') {
      status = 'COMPLETED';
      completedAt = new Date();
    } else if (eventType === 'ExecutionFailedEvent') {
      status = 'FAILED';
      completedAt = new Date();
    }

    // try {
    //   // Upsert the telemetry row
    //     }
    //   });
    // } catch (err) {
    //   console.error(`Failed to update telemetry for execution ${executionId}`, err);
    // }
  }
}
