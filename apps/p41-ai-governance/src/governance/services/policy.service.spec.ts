import { Test, TestingModule } from '@nestjs/testing';
import { PolicyService } from './policy.service';

describe('PolicyService', () => {
  let service: PolicyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PolicyService],
    }).compile();

    service = module.get<PolicyService>(PolicyService);
  });

  it('should allow deploy_model when risk is low', () => {
    const result = service.evaluatePolicy({
      action: 'deploy_model',
      resourceId: 'model-1',
      context: { riskLevel: 'low' }
    });
    expect(result.allowed).toBe(true);
  });

  it('should deny deploy_model when risk is high and not human approved', () => {
    const result = service.evaluatePolicy({
      action: 'deploy_model',
      resourceId: 'model-1',
      context: { riskLevel: 'high', humanApproved: false }
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('High risk models require human approval');
    expect(result.policyViolations).toContain('risk-policy-001');
  });

  it('should allow deploy_model when risk is high and human approved', () => {
    const result = service.evaluatePolicy({
      action: 'deploy_model',
      resourceId: 'model-1',
      context: { riskLevel: 'high', humanApproved: true }
    });
    expect(result.allowed).toBe(true);
  });

  it('should escalate budget', () => {
    const result = service.evaluatePolicy({
      action: 'escalate_budget',
      resourceId: 'budget-1',
      context: {}
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Budget escalation required');
    expect(result.policyViolations).toContain('escalation-needed');
  });

  it('should deny unknown actions', () => {
    const result = service.evaluatePolicy({
      action: 'unknown_action',
      resourceId: 'res-1',
      context: {}
    });
    expect(result.allowed).toBe(false);
  });
});
