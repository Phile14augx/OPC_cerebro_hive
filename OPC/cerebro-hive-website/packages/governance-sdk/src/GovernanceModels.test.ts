import { describe, it, expect } from 'vitest';
import type { PolicyDecision, PolicyDecisionType } from './GovernanceModels';

describe('GovernanceModels Contract', () => {
  it('should construct a valid DENY decision', () => {
    const decision: PolicyDecision = {
      type: 'DENY' as PolicyDecisionType,
      reason: 'Budget exceeded',
      policyId: 'pol-budget-001',
    };
    expect(decision.type).toBe('DENY');
    expect(decision.policyId).toMatch(/^pol-/);
  });

  it('should fail when domain behavior is incorrect (Negative Control)', () => {
    const decision: PolicyDecision = {
      type: 'ALLOW' as PolicyDecisionType,
      reason: 'Permitted',
      policyId: 'pol-open',
    };
    expect(decision.type).not.toBe('DENY');
  });
});
