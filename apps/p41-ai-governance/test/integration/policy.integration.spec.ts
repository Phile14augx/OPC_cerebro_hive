import { PolicyService } from '../../src/governance/services/policy.service';

describe('Policy Integration', () => {
  let service: PolicyService;
  beforeEach(() => { service = new PolicyService(); });

  it('should execute policy checks end-to-end', () => {
    const result = service.evaluatePolicy({ action: 'deploy_model', resourceId: 'dataset_456', context: { riskLevel: 'low' } });
    expect(result).toBeDefined();
    expect(result.allowed).toBeDefined();
  });
});
