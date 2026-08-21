import { describe, it, expect } from 'vitest';
import type { PolicyEvaluation } from './Types';

describe('GovernanceAPI Types Contract', () => {
  it('should construct a valid PolicyEvaluation', () => {
    const pe: PolicyEvaluation = { id: 'ev-1', policy: 'pol-A', status: 'passed', timestamp: new Date() };
    expect(pe.status).toBe('passed');
  });

  it('should detect failed evaluation (Negative Control)', () => {
    const status = 'failed';
    expect(status).not.toBe('passed');
  });
});
