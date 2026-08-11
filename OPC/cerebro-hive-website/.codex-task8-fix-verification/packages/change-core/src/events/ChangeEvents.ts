export enum ChangeEventType {
  ChangeSubmitted = 'ChangeSubmitted',
  ImpactAnalysisCompleted = 'ImpactAnalysisCompleted',
  RiskAssessmentCompleted = 'RiskAssessmentCompleted',
  ApprovalRequested = 'ApprovalRequested',
  ApprovalGranted = 'ApprovalGranted',
  ApprovalRejected = 'ApprovalRejected',
  DeploymentScheduled = 'DeploymentScheduled',
  DeploymentStarted = 'DeploymentStarted',
  DeploymentSucceeded = 'DeploymentSucceeded',
  DeploymentFailed = 'DeploymentFailed',
  RollbackStarted = 'RollbackStarted',
  RollbackCompleted = 'RollbackCompleted',
  VerificationCompleted = 'VerificationCompleted',
  ChangeClosed = 'ChangeClosed'
}

export interface ChangeEvent {
  eventId: string;
  eventType: ChangeEventType;
  changeRequestId: string;
  timestamp: Date;
  payload: Record<string, any>;
}
