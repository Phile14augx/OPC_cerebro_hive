import { EvidenceGraphEngine } from '../engine/EvidenceGraphEngine';
import { BatchLearningEngine } from '../engine/BatchLearningEngine';
import { ConfidenceVector } from '../domain/ConfidenceVector';

export class OperationalMetricsProvider {
  constructor(
    private readonly evidenceGraph: EvidenceGraphEngine,
    private readonly batchEngine: BatchLearningEngine
  ) {}

  public getRunbookConfidence(runbookId: string): ConfidenceVector {
    // In a real system, we might query a cached materialized view updated by the Batch engine.
    // For now, we compute it on demand.
    return this.batchEngine.recalculateVector(runbookId);
  }

  public getIncidentHistoryForAsset(assetId: string) {
    // Queries the Evidence Graph for past incidents related to an asset
    // Left as an exercise for the reader in this prototype
    return [];
  }
}
