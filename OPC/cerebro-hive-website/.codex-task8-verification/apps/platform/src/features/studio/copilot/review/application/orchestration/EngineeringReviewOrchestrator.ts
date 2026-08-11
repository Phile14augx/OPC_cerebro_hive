
import { EngineeringReviewReport } from '../../domain/aggregates/EngineeringReviewReport';
import { ReviewVerdict } from '../../domain/value-objects/ReviewVerdict';
import { ReviewEvaluationStarted } from '../../domain/events/DomainEvents';
import { ConfidenceAggregationEngine } from '../../domain/services/ConfidenceAggregationEngine';
import type { IReviewContributor } from '../../infrastructure/ports/IReviewContributor';
import type { IEngineeringReviewRepository } from '../../infrastructure/ports/IEngineeringReviewRepository';

export class EngineeringReviewOrchestrator {
  constructor(
    private readonly contributors: IReviewContributor[],
    private readonly repository: IEngineeringReviewRepository
  ) {}

  async executeReview(proposedVersionId: string, baseVersionId: string, sessionId: string): Promise<EngineeringReviewReport> {
    // 1. Validate prerequisites (Assume passing for scaffold)
    // 2. Snapshot manifest (Acquire Snapshot ID)
    const snapshotId = `snap-${Date.now()}`;
    const manifest = { manifestId: `man-${Date.now()}`, snapshotId, policyVersion: 'v1', capabilityRegistryVersion: 'v1', contributorManifest: {}, platformVersion: 'v1' };
    
    // 3. Resolve semantic changes
    const changeset = { type: 'SemanticChangeset', changes: [] };

    // Emit started event
    console.log(new ReviewEvaluationStarted(sessionId, proposedVersionId));

    // 4. Execute contributors (Concurrent)
    const results = await Promise.all(this.contributors.map(c => 
      c.execute(snapshotId, changeset).catch(err => ({
        findings: [], evidence: [], executionMetadata: { error: err.message },
        durationMs: 0, confidence: 0, status: 'FAILED'
      } as any))
    ));

    // 5. Aggregate findings & 6. Policy evaluation
    const allFindings = results.flatMap(r => r.findings);
    const allEvidence = results.flatMap(r => r.evidence); // Handled by EvidenceStore in real impl

    // 7. Confidence aggregation
    const confidence = ConfidenceAggregationEngine.compute(allFindings);

    // 8. Recommendation generation
    const recommendations = []; // Derived from findings

    // 9. Publish immutable report
    const provenance = { reviewEngineVersion: '1.0', generatedAt: new Date(), snapshotId, orchestratorVersion: '1.0', contributorManifestHash: 'abc', manifestHash: 'def' };
    
    const report = new EngineeringReviewReport(
      `rep-${Date.now()}`, proposedVersionId, baseVersionId, manifest, provenance, changeset, allFindings, recommendations, [], confidence
    );

    // Terminal verdict governance policy based on Contributor status
    const hasFailures = results.some(r => r.status === 'FAILED' || r.status === 'TIMED_OUT');
    report.completeEvaluation(hasFailures ? ReviewVerdict.FAIL : ReviewVerdict.PASS);
    
    report.publish();
    await this.repository.save(report);

    return report;
  }
}
