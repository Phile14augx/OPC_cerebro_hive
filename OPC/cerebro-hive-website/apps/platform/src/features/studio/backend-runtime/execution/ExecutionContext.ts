
export interface ExecutionContext {
  executionId: string;
  workflowId: string;
  releaseId: string;
  tenantId: string;
  identity: string;
  variables: Record<string, any>;
  traceId: string;
  deadline: number;
  policy: string;
}
