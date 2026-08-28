import { prisma } from '@/lib/prisma';

export type TalentAction = 
  | 'CREATE_ASSESSMENT' 
  | 'PUBLISH_ASSESSMENT' 
  | 'EVALUATE_SUBMISSION'
  | 'VIEW_CANDIDATES'
  | 'MANAGE_RESOURCES';

export interface TalentAuthorizationTarget {
  resourceType: string;
  resourceId: string;
  workspaceId: string;
  tenantId: string;
  ownerUserId: string | null;
}

export interface TalentPermissionTuple {
  key: string;
  resource: string;
  action: string;
  serialized: string;
}

export interface TalentAuthorizationContext {
  userId: string;
  tenantId: string;
  workspaceId: string;
  roleId: string;
  roleName: string;
  permissions: readonly string[];
  resourceType: string;
  resourceId: string;
}

export class TalentPolicyEngine {
  async authorize(
    userId: string | undefined, 
    target: TalentAuthorizationTarget | undefined, 
    permission: TalentPermissionTuple
  ): Promise<TalentAuthorizationContext | null> {
    if (!userId || !target || !target.tenantId || !target.workspaceId) {
      return null;
    }

    // Enforce candidate/session ABAC
    if (target.ownerUserId && target.ownerUserId !== userId) {
      return null;
    }

    const tenantMemberModel = (prisma as unknown as Record<string, unknown>).tenantMember as { 
      findFirst: (args: unknown) => Promise<{
        tenantId: string;
        role: {
          id: string;
          name: string;
          permissions: { resource: string; action: string }[];
        }
      } | null> 
    };
    const member = await tenantMemberModel.findFirst({
      where: {
        userId: userId,
        tenantId: target.tenantId,
        role: {
          permissions: {
            some: {
              resource: permission.resource,
              action: permission.action,
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

    if (!member) {
      return null;
    }

    const serializedPermissions = member.role.permissions.map(
      (p: { resource: string; action: string }) => `${p.resource}:${p.action}`
    );

    return {
      userId,
      tenantId: member.tenantId,
      workspaceId: target.workspaceId,
      roleId: member.role.id,
      roleName: member.role.name,
      permissions: Object.freeze(serializedPermissions),
      resourceType: target.resourceType,
      resourceId: target.resourceId,
    };
  }
}
