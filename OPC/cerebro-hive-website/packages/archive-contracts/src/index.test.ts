import { describe, it, expect } from 'vitest';
import { ARCHIVE_CONTRACT_VERSION } from './index';

describe('Archive Contracts', () => {
  it('should export correct version (Negative Control target)', () => {
    expect(ARCHIVE_CONTRACT_VERSION).toBe('1.0.0');
  });
});
