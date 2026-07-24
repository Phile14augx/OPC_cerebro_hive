import { ChangeCategory } from './ChangeState';

export interface ChangeTemplate {
  templateId: string;
  name: string; // e.g., 'Database Patch'
  description: string;
  
  category: ChangeCategory;
  
  standardImplementationPlan: string;
  standardRollbackPlan: string;
  standardVerificationPlan: string;
  
  defaultApprovalsRequired: string[];
}
