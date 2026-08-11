import { LegalBasis } from '../consent/ConsentRegistry';

export interface PrivacyImpactAssessment {
  id: string;
  datasetId: string;
  
  processingPurpose: string;
  legalBasis: LegalBasis;
  
  categoriesOfData: string[];
  dataSubjects: string[];
  recipients: string[];
  internationalTransfers: string[]; // e.g., 'US', 'India'
  
  riskAssessment: string;
  mitigations: string[];
  
  approvedBy: string;
  reviewDate: Date;
}

export class PiaRegistry {
  private pias = new Map<string, PrivacyImpactAssessment>();

  registerPia(pia: PrivacyImpactAssessment) {
    this.pias.set(pia.datasetId, pia);
  }

  getPiaForDataset(datasetId: string): PrivacyImpactAssessment | undefined {
    return this.pias.get(datasetId);
  }
}
