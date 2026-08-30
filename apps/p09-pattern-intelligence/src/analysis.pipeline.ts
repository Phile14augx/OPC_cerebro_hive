import { AlertingSystem } from './alerting.system';
import { PatternRepository } from './pattern.repository';
import { DataPoint, TenantContext } from './types';

export class AnalysisPipeline {
  /**
   * Tracks open anomaly windows keyed by "tenantId:sourceId".
   * An open window means an anomaly has already been recorded for that
   * source in the current anomaly episode; further threshold crossings
   * are suppressed until the stream returns to normal (no anomalous
   * points in a batch), which closes the window.
   */
  private activeAnomalyWindows: Set<string> = new Set();

  constructor(
    private patternRepository: PatternRepository,
    private alertingSystem: AlertingSystem
  ) {}

  async analyzeStream(tenantContext: TenantContext, sourceId: string, currentData: DataPoint[], newData: DataPoint[]) {
    // Simple z-score based anomaly detection for demonstration (L3 Logic)
    if (currentData.length < 3) {
      return; // Not enough data to form a baseline
    }

    const values = currentData.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance) || 1; // prevent div by 0

    const windowKey = `${tenantContext.tenantId}:${sourceId}`;

    // Check whether any new data point crosses the threshold
    const anomalousPoints = newData.filter(point => {
      const zScore = Math.abs((point.value - mean) / stdDev);
      return zScore > 3;
    });

    if (anomalousPoints.length === 0) {
      // No anomaly in this batch — close any open window so the next real
      // anomaly episode can fire a fresh save+alert.
      this.activeAnomalyWindows.delete(windowKey);
      return;
    }

    // Window-based deduplication: fire exactly once per anomaly episode.
    if (this.activeAnomalyWindows.has(windowKey)) {
      // An anomaly is already active for this source — suppress duplicates.
      return;
    }

    // Open the window and record the first (most significant) anomalous point.
    this.activeAnomalyWindows.add(windowKey);

    // Use the point with the highest z-score as the canonical representative.
    let worstPoint = anomalousPoints[0];
    let worstZScore = Math.abs((worstPoint.value - mean) / stdDev);
    for (const point of anomalousPoints) {
      const z = Math.abs((point.value - mean) / stdDev);
      if (z > worstZScore) {
        worstZScore = z;
        worstPoint = point;
      }
    }

    this.patternRepository.savePattern(tenantContext, {
      type: 'anomaly',
      sourceId,
      confidence: Math.min(0.99, worstZScore / 10),
      details: { value: worstPoint.value, expected: mean, zScore: worstZScore }
    });

    this.alertingSystem.triggerAlert(tenantContext, {
      sourceId,
      message: `Anomaly detected in stream ${sourceId}: value ${worstPoint.value} deviates significantly from mean ${mean.toFixed(2)}`,
      severity: worstZScore > 5 ? 'critical' : 'high'
    });
  }
}
