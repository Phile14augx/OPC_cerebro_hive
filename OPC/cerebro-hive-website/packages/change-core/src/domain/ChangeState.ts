export enum ChangeState {
  Draft = 'Draft',
  Submitted = 'Submitted',
  ImpactAssessed = 'ImpactAssessed',
  RiskAssessed = 'RiskAssessed',
  AwaitingApproval = 'AwaitingApproval',
  Approved = 'Approved',
  Scheduled = 'Scheduled',
  Executing = 'Executing',
  Verification = 'Verification',
  Completed = 'Completed',
  RolledBack = 'RolledBack',
  Rejected = 'Rejected'
}

export enum ChangeCategory {
  Standard = 'Standard',
  Normal = 'Normal',
  Emergency = 'Emergency',
  Major = 'Major'
}

export enum ChangePriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}
