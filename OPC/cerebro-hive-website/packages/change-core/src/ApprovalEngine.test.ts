import { describe, it, expect } from 'vitest';
import { ApprovalEngine } from './services/ApprovalEngine';
import type { PolicyProvider, PolicyDecision } from './integrations/PolicyProvider';
import { ChangeRequest } from './domain/ChangeRequest';

class MockPolicyProvider implements PolicyProvider {
  async evaluateChangePolicy(riskScore: number, isEmergency: boolean): Promise<PolicyDecision> {
    if (riskScore > 90) return { allowed: false, reason: 'Risk too high', requiredApprovals: [] };
    return { allowed: true, reason: 'Allowed by policy', requiredApprovals: ['CAB'] as any };
  }
}

describe('ApprovalEngine Contract', () => {
  it('should throw an error if risk score is undefined', async () => {
    const engine = new ApprovalEngine(new MockPolicyProvider());
    const change = { id: 'cr-1' } as ChangeRequest;
    await expect(engine.evaluateApprovals(change)).rejects.toThrow('Risk score must be calculated before evaluating approvals.');
  });

  it('should throw an error if policy rejects the change (Negative Control)', async () => {
    const engine = new ApprovalEngine(new MockPolicyProvider());
    const change = { id: 'cr-2', calculatedRiskScore: 95 } as ChangeRequest;
    await expect(engine.evaluateApprovals(change)).rejects.toThrow('Change rejected by policy: Risk too high');
  });
});
