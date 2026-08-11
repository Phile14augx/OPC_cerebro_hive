
export type FreshnessState = 'Current' | 'PolicyChanged' | 'CapabilityChanged' | 'DatasetChanged' | 'Expired' | 'Unknown';

export interface PlatformStateSnapshot {
  policyEngineVersion: string;
  capabilityRegistryVersion: string;
  intelligenceModelVersion: string;
  executionDatasetVersion: string;
  forecastModelVersion: string;
  capturedAt: Date;
}

export class ReviewFreshnessEvaluator {
  static async captureSnapshot(): Promise<PlatformStateSnapshot> {
    return {
      policyEngineVersion: '2026.07.27-a',
      capabilityRegistryVersion: '1.4.2',
      intelligenceModelVersion: 'v2-active',
      executionDatasetVersion: '2026-07-27',
      forecastModelVersion: 'ewma-v3',
      capturedAt: new Date(),
    };
  }

  // Release pipeline calls this to determine if an existing report is still valid
  static evaluate(reportSnapshot: PlatformStateSnapshot, currentSnapshot: PlatformStateSnapshot): FreshnessState {
    if (reportSnapshot.policyEngineVersion !== currentSnapshot.policyEngineVersion)         return 'PolicyChanged';
    if (reportSnapshot.capabilityRegistryVersion !== currentSnapshot.capabilityRegistryVersion) return 'CapabilityChanged';
    if (reportSnapshot.executionDatasetVersion !== currentSnapshot.executionDatasetVersion)  return 'DatasetChanged';
    const ageMs = Date.now() - new Date(reportSnapshot.capturedAt).getTime();
    if (ageMs > 7 * 24 * 60 * 60 * 1000) return 'Expired'; // >7 days
    return 'Current';
  }
}
