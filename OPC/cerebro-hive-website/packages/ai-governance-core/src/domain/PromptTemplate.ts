export enum PromptStatus {
  Draft = 'Draft',
  InReview = 'InReview',
  Approved = 'Approved',
  Deployed = 'Deployed',
  Retired = 'Retired'
}

export interface PromptTemplate {
  promptId: string;
  name: string;
  semanticVersion: string; // e.g. 1.2.0
  
  // Link to CMDB (Composition)
  cmdbConfigurationItemId: string;
  
  ownerId: string;
  
  content: string; // The actual prompt string with variables
  variables: string[]; // e.g. ['userName', 'query']
  
  supportedModelIds: string[];
  
  requiredGuardrails: string[]; // e.g. ['PII-Filter', 'Toxicity-Filter']
  
  evaluationHistoryIds: string[];
  
  status: PromptStatus;
  
  createdAt: Date;
  updatedAt: Date;
}
