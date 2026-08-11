export enum ExecutionStatus {
  SUCCESS = 'SUCCESS',
  PARTIAL_SUCCESS = 'PARTIAL_SUCCESS',
  FAILED = 'FAILED',
  ROLLED_BACK = 'ROLLED_BACK',
  ABORTED = 'ABORTED',
  DRY_RUN = 'DRY_RUN',
  TIMEOUT = 'TIMEOUT',
  MANUAL_OVERRIDE = 'MANUAL_OVERRIDE'
}

export interface ExecutionRecord {
  recordId: string;
  incidentId: string;
  runbookId: string;
  targetNodeId: string;
  status: ExecutionStatus;
  
  // Execution Metrics
  durationMs: number;
  costEstimate?: number;
  
  // Context Metadata
  confidenceAtExecution: number;
  plannerVersion?: string;
  policyVersion?: string;
  knowledgeGraphVersion?: string;
  operatorApprovalId?: string;
  riskScoreAtExecution?: number;
  
  timestamp: Date;
}
