import { describe, expect, it } from 'vitest';
import { ResourceLifecycleState } from '../enums/ResourceLifecycleState';
import { HiveCapability } from '../enums/HiveCapability';

describe('ResourceLifecycleState', () => {
  it('has exactly the eight states fixed in 01-DOMAIN-MODEL.md §3', () => {
    expect(Object.values(ResourceLifecycleState).sort()).toEqual(
      ['Active', 'Degraded', 'Deleted', 'Deleting', 'Failed', 'Provisioning', 'Requested', 'Updating'].sort(),
    );
  });
});

describe('HiveCapability', () => {
  it('has exactly the eight capabilities fixed in 00-FOUNDATION.md §3 (post-Amendment 1)', () => {
    expect(Object.values(HiveCapability)).toHaveLength(8);
    expect(HiveCapability.HiveDatabase).toBe('HiveDatabase');
  });
});
