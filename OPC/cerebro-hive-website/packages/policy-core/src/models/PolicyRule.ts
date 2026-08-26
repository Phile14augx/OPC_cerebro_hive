// 'StepUpMfa' and 'HumanApproval' extend the base Permit/Deny effect per
// ADR-028 (Zero Trust identity, ABAC authorization, and the human-approval
// decision outcome) — a rule can declare either as its effect, not just a
// post-decision obligation, since both are first-class authorization
// outcomes a Policy Enforcement Point must branch on.
export type PolicyEffect = 'Permit' | 'Deny' | 'StepUpMfa' | 'HumanApproval';
export type PolicyLifecycleState = 'Draft' | 'Validation' | 'Simulation' | 'Pending Review' | 'Approved' | 'Staged' | 'Active' | 'Deprecated' | 'Archived';
export type ExecutionStage = 'BeforeAction' | 'DuringAction' | 'AfterAction';
export type AdviceCategory = 'Security' | 'Compliance' | 'Cost' | 'Performance' | 'Operational';

export interface PolicyObligation {
  id: string;
  stage: ExecutionStage;
  action: string;
  parameters?: Record<string, unknown>;
}

export interface PolicyAdvice {
  id: string;
  category: AdviceCategory;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface PolicyCondition {
  field: string;
  operator: string;
  value: unknown;
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
  
  metadata?: Record<string, unknown>;
  createdBy: string;
  updatedBy?: string;
  expiresAt?: Date;
}
