
import type { ReviewFinding } from '../value-objects/ReviewFinding';

export class ConfidenceAggregationEngine {
  static compute(findings: ReadonlyArray<ReviewFinding>): number {
    if (!findings.length) return 0;
    const executed = findings.filter(f => f.severity !== 'NOT_EXECUTED');
    if (!executed.length) return 0;
    
    // Configured strategy: Weighted harmonic mean
    const sum = executed.reduce((acc, f) => acc + (1 / Math.max(f.confidence, 0.01)), 0);
    return parseFloat((executed.length / sum).toFixed(3));
  }
}
