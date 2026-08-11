export interface ResourceDescriptor {
  id: string;
  type: string;
  owner?: string;
  classification: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
  compliance?: string[];
  tags: string[];
  visibility: 'Public' | 'Tenant' | 'Private';
  environment?: string;
  region?: string;
  createdBy?: string;
  riskLevel: number; // 1-100
  costCenter?: string;
}
