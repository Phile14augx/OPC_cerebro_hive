
export interface AgentManifest {
  id: string;
  version: string;
  displayName: string;
  capabilities: string[];
  protocols: string[];
  resources: { cpu: number; mem: number };
  costProfile: 'low' | 'medium' | 'high';
  permissions: string[];
  maxConcurrency: number;
  priority: number;
  tags: string[];
}
