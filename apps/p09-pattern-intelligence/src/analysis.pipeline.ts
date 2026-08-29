import { AlertingSystem } from './alerting.system';
import { PatternRepository } from './pattern.repository';
import { DataPoint, TenantContext } from './types';

export class AnalysisPipeline {
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

    for (const point of newData) {
      const zScore = Math.abs((point.value - mean) / stdDev);
      
      // If z-score is greater than 3, we consider it a significant anomaly
      if (zScore > 3) {
        this.patternRepository.savePattern(tenantContext, {
          type: 'anomaly',
          sourceId,
          confidence: Math.min(0.99, zScore / 10),
          details: { value: point.value, expected: mean, zScore }
        });

        this.alertingSystem.triggerAlert(tenantContext, {
          sourceId,
          message: `Anomaly detected in stream ${sourceId}: value ${point.value} deviates significantly from mean ${mean.toFixed(2)}`,
          severity: zScore > 5 ? 'critical' : 'high'
        });
      }
    }
  }
}
