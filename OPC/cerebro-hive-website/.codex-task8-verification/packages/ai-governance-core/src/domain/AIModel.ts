export enum ModelStatus {
  Draft = 'Draft',
  InEvaluation = 'InEvaluation',
  Approved = 'Approved',
  Deployed = 'Deployed',
  Deprecated = 'Deprecated',
  Retired = 'Retired'
}

export interface AIModel {
  modelId: string;
  name: string; // e.g. 'Customer Support Agent'
  version: string;
  
  // Link to CMDB (Composition)
  cmdbConfigurationItemId: string; 
  
  providerId: string;
  
  // Lineage
  parentModelId?: string; // e.g., GPT-4 (if this is fine-tuned)
  trainingDatasetIds?: string[];
  
  // Technical specs
  supportedModalities: string[]; // text, image, audio
  tokenizer?: string;
  inferenceEngine?: string;
  quantization?: string;
  contextWindow: number;
  
  // Profiling
  costProfile: string;
  latencyProfile: string;
  safetyProfile: string;
  
  status: ModelStatus;
  
  createdAt: Date;
  updatedAt: Date;
}
