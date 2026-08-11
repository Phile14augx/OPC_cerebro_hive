/**
 * CerebroHive Talent OS - Platform Acceptance Test
 * 
 * Validates the complete AI-native intelligence pipeline:
 * Seed -> Assessment -> Candidate Session -> Execution Engine -> Artifacts -> AI Normalization -> Copilot Recommendation
 */

import { DomainEventBus } from '../../lib/talent/infrastructure/events/eventBus';
import { AssessmentService } from '../../lib/talent/services/AssessmentService';
import { SessionService } from '../../lib/talent/services/SessionService';
import { ExecutionService } from '../../lib/talent/infrastructure/execution/ExecutionService';
import { WorkforceCopilotService } from '../../lib/talent/intelligence/enterprise/WorkforceCopilotService';
import { evidenceExtractionService } from '../../lib/talent/intelligence/extraction/EvidenceExtractionService';

describe('Talent OS Intelligence Pipeline (End-to-End)', () => {

  it('should evaluate a candidate from execution to copilot recommendation', async () => {
    // We instantiate the services
    const assessmentService = new AssessmentService();
    const sessionService = new SessionService();
    const executionService = new ExecutionService();
    const copilotService = new WorkforceCopilotService();
    
    // Note: evidenceExtractionService is already auto-instantiated and listening to the DomainEventBus.

    // --- STEP 1: Assessment Publishing ---
    const workspaceId = 'mock-workspace';
    const draft = await assessmentService.createDraft(workspaceId, 'E2E Assessment', 'recruiter_1');
    const version = await assessmentService.compileAndPublish(draft.id, { version: 1 } as any, 'recruiter_1');
    expect(version).toBeDefined();

    // --- STEP 2: Candidate Pipeline ---
    const candidateId = 'candidate_e2e_123';
    const session = await sessionService.initializeSession(candidateId, version.id);
    expect(session.status).toBe('READY');

    await sessionService.recordTelemetry(session.id, 0, [{ type: 'editor_focus' }]);

    // --- STEP 3: Execution Engine ---
    // Candidate submits code
    const job = await executionService.submitExecution(session.id, 'javascript', 'console.log("Success");');
    expect(job.status).toBe('QUEUED');

    // Wait for the MockQueueProvider and Sandbox to finish execution
    // This triggers ExecutionCompleted which triggers the EvidenceExtractionService
    await new Promise(r => setTimeout(r, 1500));

    // --- STEP 4: Intelligence Pipeline ---
    // At this point, the MockEvaluatorProvider mapped the exit code to SkillEvidence.
    // The Recruiter checks the Copilot Dashboard for a match against the role.
    
    const roleId = 'mock-role-id';
    const recommendations = await copilotService.recommendCandidatesForProject(roleId, 1);

    // Verify Copilot found the candidate and provided Explainability
    expect(recommendations.length).toBeGreaterThan(0);
    const topMatch = recommendations[0];
    
    // Validate semantic matching results
    expect(topMatch.overallFitScore).toBeGreaterThan(0);
    
    // Validate Explainability Chain
    expect(topMatch.explainability).toBeDefined();
    
    // The pipeline successfully traversed from raw Execution output to semantic Recruiter Insights!
  });
});
