
import { EvidenceGraph } from '../evidence/EvidenceGraph';
import type { ReviewGateResult } from '../orchestrator/EngineeringReviewOrchestrator';
import type { SemanticChangeset } from '../analyzer/WorkflowChangeAnalyzer';

export interface ReviewRecommendation {
  priority: 'High' | 'Medium' | 'Low';
  action: string;
  rationale: string;
  evidenceRef: string;
}

export class ReviewRecommendationEngine {
  static async recommend(gates: ReviewGateResult[], changeset: SemanticChangeset, evidence: EvidenceGraph): Promise<ReviewRecommendation[]> {
    void changeset;
    void evidence;
    const recs: ReviewRecommendation[] = [];

    for (const gate of gates) {
      if (gate.severity === 'FAILED' && gate.policyId === 'POL-214') {
        recs.push({ priority: 'High', action: 'Request Security Team approval for GPU compute policy POL-214', rationale: `Matched rule: ${gate.matchedRule}`, evidenceRef: gate.policyId! });
      }
      if (gate.severity === 'WARNING' && gate.gate === 'OperationalRisk') {
        recs.push({ priority: 'Medium', action: 'Run a simulation against last 30 days of traffic before promoting to production', rationale: gate.detail, evidenceRef: 'ExecutionIntelligenceStore' });
        recs.push({ priority: 'Low', action: 'Increase cache TTL on vector.search node to offset predicted cache hit rate decline', rationale: 'Historical: -23% cache hit rate after similar changes', evidenceRef: 'ExecutionIntelligenceStore' });
      }
    }

    return recs;
  }
}
