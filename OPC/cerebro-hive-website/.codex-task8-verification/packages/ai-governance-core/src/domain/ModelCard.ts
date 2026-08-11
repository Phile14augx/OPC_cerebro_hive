export interface ModelCard {
  modelCardId: string;
  modelId: string;
  
  intendedUse: string[];
  prohibitedUse: string[];
  
  supportedJurisdictions: string[];
  regulatoryObligations: string[];
  
  evaluationSummary: string;
  
  deploymentHistoryIds: string[];
  approvalChainIds: string[];
  
  linkedRiskIds: string[];
  linkedControlIds: string[];
  
  changeHistoryIds: string[];
  
  generatedAt: Date;
}
