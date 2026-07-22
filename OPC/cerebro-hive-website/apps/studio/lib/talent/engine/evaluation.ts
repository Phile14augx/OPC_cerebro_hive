import { CandidateSession, ExecutionResult } from "./execution";
import { EvaluationRubric } from "../types";
import { GlobalEventBus } from "./events";

export interface DeterministicScore {
  totalTests: number;
  passedTests: number;
  scorePercentage: number;
  artifacts: ExecutionResult[];
}

export interface QualitativeScore {
  criteriaScores: Record<string, number>; // Maps RubricCriteria ID to 0-100 score
  summary: string;
  strengths: string[];
  weaknesses: string[];
}

export interface FinalEvaluationReport {
  deterministic: DeterministicScore;
  qualitative: QualitativeScore;
  finalScore: number;
}

/**
 * Stage 1: Deterministic Evaluation Engine
 * Validates rigid pass/fail criteria (e.g. Unit tests, SQL outputs)
 */
export class EvaluationEngine {
  evaluateDeterministic(session: CandidateSession, executionArtifacts: ExecutionResult[]): DeterministicScore {
    // In production, this maps widget states against expected test cases defined in the AssessmentSchema
    console.log("[EvaluationEngine] Running deterministic evaluation...");
    
    // Mock result
    const passed = 9;
    const total = 10;
    
    return {
      totalTests: total,
      passedTests: passed,
      scorePercentage: (passed / total) * 100,
      artifacts: executionArtifacts
    };
  }
}

/**
 * Stage 2: Qualitative AI Review Engine
 * Leverages LLMs to evaluate architecture, security, and communication.
 */
export class AIReviewEngine {
  async performQualitativeReview(
    session: CandidateSession, 
    rubric: EvaluationRubric, 
    deterministicResult: DeterministicScore
  ): Promise<QualitativeScore> {
    
    GlobalEventBus.publish("AI_REVIEW_REQUESTED", session.candidateId, session.assessmentId, { rubricId: rubric.id });
    console.log("[AIReviewEngine] Dispatching artifacts to LLM agents...");

    // Mock LLM Network Call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate multi-agent evaluation based on the Rubric
    const criteriaScores: Record<string, number> = {};
    rubric.criteria.forEach(c => {
      // Mock scoring logic: random score between 75 and 98
      criteriaScores[c.id] = Math.floor(Math.random() * (98 - 75 + 1) + 75);
    });

    return {
      criteriaScores,
      summary: "The candidate demonstrated excellent understanding of core concepts but missed some edge cases in error handling. The architecture is scalable but slightly over-engineered for the current requirements.",
      strengths: ["Clean code structure", "O(1) time complexity achieved"],
      weaknesses: ["Missing edge cases on TTL expiration", "Overuse of global state"]
    };
  }
}

/**
 * The Master Orchestrator for grading a submission
 */
export class GradingPipeline {
  private deterministicEngine = new EvaluationEngine();
  private aiReviewEngine = new AIReviewEngine();

  async gradeSubmission(
    session: CandidateSession, 
    rubric: EvaluationRubric,
    artifacts: ExecutionResult[]
  ): Promise<FinalEvaluationReport> {
    
    // 1. Hard Rules
    const deterministic = this.deterministicEngine.evaluateDeterministic(session, artifacts);
    
    // 2. Soft Rules / Expert Review
    const qualitative = await this.aiReviewEngine.performQualitativeReview(session, rubric, deterministic);

    // 3. Final Aggregation (e.g. 60% weight to deterministic, 40% to qualitative)
    const finalScore = (deterministic.scorePercentage * 0.6) + 
                       (Object.values(qualitative.criteriaScores).reduce((a, b) => a + b, 0) / Object.keys(qualitative.criteriaScores).length * 0.4);

    const report: FinalEvaluationReport = {
      deterministic,
      qualitative,
      finalScore: Math.round(finalScore)
    };

    GlobalEventBus.publish("ASSESSMENT_SUBMITTED", session.candidateId, session.assessmentId, report);
    
    return report;
  }
}
