import { Injectable } from '@nestjs/common';
import { AlertService } from '../alert/alert.service';

@Injectable()
export class DriftDetectionService {
  public baselines = new Map<string, unknown>();

  constructor(private readonly alertService: AlertService) {}

  public computePSI(reference: number[], current: number[], buckets: number = 10): number {
    if (reference.length === 0 || current.length === 0) return 0;

    const min = Math.min(...reference, ...current);
    const max = Math.max(...reference, ...current);
    const binSize = (max - min) / buckets || 1;

    const refCounts = new Array(buckets).fill(0);
    const currCounts = new Array(buckets).fill(0);

    for (const val of reference) {
      let bin = Math.floor((val - min) / binSize);
      if (bin >= buckets) bin = buckets - 1;
      refCounts[bin]++;
    }

    for (const val of current) {
      let bin = Math.floor((val - min) / binSize);
      if (bin >= buckets) bin = buckets - 1;
      currCounts[bin]++;
    }

    let psi = 0;
    for (let i = 0; i < buckets; i++) {
      const epsilon = 0.0001;
      const refPct = Math.max(refCounts[i] / reference.length, epsilon);
      const currPct = Math.max(currCounts[i] / current.length, epsilon);

      psi += (currPct - refPct) * Math.log(currPct / refPct);
    }

    return psi;
  }

  async detectDrift(modelId: string, reference: number[], current: number[]): Promise<any> {
    const psi = this.computePSI(reference, current);
    
    let classification = 'stable';
    if (psi > 0.25) {
      classification = 'critical';
    } else if (psi >= 0.1) {
      classification = 'warning';
    }

    if (classification === 'critical') {
      await this.alertService.createDriftAlert(modelId, psi, 0.25, 'input_feature');
    }

    return {
      modelId,
      psi,
      classification
    };
  }

  async createBaseline(modelId: string, featureStats: unknown): Promise<void> {
    this.baselines.set(modelId, featureStats);
  }
}
