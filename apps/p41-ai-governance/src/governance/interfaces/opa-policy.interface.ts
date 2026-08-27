export interface IOpaPolicy {
  id: string;
  name: string;
  regoContent: string;
  version: number;
  status: 'active' | 'inactive';
}

export interface IOpaPolicyEvaluationRequest {
  action: string;
  resourceId: string;
  context: Record<string, any>;
}

export interface IOpaPolicyEvaluationResponse {
  allowed: boolean;
  reason?: string;
  policyViolations?: string[];
}
