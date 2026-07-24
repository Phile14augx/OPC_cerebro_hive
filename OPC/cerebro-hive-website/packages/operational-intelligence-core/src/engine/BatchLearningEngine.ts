import { EvidenceGraphEngine } from './EvidenceGraphEngine';
import { ConfidenceVector } from '../domain/ConfidenceVector';
import { ExecutionStatus } from '../domain/ExecutionRecord';

export class BatchLearningEngine {
  constructor(private readonly evidenceGraph: EvidenceGraphEngine) {}

  // Recalculates the full vector by mining historical evidence
  public recalculateVector(runbookId: string): ConfidenceVector {
    const history = this.evidenceGraph.getHistoryForRunbook(runbookId);
    
    if (history.length === 0) {
      return { reliability: 0.5, speed: 0.5, safety: 0.5, cost: 0.5, operatorTrust: 0.5, compositeScore: 0.5 };
    }

    let successCount = 0;
    let manualOverrideCount = 0;
    let rollbackCount = 0;
    let totalDuration = 0;

    for (const record of history) {
      if (record.status === ExecutionStatus.SUCCESS) successCount++;
      if (record.status === ExecutionStatus.MANUAL_OVERRIDE) manualOverrideCount++;
      if (record.status === ExecutionStatus.ROLLED_BACK) rollbackCount++;
      totalDuration += record.durationMs;
    }

    const reliability = successCount / history.length;
    const operatorTrust = 1.0 - (manualOverrideCount / history.length);
    const safety = 1.0 - (rollbackCount / history.length);
    
    const avgDuration = totalDuration / history.length;
    const speed = avgDuration <= 5000 ? 1.0 : (5000 / avgDuration);

    const cost = 0.8; // Stubbed

    const compositeScore = (reliability * 0.4) + (safety * 0.3) + (operatorTrust * 0.2) + (speed * 0.1);

    return {
      reliability,
      speed,
      safety,
      cost,
      operatorTrust,
      compositeScore
    };
  }
}
