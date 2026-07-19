import { PrismaClient, AssessmentAttempt } from '@prisma/client';
import { GlobalEventBus } from '../engine/events';

const prisma = new PrismaClient();

export class SessionService {
  
  /**
   * Initializes a new secure session for a Candidate to take an Assessment Version.
   */
  async startAttempt(candidateProfileId: string, assessmentVersionId: string): Promise<AssessmentAttempt> {
    const attempt = await prisma.assessmentAttempt.create({
      data: {
        candidateProfileId,
        assessmentVersionId,
        status: "started",
        statePayload: {}
      }
    });

    GlobalEventBus.publish(
      "ASSESSMENT_STARTED", 
      candidateProfileId, 
      assessmentVersionId, 
      { attemptId: attempt.id }
    );

    return attempt;
  }

  /**
   * Autosaves candidate progress (e.g. current typed code in Monaco).
   * In a real system, this should be debounced heavily and backed by Redis to avoid PG thrashing.
   */
  async saveWidgetState(attemptId: string, widgetId: string, state: any): Promise<void> {
    const attempt = await prisma.assessmentAttempt.findUniqueOrThrow({ where: { id: attemptId } });
    
    if (attempt.status === 'submitted') {
      throw new Error("Cannot modify a submitted assessment attempt.");
    }

    const currentState = (attempt.statePayload as Record<string, any>) || {};
    currentState[widgetId] = state;

    await prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: { statePayload: currentState }
    });
  }

  async markAsEvaluating(attemptId: string): Promise<AssessmentAttempt> {
    return prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: { status: "evaluating" }
    });
  }
}
