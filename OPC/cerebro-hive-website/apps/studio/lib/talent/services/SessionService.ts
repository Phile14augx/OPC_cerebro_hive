import { prisma, AssessmentSession } from '@cerebro/db';
import { DomainEventBus } from '../infrastructure/events/eventBus';
import { withTransaction } from '../infrastructure/database/transaction';


export class SessionService {
  
  /**
   * Initializes a new assessment session for a candidate.
   */
  async initializeSession(candidateId: string, assessmentVersionId: string, traceId?: string): Promise<AssessmentSession> {
    return withTransaction(async (tx) => {
      // Create session
      const session = await tx.assessmentSession.create({
        data: {
          candidateId,
          assessmentVersionId,
          status: 'READY'
        }
      });

      DomainEventBus.publish('SessionStarted', { sessionId: session.id, candidateId }, traceId);
      
      return session;
    });
  }

  /**
   * Resumes an existing session (e.g., after a browser crash).
   */
  async resumeSession(sessionId: string, candidateId: string, traceId?: string): Promise<AssessmentSession> {
    const session = await prisma.assessmentSession.findUniqueOrThrow({
      where: { id: sessionId }
    });

    if (session.candidateId !== candidateId) {
      throw new Error('Unauthorized candidate');
    }

    if (session.status === 'SUBMITTED' || session.status === 'TERMINATED') {
      throw new Error('Session cannot be resumed');
    }

    const updatedSession = await prisma.assessmentSession.update({
      where: { id: sessionId },
      data: { status: 'RESUMED' }
    });

    DomainEventBus.publish('SessionResumed', { sessionId }, traceId);

    return updatedSession;
  }

  /**
   * Appends a batch of raw telemetry events (e.g., keystrokes, focus changes).
   */
  async recordTelemetry(sessionId: string, sequence: number, events: unknown[], traceId?: string) {
    const batch = await prisma.sessionTelemetryBatch.create({
      data: {
        sessionId,
        sequence,
        events: events as unknown as import('@cerebro/db').Prisma.InputJsonValue
      }
    });

    // Update session status to ACTIVE if it wasn't already
    await prisma.assessmentSession.updateMany({
      where: { id: sessionId, status: { in: ['READY', 'RESUMED', 'PAUSED'] } },
      data: { status: 'ACTIVE' }
    });

    DomainEventBus.publish('TelemetryBatchReceived', { sessionId, sequence, count: events.length }, traceId);
    
    return batch;
  }

  /**
   * Updates the aggregated metrics for the session (computed asynchronously).
   */
  async updateMetrics(sessionId: string, metrics: unknown) {
    return prisma.assessmentSession.update({
      where: { id: sessionId },
      data: { metrics: metrics as unknown as import('@cerebro/db').Prisma.NullableJsonNullValueInput | import('@cerebro/db').Prisma.InputJsonValue }
    });
  }

  /**
   * Submits the assessment for final evaluation.
   */
  async submitSession(sessionId: string, traceId?: string): Promise<AssessmentSession> {
    return withTransaction(async (tx) => {
      const session = await tx.assessmentSession.update({
        where: { id: sessionId },
        data: { 
          status: 'SUBMITTED',
          endedAt: new Date()
        }
      });

      DomainEventBus.publish('AssessmentSubmitted', { sessionId }, traceId);

      return session;
    });
  }
}
