
import { EngineeringReviewSession } from '../session/EngineeringReviewSession';
import { WorkflowChangeAnalyzer } from '../analyzer/WorkflowChangeAnalyzer';
import { ImpactAssessor } from '../impact/ImpactAssessor';
import { GovernanceReviewer } from '../governance/GovernanceReviewer';
import { OperationalRiskPredictor } from '../risk/OperationalRiskPredictor';
import { ConfidenceAggregationEngine } from '../confidence/ConfidenceAggregationEngine';
import { ReviewRecommendationEngine } from '../recommendations/ReviewRecommendationEngine';
import { ReviewFreshnessEvaluator } from '../freshness/ReviewFreshnessEvaluator';
import { EvidenceGraph } from '../evidence/EvidenceGraph';
import type { EngineeringReviewContributor } from '../contributors/EngineeringReviewContributor';

export type ReviewSeverity = 'PASS' | 'WARNING' | 'FAILED' | 'NOT_EXECUTED' | 'INCONCLUSIVE';

export interface ReviewGateResult {
  gate: string;
  severity: ReviewSeverity;
  detail: string;
  policyId?: string;    // e.g. 'POL-214'
  matchedRule?: string; // e.g. 'gpu.compute.production'
  confidence: number;
}

export interface EngineeringReviewReport {
  reportId: string;
  sessionId: string;
  reviewNumber: number; // within the session
  workflowVersionId: string;
  baseVersionId: string;
  generatedAt: Date;
  platformStateSnapshot: {
    policyEngineVersion: string;
    capabilityRegistryVersion: string;
    intelligenceModelVersion: string;
    executionDatasetVersion: string;
    forecastModelVersion: string;
  };
  changeset: object; // SemanticChangeset
  gates: ReviewGateResult[];
  overallConfidence: number;
  overallVerdict: ReviewSeverity;
  requiredApprovals: string[];
  recommendations: object[]; // ReviewRecommendation[]
  evidenceGraph: object;     // EvidenceGraph
}

export class EngineeringReviewOrchestrator {
  private contributors: EngineeringReviewContributor[] = [];

  registerContributor(c: EngineeringReviewContributor) { this.contributors.push(c); }

  async review(session: EngineeringReviewSession, baseVersionId: string, proposedVersionId: string): Promise<EngineeringReviewReport> {
    const evidence = new EvidenceGraph();
    const gates: ReviewGateResult[] = [];

    // 1. Semantic change analysis
    const changeset = await WorkflowChangeAnalyzer.analyze(baseVersionId, proposedVersionId, evidence);
    
    // 2. Impact assessment with uncertainty ranges
    const impact = await ImpactAssessor.assess(changeset, evidence);
    gates.push(impact.gate);

    // 3. Governance review — delegates to PolicyEngine (single source of truth)
    const governance = await GovernanceReviewer.review(changeset, proposedVersionId, evidence);
    gates.push(...governance.gates);

    // 4. Operational risk prediction (layered L1→L3 similarity)
    const risk = await OperationalRiskPredictor.predict(changeset, evidence);
    gates.push(risk.gate);

    // 5. Plugin contributors (Security Review, Finance, Healthcare, etc.)
    for (const contributor of this.contributors) {
      const findings = await contributor.contribute(changeset, evidence);
      gates.push(...findings.map(f => ({ ...f, gate: contributor.name })));
    }

    // 6. Confidence aggregation across all subsystems
    const overallConfidence = ConfidenceAggregationEngine.aggregate(gates);

    // 7. Evidence-backed recommendations
    const recommendations = await ReviewRecommendationEngine.recommend(gates, changeset, evidence);

    // 8. Platform state snapshot for freshness evaluation
    const snapshot = await ReviewFreshnessEvaluator.captureSnapshot();

    // Derive overall verdict from gate severities (policy-driven, not hardcoded)
    const overallVerdict = this.deriveVerdict(gates);
    const requiredApprovals = governance.requiredApprovals;

    const report: EngineeringReviewReport = {
      reportId: `rev-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      sessionId: session.sessionId,
      reviewNumber: session.reportCount + 1,
      workflowVersionId: proposedVersionId,
      baseVersionId,
      generatedAt: new Date(),
      platformStateSnapshot: snapshot,
      changeset,
      gates,
      overallConfidence,
      overallVerdict,
      requiredApprovals,
      recommendations,
      evidenceGraph: evidence.export(),
    };

    session.addReport(report);
    return report;
  }

  private deriveVerdict(gates: ReviewGateResult[]): ReviewSeverity {
    if (gates.some(g => g.severity === 'FAILED'))    return 'FAILED';
    if (gates.some(g => g.severity === 'INCONCLUSIVE')) return 'INCONCLUSIVE';
    if (gates.some(g => g.severity === 'WARNING'))   return 'WARNING';
    if (gates.every(g => g.severity === 'PASS' || g.severity === 'NOT_EXECUTED')) return 'PASS';
    return 'INCONCLUSIVE';
  }
}
