import { newEvidenceReferenceId, newFindingId } from '../ids';
import { createEvidenceReference, createReviewFinding, Confidence, Severity } from '../valueObjects';
import { ContributorResult, IReviewContributor, ReviewContext } from '../ports/IReviewContributor';
import { LLMExecutionService } from './llm/LLMExecutionService';
import { PromptVersion, StructuredResponse } from './llm/types';

export class ArchitectureReviewContributor implements IReviewContributor {
  readonly contributorId = 'architecture-review';
  readonly displayName = 'Architecture Review';
  readonly version = '0.2.0';
  readonly category = 'Architecture';

  constructor(
    private readonly complexityThreshold = 25,
    private readonly llmService: LLMExecutionService = new LLMExecutionService()
  ) {}

  async execute(context: ReviewContext): Promise<ContributorResult> {
    const startedAt = new Date();
    
    const prompt: PromptVersion = {
      template: 'Evaluate the workflow architecture complexity based on node count...',
      version: 'arch-v1.0',
      schema: 'ReviewFindingSchema',
      parameters: {
        workflowId: context.workflowId,
        nodeCount: context.workflowSummary.nodeCount,
      },
      supportedModels: ['gpt-4-turbo'],
    };

    const isComplex = context.workflowSummary.nodeCount > this.complexityThreshold;

    const mockResponse: StructuredResponse = {
      findings: isComplex ? [
        {
          severity: 'medium',
          confidence: 'medium',
          message: `Workflow has ${context.workflowSummary.nodeCount} nodes, above the ${this.complexityThreshold}-node complexity threshold. Consider decomposing into sub-workflows.`,
          category: 'complexity',
          description: 'Complexity evaluation'
        }
      ] : []
    };

    const llmResult = await this.llmService.executePrompt(prompt, context, undefined, mockResponse);

    const examinedEvidence = createEvidenceReference({
      id: newEvidenceReferenceId(),
      description: `Examined workflow graph: ${context.workflowSummary.nodeCount} nodes, ${context.workflowSummary.edgeCount} edges.`,
      provenance: {
        sourceSystem: 'workflow-graph',
        sourceElementId: context.workflowVersionId,
        retrievedAt: new Date().toISOString(),
      },
    });

    const findings = llmResult.structuredResponse.findings.map(f => createReviewFinding({
      id: newFindingId(),
      evidenceRefs: [examinedEvidence.id],
      severity: f.severity as Severity,
      confidence: f.confidence as Confidence,
      message: f.message,
      category: f.category,
      executionProvenance: llmResult.provenance
    }));

    const completedAt = new Date();
    const durationMs = completedAt.getTime() - startedAt.getTime();

    return {
      contributorId: this.contributorId,
      status: 'succeeded',
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs,
      metrics: [
        { name: 'nodes_analyzed', value: context.workflowSummary.nodeCount },
        { name: 'tokens_used', value: llmResult.provenance.tokenUsage },
        { name: 'llm_latency_ms', value: llmResult.provenance.executionTimeMs },
      ],
      evidence: [examinedEvidence],
      findings,
    };
  }
}
