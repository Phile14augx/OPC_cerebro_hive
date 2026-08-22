
export type PolicyDecisionType = 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL' | 'REDACT' | 'RETRY' | 'ESCALATE';

export interface PolicyDecision {
  type: PolicyDecisionType;
  reason: string;
  policyId: string;
}

export interface Policy {
  id: string;
  rules: unknown[];
}
