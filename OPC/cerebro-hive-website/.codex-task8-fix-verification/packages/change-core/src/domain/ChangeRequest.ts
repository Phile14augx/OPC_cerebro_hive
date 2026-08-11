import { ChangeState, ChangeCategory, ChangePriority } from './ChangeState';
import { Approval } from './Approval';

export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  
  category: ChangeCategory;
  priority: ChangePriority;
  state: ChangeState;

  businessJustification: string;
  
  requesterId: string;
  implementerId?: string;
  
  affectedBusinessCapabilities: string[]; // Catalog IDs
  affectedConfigurationItems: string[];   // CI IDs
  
  implementationPlan: string;
  rollbackPlan: string;
  verificationPlan: string;
  communicationPlan?: string;
  
  maintenanceWindowStart?: Date;
  maintenanceWindowEnd?: Date;
  
  calculatedRiskScore?: number;
  
  approvals: Approval[];
  
  linkedIncidents: string[];
  linkedProblems: string[];
  linkedReleaseId?: string;
  
  auditReferences: string[];
  
  createdAt: Date;
  updatedAt: Date;
}
