import { describe, expect, it } from 'vitest';
import { CapabilityRegistry } from './index';

describe('CapabilityRegistry', () => {
  it('registers, retrieves, and lists capability metadata', () => {
    const registry = new CapabilityRegistry();
    registry.register({ id: 'search', name: 'Search', version: '1.0.0', description: 'Search' });
    expect(registry.get('search')).toMatchObject({ name: 'Search' });
    expect(registry.list()).toHaveLength(1);
  });
});
