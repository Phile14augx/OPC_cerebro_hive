export interface Runbook {
  runbookId: string;
  name: string;
  version: string;
  owner: string;
  provider: string; // e.g., 'AWSSystemsManager', 'AnsibleTower', 'Mock'
  payloadTemplate: any;
  confidenceScore: number; // Continuously updated by ClosedLoopVerifier
  executionHistoryCount: number;
}
