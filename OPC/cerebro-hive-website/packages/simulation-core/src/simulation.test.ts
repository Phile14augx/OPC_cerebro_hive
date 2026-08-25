import { describe, it, expect } from 'vitest';
import * as mod from './index';

describe('simulation-core Contract', () => {
  it('should import module', () => {
    expect(mod).toBeDefined();
  });
  it('should not throw on import (Negative Control)', () => {
    expect(mod).toBeDefined();
  });
});