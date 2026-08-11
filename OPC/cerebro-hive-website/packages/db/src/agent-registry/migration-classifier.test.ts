import { describe, expect, it } from 'vitest';
import { classifyLegacyAgent } from './migration-classifier';

describe('legacy Agent lifecycle classification', () => {
  it('preserves executable active agents as production', () => {
    expect(classifyLegacyAgent({ isActive: true, selectedVersionId: 'version-1' })).toEqual({
      lifecycle: 'PRODUCTION',
      reviewRequired: false,
    });
  });

  it('requires explicit disposition before enforcing suspension', () => {
    expect(classifyLegacyAgent({ isActive: false, selectedVersionId: 'version-1' })).toEqual({
      lifecycle: 'SUSPENDED',
      reviewRequired: true,
    });
  });

  it('classifies an agent without a published version as draft', () => {
    expect(classifyLegacyAgent({ isActive: true, selectedVersionId: null })).toEqual({
      lifecycle: 'DRAFT',
      reviewRequired: false,
    });
  });
});
