
import type { ReviewGateResult } from '../orchestrator/EngineeringReviewOrchestrator';

export class ConfidenceAggregationEngine {
  static aggregate(gates: ReviewGateResult[]): number {
    if (gates.length === 0) return 0;
    const executedGates = gates.filter(g => g.severity !== 'NOT_EXECUTED');
    if (executedGates.length === 0) return 0;
    // Weighted harmonic mean — penalizes low-confidence outliers more than arithmetic mean
    const sum = executedGates.reduce((acc, g) => acc + (1 / Math.max(g.confidence, 0.01)), 0);
    return parseFloat((executedGates.length / sum).toFixed(3));
  }
}
