
export type PolicyDecisionType = 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL' | 'REDACT' | 'RETRY' | 'ESCALATE';

export interface PolicyDecision {
  type: PolicyDecisionType;
  reason: string;
  policyId: string;
}

export interface Policy {
  id: string;
  type: 'Identity' | 'Resource' | 'Tool' | 'Model' | 'Budget' | 'Prompt' | 'PII';
  rules: any[];
}
