import { describe, expect, it } from 'vitest';
import { ResourceReference } from '../value-objects/ResourceReference';
import { ResourceId } from '../ids/ids';

describe('ValueObject / ResourceReference', () => {
  it('is equal to another instance with the same props', () => {
    const id = ResourceId.of('res-1');
    const a = ResourceReference.of(id, 'hive-compute.virtual-machine');
    const b = ResourceReference.of(id, 'hive-compute.virtual-machine');
    expect(a.equals(b)).toBe(true);
  });

  it('is not equal when resourceType differs', () => {
    const id = ResourceId.of('res-1');
    const a = ResourceReference.of(id, 'hive-compute.virtual-machine');
    const b = ResourceReference.of(id, 'hive-storage.object-bucket');
    expect(a.equals(b)).toBe(false);
  });

  it('is not equal when resourceId differs', () => {
    const a = ResourceReference.of(ResourceId.of('res-1'), 'hive-compute.virtual-machine');
    const b = ResourceReference.of(ResourceId.of('res-2'), 'hive-compute.virtual-machine');
    expect(a.equals(b)).toBe(false);
  });

  it('exposes its props via getters', () => {
    const id = ResourceId.of('res-1');
    const ref = ResourceReference.of(id, 'hive-database.postgresql');
    expect(ref.resourceId).toBe(id);
    expect(ref.resourceType).toBe('hive-database.postgresql');
  });
});
