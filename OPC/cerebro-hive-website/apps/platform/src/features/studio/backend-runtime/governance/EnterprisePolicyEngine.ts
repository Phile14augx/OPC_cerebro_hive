
export type PolicyLevel = 'Hard' | 'Soft';

export interface EnterprisePolicy {
  policyId: string;
  level: PolicyLevel;
  type: 'Cost' | 'Compliance' | 'Tenant' | 'Provider' | 'Region' | 'SLA';
  evaluate(context: unknown): boolean;
}

export class EnterprisePolicyEngine {
  private policies: EnterprisePolicy[] = [];

  enforce(context: unknown): void {
    for (const policy of this.policies) {
      if (policy.level === 'Hard' && !policy.evaluate(context)) {
        throw new Error(`Execution blocked by Hard Enterprise Policy: ${policy.policyId}`);
      }
    }
  }
}
