export enum ProviderType {
  OpenAI = 'OpenAI',
  Anthropic = 'Anthropic',
  Google = 'Google',
  Azure = 'Azure',
  AWSBedrock = 'AWSBedrock',
  HuggingFace = 'HuggingFace',
  Ollama = 'Ollama',
  vLLM = 'vLLM',
  Custom = 'Custom'
}

export interface AIProvider {
  providerId: string;
  name: string;
  type: ProviderType;
  
  // Link to CMDB as a governed asset (composition)
  cmdbConfigurationItemId: string; 
  
  status: 'Active' | 'Degraded' | 'Outage' | 'Retired';
  
  slaCompliance: number; // e.g. 99.99
}
