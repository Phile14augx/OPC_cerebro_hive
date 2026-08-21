import { describe, it, expect } from 'vitest';
import { TrustCalculator } from './mapping/TrustCalculator';
describe('TrustCalculator Contract', () => {
  it('should give a higher trust score for High assurance', () => {
    const calc = new TrustCalculator();
    const score = calc.calculateTrust(
      { assuranceLevel: 'High', authenticationMethod: 'mTLS' } as any,
      {} as any, {}
    );
    expect(score).toBeGreaterThan(50);
  });
  it('should give a lower trust score for Low assurance (Negative Control)', () => {
    const calc = new TrustCalculator();
    const score = calc.calculateTrust(
      { assuranceLevel: 'Low', authenticationMethod: 'password' } as any,
      {} as any, {}
    );
    expect(score).toBeLessThan(60);
  });
});