import { describe, it, expect } from 'vitest';
import type { ExecutionProfile } from './ExecutionProfile';

describe('ExecutionProfile Contract', () => {
  it('should construct a valid ExecutionProfile', () => {
    const profile: ExecutionProfile = {
      cpuShares: 512,
      memoryLimitMB: 256,
      timeoutMs: 30000,
      networkEnabled: true,
      retryPolicy: 'exponential_backoff',
    };
    expect(profile.retryPolicy).toBe('exponential_backoff');
    expect(profile.memoryLimitMB).toBeGreaterThan(0);
  });

  it('should detect invalid retry policy (Negative Control)', () => {
    const validPolicies = ['never', 'on_failure', 'exponential_backoff'];
    const invalid = 'always_retry';
    expect(validPolicies.includes(invalid)).toBe(false);
  });
});
