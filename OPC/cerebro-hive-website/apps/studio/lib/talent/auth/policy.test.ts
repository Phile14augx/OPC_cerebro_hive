// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  tenantMember: {
    findFirst: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));

import { TalentPolicyEngine } from './policy';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const TENANT_ID = '22222222-2222-4222-8222-222222222222';
const WORKSPACE_ID = '33333333-3333-4333-8333-333333333333';
const RESOURCE_ID = '44444444-4444-4444-8444-444444444444';

const target = {
  resourceType: 'workspace' as const,
  resourceId: RESOURCE_ID,
  workspaceId: WORKSPACE_ID,
  tenantId: TENANT_ID,
  ownerUserId: null,
};

const permission = {
  key: 'READ_ASSESSMENT' as const,
  resource: 'talent_assessments' as const,
  action: 'read' as const,
  serialized: 'talent_assessments:read' as const,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TalentPolicyEngine', () => {
  it('derives a complete readonly context only from exact tenant membership and permission tuple', async () => {
    prismaMock.tenantMember.findFirst.mockResolvedValue({
      tenantId: TENANT_ID,
      role: {
        id: '55555555-5555-4555-8555-555555555555',
        name: 'Recruiter',
        permissions: [
          { resource: 'talent_assessments', action: 'read' },
          { resource: 'talent_copilot', action: 'read' },
        ],
      },
    });

    const context = await new TalentPolicyEngine().authorize(USER_ID, target, permission);

    expect(context).toEqual({
      userId: USER_ID,
      tenantId: TENANT_ID,
      workspaceId: WORKSPACE_ID,
      roleId: '55555555-5555-4555-8555-555555555555',
      roleName: 'Recruiter',
      permissions: ['talent_assessments:read', 'talent_copilot:read'],
      resourceType: 'workspace',
      resourceId: RESOURCE_ID,
    });
    expect(Object.isFrozen(context?.permissions)).toBe(true);
    expect(prismaMock.tenantMember.findFirst).toHaveBeenCalledWith({
      where: {
        userId: USER_ID,
        tenantId: TENANT_ID,
        role: {
          permissions: {
            some: {
              resource: 'talent_assessments',
              action: 'read',
            },
          },
        },
      },
      select: {
        tenantId: true,
        role: {
          select: {
            id: true,
            name: true,
            permissions: {
              select: { resource: true, action: true },
              orderBy: { id: 'asc' },
            },
          },
        },
      },
    });
  });

  it('denies absent exact tuple, wrong-tenant membership, and role-name-only grants identically', async () => {
    prismaMock.tenantMember.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    const policy = new TalentPolicyEngine();

    await expect(policy.authorize(USER_ID, target, permission)).resolves.toBeNull();
    await expect(policy.authorize(USER_ID, { ...target, tenantId: '66666666-6666-4666-8666-666666666666' }, permission)).resolves.toBeNull();
    await expect(policy.authorize(USER_ID, target, permission)).resolves.toBeNull();
  });
});
