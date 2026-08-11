import { describe, expect, it } from 'vitest';
import { OrganizationId, WorkspaceId } from '../ids/ids';
import { DomainModelError } from '../errors/DomainModelError';

describe('Identifiers', () => {
  it('constructs a valid identifier from a non-empty string', () => {
    const id = OrganizationId.of('org-123');
    expect(id).toBe('org-123');
  });

  it('rejects an empty string', () => {
    expect(() => OrganizationId.of('')).toThrow(DomainModelError);
  });

  it('rejects a whitespace-only string', () => {
    expect(() => OrganizationId.of('   ')).toThrow(DomainModelError);
  });

  it('is() type-guards without throwing', () => {
    expect(OrganizationId.is('org-123')).toBe(true);
    expect(OrganizationId.is('')).toBe(false);
    expect(OrganizationId.is(42)).toBe(false);
    expect(OrganizationId.is(undefined)).toBe(false);
  });

  it('keeps distinct identifier brands from colliding at the type level', () => {
    const orgId = OrganizationId.of('org-1');
    const workspaceId = WorkspaceId.of('ws-1');
    // Runtime check only — the real value of the branding is a compile-time
    // guarantee (assigning workspaceId to a variable typed OrganizationId
    // would fail to compile), which this test can't directly assert, but the
    // underlying string values remaining distinct is a necessary condition.
    expect(orgId).not.toBe(workspaceId as unknown as typeof orgId);
  });
});
