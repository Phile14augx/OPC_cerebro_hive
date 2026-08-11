export enum SensitivityClassification {
  Public = 'Public',
  Internal = 'Internal',
  Confidential = 'Confidential',
  Restricted = 'Restricted'
}

export interface Dataset {
  datasetId: string;
  name: string;
  
  // Link to CMDB (Composition)
  cmdbConfigurationItemId: string;
  
  sensitivityClassification: SensitivityClassification;
  legalBasis?: string;
  retentionPolicyDays: number;
  
  provenance: string; // Origin of the data
  licensing: string;
  
  geographicRestrictions: string[]; // e.g. ['EU-Only', 'US-Only']
  consentRequirements: string[];
  
  piiInventory: string[]; // e.g. ['email', 'ssn', 'phone']
  
  createdAt: Date;
  updatedAt: Date;
}
