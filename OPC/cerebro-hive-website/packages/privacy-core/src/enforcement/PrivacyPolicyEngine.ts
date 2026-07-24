import { ConsentRegistry } from '../consent/ConsentRegistry';
import { ProcessingRegistry } from '../processing/ProcessingRegistry';

export interface PrivacyEvaluationRequest {
  principalId: string;
  processingActivityId: string;
  targetProcessingRegion: string; // The region where computation is attempting to occur
}

export interface PrivacyEvaluationResult {
  allowed: boolean;
  reason: string;
  residencyViolation?: boolean;
}

// Minimal mocked Dataset classification from data-governance-core to remain decoupled
export interface GovernanceDatasetClassification {
  id: string;
  residency: {
    originRegion: string;
    allowedStorageRegions: string[];
    allowedProcessingRegions: string[];
    transferRestricted: boolean;
  };
}

export class PrivacyPolicyEngine {
  constructor(
    private consentRegistry: ConsentRegistry,
    private processingRegistry: ProcessingRegistry,
    private mockedCatalog: Map<string, GovernanceDatasetClassification> // Replaces direct dependency
  ) {}

  evaluate(request: PrivacyEvaluationRequest): PrivacyEvaluationResult {
    const activity = this.processingRegistry.getActivity(request.processingActivityId);
    if (!activity) {
      return { allowed: false, reason: 'Processing Activity not registered' };
    }

    // 1. Evaluate Legal Basis & Consent
    if (activity.legalBasis === 'Consent') {
      const consent = this.consentRegistry.getActiveConsent(request.principalId, activity.purpose);
      if (!consent) {
        return { allowed: false, reason: `No valid consent found for purpose: ${activity.purpose}` };
      }
    }

    // 2. Evaluate Residency for all datasets involved in the activity
    for (const datasetId of activity.datasetIds) {
      const dataset = this.mockedCatalog.get(datasetId);
      if (dataset) {
        if (!dataset.residency.allowedProcessingRegions.includes(request.targetProcessingRegion)) {
          return {
            allowed: false,
            reason: `Residency Violation: Dataset ${datasetId} cannot be processed in ${request.targetProcessingRegion}`,
            residencyViolation: true
          };
        }
      }
    }

    // 3. Final Decision
    return { allowed: true, reason: 'Privacy policies satisfied' };
  }
}
