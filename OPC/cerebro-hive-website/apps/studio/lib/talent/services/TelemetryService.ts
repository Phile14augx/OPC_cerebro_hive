import { PrismaClient } from '@prisma/client';
import { GlobalEventBus, TelemetryEvent } from '../engine/events';

const prisma = new PrismaClient();

export class TelemetryService {
  
  constructor() {
    this.initializeSubscriptions();
  }

  private initializeSubscriptions() {
    const eventsToPersist = [
      "ASSESSMENT_STARTED",
      "WIDGET_EXECUTED",
      "COMPILATION_ERROR",
      "TESTS_RUN",
      "AI_REVIEW_REQUESTED",
      "ASSESSMENT_SUBMITTED"
    ] as const;

    eventsToPersist.forEach(eventType => {
      GlobalEventBus.subscribe(eventType, async (event: TelemetryEvent) => {
        try {
          await this.persistEvent(event);
        } catch (e) {
          console.error(`[TelemetryService] Failed to persist event ${event.id}:`, e);
        }
      });
    });
  }

  private async persistEvent(event: TelemetryEvent) {
    // Requires an active attempt to associate the event
    if (!event.payload || !event.payload.attemptId) {
      // In a real system, some events might not have an attemptId yet, or we fetch it via context.
      // We will skip persisting dangling events for this prototype.
      return;
    }

    await prisma.telemetryEvent.create({
      data: {
        id: event.id,
        attemptId: event.payload.attemptId,
        eventType: event.type,
        widgetId: event.activityId, // Mapping generic activity to widget
        payload: event.payload
      }
    });
  }
}

// Instantiate to start listening globally
export const globalTelemetryService = new TelemetryService();
