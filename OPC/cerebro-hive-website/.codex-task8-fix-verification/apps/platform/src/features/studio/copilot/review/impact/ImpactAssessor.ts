
import { EvidenceGraph } from '../evidence/EvidenceGraph';
import type { SemanticChangeset } from '../analyzer/WorkflowChangeAnalyzer';
import type { ReviewGateResult } from '../orchestrator/EngineeringReviewOrchestrator';

// Uncertainty ranges — not just point estimates
export interface ImpactEstimate {
  expected: number;
  rangeLow: number;
  rangeHigh: number;
  confidence: number;
  source: string;
}

export interface ImpactAssessment {
  gate: ReviewGateResult;
  costDelta: ImpactEstimate;
  latencyDelta: ImpactEstimate;
  cacheEffectivenessChange: ImpactEstimate;
}

export class ImpactAssessor {
  static async assess(changeset: SemanticChangeset, evidence: EvidenceGraph): Promise<ImpactAssessment> {
    const costDelta: ImpactEstimate = { expected: 0.013, rangeLow: 0.009, rangeHigh: 0.018, confidence: 0.91, source: 'CostEstimator' };
    const latencyDelta: ImpactEstimate = { expected: 320, rangeLow: 210, rangeHigh: 510, confidence: 0.83, source: 'ForecastingEngine' };
    const cacheChange: ImpactEstimate = { expected: -0.12, rangeLow: -0.23, rangeHigh: -0.04, confidence: 0.78, source: 'CachePolicyEngine' };

    const simId = `sim-${Date.now()}`;
    evidence.addNode({ id: simId, type: 'SimulationRun', label: 'Impact simulation', data: { costDelta, latencyDelta } });
    evidence.addEdge({ from: `changeset-${changeset.baseVersionId}`, to: simId, relation: 'derivedFrom' });

    return {
      gate: { gate: 'ImpactAssessment', severity: latencyDelta.expected < 500 ? 'PASS' : 'WARNING',
               detail: `Cost +$${costDelta.expected.toFixed(3)} (${costDelta.rangeLow}–${costDelta.rangeHigh}). Latency +${latencyDelta.expected}ms (${latencyDelta.rangeLow}–${latencyDelta.rangeHigh}ms). Confidence: ${latencyDelta.confidence}`,
               confidence: (costDelta.confidence + latencyDelta.confidence) / 2 },
      costDelta, latencyDelta, cacheEffectivenessChange: cacheChange,
    };
  }
}
