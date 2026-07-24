export type PolicyEffect = 'Permit' | 'Deny';
export type PolicyLifecycleState = 'Draft' | 'Validation' | 'Simulation' | 'Pending Review' | 'Approved' | 'Staged' | 'Active' | 'Deprecated' | 'Archived';
export type ExecutionStage = 'BeforeAction' | 'DuringAction' | 'AfterAction';
export type AdviceCategory = 'Security' | 'Compliance' | 'Cost' | 'Performance' | 'Operational';

export interface PolicyObligation {
  id: string;
  stage: ExecutionStage;
  action: string;
  parameters?: Record<string, any>;
}

export interface PolicyAdvice {
  id: string;
  category: AdviceCategory;
  message: string;
  metadata?: Record<string, any>;
}

export interface PolicyCondition {
  field: string;
  operator: string;
  value: any;
}

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  version: string; // Immutable semver (e.g., '1.0.0')
  lifecycleState: PolicyLifecycleState;
  
  effect: PolicyEffect;
  priority: number;
  enabled: boolean;
  
  actions: string[];
  resources: string[];
  conditions: PolicyCondition[];
  exceptions?: PolicyCondition[];
  
  obligations?: PolicyObligation[];
  advice?: PolicyAdvice[];
  
  metadata?: Record<string, any>;
  createdBy: string;
  updatedBy?: string;
  expiresAt?: Date;
}
