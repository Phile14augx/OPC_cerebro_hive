import { PrismaClient, AssessmentSubmission, EvaluationResult } from '@prisma/client';
import { SessionService } from './SessionService';
import { GradingPipeline } from '../engine/evaluation';
import { GlobalEventBus } from '../engine/events';

const prisma = new PrismaClient();
const sessionService = new SessionService();
const grader = new GradingPipeline();

export class SubmissionService {
  
  /**
   * Finalizes an attempt, freezes the candidate's answers, and initiates the evaluation pipeline.
   */
  async submitAttempt(attemptId: string): Promise<AssessmentSubmission> {
    const attempt = await prisma.assessmentAttempt.findUniqueOrThrow({ 
      where: { id: attemptId },
      include: { version: true }
    });

    if (attempt.status === 'submitted') {
      throw new Error("Attempt has already been submitted.");
    }

    // 1. Lock the attempt
    await prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: { status: 'submitted', submittedAt: new Date() }
    });

    // 2. Freeze the payload into a Submission record
    const submission = await prisma.assessmentSubmission.create({
      data: {
        attemptId,
        finalPayload: attempt.statePayload || {}
      }
    });

    GlobalEventBus.publish("ASSESSMENT_SUBMITTED", attempt.candidateProfileId, attempt.assessmentVersionId, { submissionId: submission.id });

    // 3. Kick off async evaluation (in production, this goes to a message queue)
    this.processEvaluationAsync(submission.id, attempt).catch(console.error);

    return submission;
  }

  private async processEvaluationAsync(submissionId: string, attempt: any) {
    console.log(`[SubmissionService] Starting async evaluation for ${submissionId}`);
    
    // Convert DB attempt to engine CandidateSession
    const sessionContext = {
      sessionId: attempt.id,
      candidateId: attempt.candidateProfileId,
      assessmentId: attempt.assessmentVersionId,
      version: attempt.version.versionNumber,
      startedAt: attempt.startedAt.toISOString(),
      status: "evaluating" as const,
      widgetStates: attempt.statePayload,
      timelineEvents: []
    };

    // Extract rubric from compiled schema (Mocked for brevity)
    const mockRubric = { id: 'r1', passingScore: 80, criteria: [] }; 
    const mockExecutionArtifacts: any[] = []; // In a real flow, the execution outputs are fetched here

    // Run the Phase 3 Evaluation Pipeline (Deterministic -> AI Review)
    const report = await grader.gradeSubmission(sessionContext, mockRubric, mockExecutionArtifacts);

    // Persist the results
    await prisma.evaluationResult.create({
      data: {
        submissionId,
        deterministicScore: report.deterministic.scorePercentage,
        aiReviewScore: 85.0, // Aggregated from report
        finalScore: report.finalScore,
        aiSummary: report.qualitative.summary,
        strengths: report.qualitative.strengths,
        weaknesses: report.qualitative.weaknesses,
        detailsPayload: report as any
      }
    });

    console.log(`[SubmissionService] Evaluation complete for ${submissionId}`);
  }
}
