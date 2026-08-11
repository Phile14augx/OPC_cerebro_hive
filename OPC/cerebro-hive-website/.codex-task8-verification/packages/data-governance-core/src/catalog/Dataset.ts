export type CertificationState = 'Draft' | 'Reviewed' | 'Certified' | 'Deprecated' | 'Archived';

export interface DatasetClassification {
  sensitivity: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
  containsPII: boolean;
  containsPHI: boolean;
  residency: string[]; // e.g., ['US', 'EU']
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  domain: string;
  
  classification: DatasetClassification;
  certification: CertificationState;
  
  schemaId?: string;
  
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
