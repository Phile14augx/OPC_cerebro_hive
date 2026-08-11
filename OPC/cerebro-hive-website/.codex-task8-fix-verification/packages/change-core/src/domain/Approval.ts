export enum ApprovalStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected'
}

export enum ApprovalType {
  AutoApproval = 'AutoApproval',
  Manager = 'Manager',
  CAB = 'CAB',
  EmergencyCAB = 'EmergencyCAB'
}

export interface Approval {
  approvalId: string;
  changeRequestId: string;
  approvalType: ApprovalType;
  status: ApprovalStatus;
  approverId?: string; // Optional if AutoApproval or CAB group
  approverGroupId?: string;
  comments?: string;
  decidedAt?: Date;
}
