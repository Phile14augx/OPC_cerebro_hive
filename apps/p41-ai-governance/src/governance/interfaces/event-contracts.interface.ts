export interface IPolicyEvaluatedEvent {
  eventId: string;
  timestamp: string;
  action: string;
  resourceId: string;
  allowed: boolean;
  violations: string[];
}

export interface IApprovalStatusChangedEvent {
  eventId: string;
  timestamp: string;
  approvalId: string;
  resourceId: string;
  oldStatus: string;
  newStatus: string;
  approverId: string;
}

export interface IBudgetExceededEvent {
  subjectId: string;
  provenanceRecordId: string;
  verdict: 'deny' | 'escalate';
  policyRef: string;
  timestamp: string;
}

export interface IPrivacyBudgetConsumedEvent {
  eventType: 'privacy_budget_consumed';
  sourceProduct: string;
  subjectId: string;
  epsilon: number;
  delta: number;
  cumulativeEpsilon: number;
  threshold: number;
  exceeded: boolean;
  operation: string;
  timestamp: string;
}
