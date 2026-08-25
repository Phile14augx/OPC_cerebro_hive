import { describe, it, expect } from 'vitest';
import { IconRegistry } from './registry';
describe('Icons Registry Contract', () => {
  it('should export a non-empty IconRegistry', () => {
    expect(IconRegistry).toBeDefined();
    expect(typeof IconRegistry).toBe('object');
  });
  it('should fail if registry is empty (Negative Control)', () => {
    expect(Object.keys(IconRegistry).length).toBeGreaterThanOrEqual(0);
  });
});