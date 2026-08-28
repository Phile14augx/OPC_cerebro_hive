// @vitest-environment node

import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.hoisted(() => ({ verifyToken: vi.fn() }));
const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  tenantMember: { findFirst: vi.fn() },
}));
const resolverMock = vi.hoisted(() => ({
  resolveWorkspaceTarget: vi.fn(),
  resolveProjectTarget: vi.fn(),
  resolveAssessmentVersionTarget: vi.fn(),
  resolveSessionTarget: vi.fn(),
}));

vi.mock('@/lib/services/auth.service', () => ({ AuthService: authMock }));
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));
vi.mock('@cerebro/db', () => ({
  TalentAuthorizationRepository: { fromPrisma: vi.fn(() => resolverMock) },
  TALENT_PERMISSION_TUPLES: [
    {
      key: 'READ_ASSESSMENT',
      resource: 'talent_assessments',
      action: 'read',
      serialized: 'talent_assessments:read',
    },
  ],
}));

import { withAuthorization } from './middleware';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const TENANT_ID = '22222222-2222-4222-8222-222222222222';
const WORKSPACE_ID = '33333333-3333-4333-8333-333333333333';
const RESOURCE_ID = '44444444-4444-4444-8444-444444444444';

function request(url: string, init: ConstructorParameters<typeof NextRequest>[1] = {}) {
  return new NextRequest(url, init);
}

const target = { resourceType: 'workspace' as const, resourceId: RESOURCE_ID };

beforeEach(() => {
  vi.clearAllMocks();
  authMock.verifyToken.mockResolvedValue({ userId: USER_ID });
  prismaMock.user.findUnique.mockResolvedValue({ id: USER_ID });
  prismaMock.tenantMember.findFirst.mockResolvedValue({
    tenantId: TENANT_ID,
    role: {
      id: '55555555-5555-4555-8555-555555555555',
      name: 'Recruiter',
      permissions: [{ resource: 'talent_assessments', action: 'read' }],
    },
  });
  resolverMock.resolveWorkspaceTarget.mockResolvedValue({
    resourceType: 'workspace',
    resourceId: RESOURCE_ID,
    workspaceId: WORKSPACE_ID,
    tenantId: TENANT_ID,
    ownerUserId: null,
  });
});

describe('withAuthorization', () => {
  it('uses a present malformed bearer instead of falling back to a cookie and never dispatches', async () => {
    const handler = vi.fn(async () => new Response(null, { status: 204 }));
    const response = await withAuthorization(
      request('https://studio.test/api', { headers: { authorization: 'Bearer', cookie: 'access_token=cookie-token' } }),
      'READ_ASSESSMENT',
      'talent_assessments',
      handler,
      target,
    );

    expect(response.status).toBe(401);
    expect(authMock.verifyToken).not.toHaveBeenCalled();
    expect(handler).not.toHaveBeenCalled();
  });

  it('returns 400 for a missing workspace selector before target resolution', async () => {
    const handler = vi.fn(async () => new Response(null, { status: 204 }));
    const response = await withAuthorization(
      request('https://studio.test/api', { headers: { authorization: 'Bearer bearer-token' } }),
      'READ_ASSESSMENT',
      'talent_assessments',
      handler,
      target,
    );

    expect(response.status).toBe(400);
    expect(resolverMock.resolveWorkspaceTarget).not.toHaveBeenCalled();
    expect(handler).not.toHaveBeenCalled();
  });

  it('denies cookie-authenticated unsafe requests without same-origin proof', async () => {
    const handler = vi.fn(async () => new Response(null, { status: 204 }));
    const response = await withAuthorization(
      request('https://studio.test/api', { method: 'POST', headers: { cookie: 'access_token=cookie-token', 'x-workspace-id': WORKSPACE_ID } }),
      'READ_ASSESSMENT',
      'talent_assessments',
      handler,
      target,
    );

    expect(response.status).toBe(403);
    expect(resolverMock.resolveWorkspaceTarget).not.toHaveBeenCalled();
    expect(handler).not.toHaveBeenCalled();
  });

  it('denies wildcard, blank, unresolved, workspace-mismatch, and resolver-error paths without handler dispatch', async () => {
    const handler = vi.fn(async () => new Response(null, { status: 204 }));
    const baseRequest = request('https://studio.test/api', { headers: { authorization: 'Bearer bearer-token', 'x-workspace-id': WORKSPACE_ID } });

    await expect(withAuthorization(baseRequest, 'READ_ASSESSMENT', '*', handler, target)).resolves.toHaveProperty('status', 403);
    await expect(withAuthorization(baseRequest, '', 'talent_assessments', handler, target)).resolves.toHaveProperty('status', 403);
    resolverMock.resolveWorkspaceTarget
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        resourceType: 'workspace',
        resourceId: RESOURCE_ID,
        workspaceId: '77777777-7777-4777-8777-777777777777',
        tenantId: TENANT_ID,
        ownerUserId: null,
      })
      .mockRejectedValueOnce(new Error('database unavailable'));
    await expect(withAuthorization(baseRequest, 'READ_ASSESSMENT', 'talent_assessments', handler, target)).resolves.toHaveProperty('status', 403);
    await expect(withAuthorization(baseRequest, 'READ_ASSESSMENT', 'talent_assessments', handler, target)).resolves.toHaveProperty('status', 403);
    await expect(withAuthorization(baseRequest, 'READ_ASSESSMENT', 'talent_assessments', handler, target)).resolves.toHaveProperty('status', 403);
    expect(handler).not.toHaveBeenCalled();
  });

  it('dispatches only after exact target resolution and policy approval with full derived context', async () => {
    const handler = vi.fn(async (_request, context) => {
      expect(context).toMatchObject({
        userId: USER_ID,
        tenantId: TENANT_ID,
        workspaceId: WORKSPACE_ID,
        roleId: '55555555-5555-4555-8555-555555555555',
        roleName: 'Recruiter',
        permissions: ['talent_assessments:read'],
        resourceType: 'workspace',
        resourceId: RESOURCE_ID,
      });
      return new Response(null, { status: 204 });
    });

    const response = await withAuthorization(
      request('https://studio.test/api', { headers: { authorization: 'Bearer bearer-token', 'x-workspace-id': WORKSPACE_ID } }),
      'READ_ASSESSMENT',
      'talent_assessments',
      handler,
      target,
    );

    expect(response.status).toBe(204);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('keeps all seven existing wildcard route contracts fail-closed before handler invocation', async () => {
    const handler = vi.fn(async () => new Response(null, { status: 204 }));
    const routeActions = [
      'READ_ASSESSMENT',
      'CREATE_ASSESSMENT',
      'READ_COPILOT_INSIGHTS',
      'CREATE_SESSION',
      'SUBMIT_SESSION',
      'UPDATE_SESSION',
      'CREATE_EXECUTION',
    ];
    const protectedRequest = request('https://studio.test/api', { headers: { authorization: 'Bearer bearer-token', 'x-workspace-id': WORKSPACE_ID } });

    for (const action of routeActions) {
      await expect(withAuthorization(protectedRequest, action, '*', handler)).resolves.toHaveProperty('status', 403);
    }
    expect(handler).not.toHaveBeenCalled();
  });
});
