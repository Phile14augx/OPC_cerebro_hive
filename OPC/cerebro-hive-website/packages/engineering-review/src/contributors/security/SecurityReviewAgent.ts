import { ContributorResult, IReviewContributor, ReviewContext } from '../../ports/IReviewContributor';
import { LLMExecutionService, PromptVersion, StructuredResponse } from '../../infrastructure/llm/LLMExecutionService';
import { newEvidenceReferenceId, newFindingId } from '../../ids';
import { createEvidenceReference, createReviewFinding, Confidence, Severity } from '../../valueObjects';

export class SecurityReviewAgent implements IReviewContributor {
  readonly contributorId = 'security-review';
  readonly displayName = 'Security Review';
  readonly version = '0.2.0'; // upgraded for LLM
  readonly category = 'Security';

  constructor(private readonly llmService: LLMExecutionService = new LLMExecutionService()) {}

  async execute(context: ReviewContext): Promise<ContributorResult> {
    const startedAt = new Date();

    const prompt: PromptVersion = {
      template: 'Analyze the given workflow context for security vulnerabilities...',
      version: 'sec-v1.0',
      schema: 'ReviewFindingSchema',
      parameters: {
        workflowId: context.workflowId,
        nodeCount: context.workflowSummary.nodeCount,
      },
      supportedModels: ['gpt-4-turbo', 'claude-3-opus'],
    };

    // Use a mock response to ensure deterministic behavior when no real LLM is connected yet
    const mockResponse: StructuredResponse = {
      findings: [
        {
          severity: 'critical',
          confidence: 'high',
          message: 'A custom IAM role specifies Action: "*" for an S3 bucket, violating least-privilege.',
          category: 'IAM',
          description: 'IAM policy allows wildcard actions'
        }
      ]
    };

    // This will hit the governance engine, parse output, and return metadata
    const llmResult = await this.llmService.executePrompt(prompt, context, undefined, mockResponse);

    const evidenceId = newEvidenceReferenceId();
    const examinedEvidence = createEvidenceReference({
      id: evidenceId,
      description: 'LLM Analysis of IAM roles',
      provenance: {
        sourceSystem: 'workflow-graph',
        sourceElementId: context.workflowVersionId,
        retrievedAt: new Date().toISOString(),
      },
    });

    const findings = llmResult.structuredResponse.findings.map(f => createReviewFinding({
      id: newFindingId(),
      evidenceRefs: [evidenceId],
      severity: f.severity as Severity,
      confidence: f.confidence as Confidence,
      message: f.message,
      category: f.category,
      executionProvenance: llmResult.provenance
    }));

    const completedAt = new Date();

    return {
      contributorId: this.contributorId,
      status: 'succeeded',
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
      metrics: [
        { name: 'tokens_used', value: llmResult.provenance.tokenUsage },
        { name: 'llm_latency_ms', value: llmResult.provenance.executionTimeMs },
      ],
      evidence: [examinedEvidence],
      findings,
    };
  }
}
