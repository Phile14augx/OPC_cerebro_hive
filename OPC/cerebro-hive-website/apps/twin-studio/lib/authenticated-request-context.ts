import { prisma } from '@cerebro/db/twin-studio';
import type { NextRequest } from 'next/server';

export type RequestAccess = 'READ' | 'WRITE';
export type AuthenticatedScope = {
  tenantId: string;
  workspaceId: string;
  userId: string;
};

export const DEV_TENANT_ID =
  process.env['TWIN_STUDIO_DEV_TENANT_ID'] ?? '00000000-0000-4000-8000-000000000101';
export const DEV_WORKSPACE_ID =
  process.env['TWIN_STUDIO_DEV_WORKSPACE_ID'] ?? '00000000-0000-4000-8000-000000000102';
export const DEV_USER_ID =
  process.env['TWIN_STUDIO_DEV_USER_ID'] ?? '00000000-0000-4000-8000-000000000103';

const WRITE_ROLES = new Set(['OWNER', 'ADMIN', 'DEVELOPER']);

function bearerToken(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? request.cookies.get('access_token')?.value;
}

export async function authenticatedRequestContext(
  request: NextRequest,
  access: RequestAccess,
): Promise<AuthenticatedScope> {
  if (process.env['NODE_ENV'] !== 'production' && process.env['TWIN_STUDIO_DEV_AUTH'] !== 'disabled') {
    return {
      tenantId: DEV_TENANT_ID,
      workspaceId: request.headers.get('x-workspace-id') ?? DEV_WORKSPACE_ID,
      userId: DEV_USER_ID,
    };
  }

  const token = bearerToken(request);
  if (!token) throw new Error('UNAUTHENTICATED');
  const workspaceId = request.headers.get('x-workspace-id');
  if (!workspaceId) throw new Error('WORKSPACE_REQUIRED');

  const session = await prisma.session.findFirst({
    where: { token, expiresAt: { gt: new Date() } },
    select: { userId: true },
  });
  if (!session) throw new Error('UNAUTHENTICATED');
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      tenant: { members: { some: { userId: session.userId } } },
    },
    select: {
      id: true,
      tenantId: true,
      tenant: {
        select: {
          members: {
            where: { userId: session.userId },
            select: { role: { select: { name: true } } },
            take: 1,
          },
        },
      },
    },
  });
  if (!workspace) throw new Error('FORBIDDEN');
  const role = workspace.tenant.members[0]?.role.name.toUpperCase() ?? '';
  if (access === 'WRITE' && !WRITE_ROLES.has(role)) throw new Error('FORBIDDEN');
  return { tenantId: workspace.tenantId, workspaceId: workspace.id, userId: session.userId };
}
