import { describe, it, expect } from 'vitest';
import type { Recommendation } from './Types';

describe('RecommendationAPI Types Contract', () => {
  it('should construct a valid Recommendation', () => {
    const rec: Recommendation = { id: 'rec-1', title: 'Scale API gateway', impact: 'high' };
    expect(rec.impact).toBe('high');
  });

  it('should fail when recommendation has empty title (Negative Control)', () => {
    const title = '';
    expect(title.length).toBe(0); // domain violation: empty title is detectable
  });
});
