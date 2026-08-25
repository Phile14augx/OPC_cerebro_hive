export enum AIGovernanceEventType {
  ModelRegistered = 'ModelRegistered',
  PromptRegistered = 'PromptRegistered',
  DatasetRegistered = 'DatasetRegistered',
  EvaluationCompleted = 'EvaluationCompleted',
  ModelApproved = 'ModelApproved',
  DeploymentRequested = 'DeploymentRequested',
  DeploymentApproved = 'DeploymentApproved',
  DeploymentRejected = 'DeploymentRejected',
  MonitoringAlert = 'MonitoringAlert',
  ModelRetired = 'ModelRetired'
}

export interface AIGovernanceEvent {
  eventId: string;
  eventType: AIGovernanceEventType;
  assetId: string;
  timestamp: Date;
  payload: Record<string, unknown>;
}
