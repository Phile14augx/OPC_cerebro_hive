import { randomUUID } from 'node:crypto';
import type { Prisma } from '@cerebro/db';
import { prisma } from '@/lib/prisma';
import { AuditService } from './audit.service';

const OWNER_ROLE_KEY = 'OWNER';

function collisionResistantSlug(value: string): string {
  const base = value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);

  return `${base || 'tenant'}-${randomUUID()}`;
}

export class PlatformService {
  /** Provision the initial tenant graph with the caller's active transaction client. */
  static async provisionInitialTenant(
    tx: Prisma.TransactionClient,
    userId: string,
    userName: string
  ) {
    const tenantSlug = collisionResistantSlug(userName);
    const tenant = await tx.tenant.create({
      data: {
        name: `${userName}'s Organization`,
        slug: tenantSlug,
      },
      select: { id: true },
    });

    const ownerRole = await tx.role.findUnique({
      where: { key: OWNER_ROLE_KEY },
      select: { id: true },
    });
    if (!ownerRole) {
      throw new Error('The canonical OWNER role is not configured.');
    }

    await tx.tenantMember.create({
      data: {
        tenantId: tenant.id,
        userId,
        roleId: ownerRole.id,
      },
    });

    const workspace = await tx.workspace.create({
      data: {
        tenantId: tenant.id,
        name: 'General Workspace',
        slug: `${tenantSlug}-general`,
        isDefault: true,
      },
      select: { id: true },
    });

    const project = await tx.project.create({
      data: {
        workspaceId: workspace.id,
        name: 'Default Project',
        description: 'Your first project in CerebroHive.',
      },
      select: { id: true },
    });

    await AuditService.write(
      {
        workspaceId: workspace.id,
        userId,
        action: 'identity:register',
        resource: 'tenant',
        resourceId: tenant.id,
      },
      tx
    );

    return {
      tenantId: tenant.id,
      workspaceId: workspace.id,
      projectId: project.id,
    };
  }

  static async getWorkspaces(userId: string) {
    return prisma.workspace.findMany({
      where: {
        tenant: {
          members: {
            some: { userId },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getProjects(userId: string, workspaceId: string) {
    return prisma.project.findMany({
      where: {
        workspaceId,
        workspace: {
          tenant: {
            members: {
              some: { userId },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
