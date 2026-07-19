import { prisma } from '@/lib/prisma';
import { AuditService } from './audit.service';
import { Role } from '@prisma/client';

export class PlatformService {
  /**
   * Initialize a new tenant for a newly registered user.
   * Creates an Organization, a Default Workspace, and assigns the User as OWNER.
   */
  static async initializeTenant(userId: string, userName: string) {
    const slugBase = userName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const orgSlug = `${slugBase}-org-${Date.now().toString().slice(-4)}`;
    
    // Create Organization
    const organization = await prisma.organization.create({
      data: {
        name: `${userName}'s Organization`,
        slug: orgSlug,
      },
    });

    // Create Default Workspace
    const workspace = await prisma.workspace.create({
      data: {
        organizationId: organization.id,
        name: 'General Workspace',
        slug: `${orgSlug}-general`,
      },
    });

    // Create Default Project
    await prisma.project.create({
      data: {
        workspaceId: workspace.id,
        name: 'Default Project',
        description: 'Your first project in CerebroHive.',
      },
    });

    // Assign User to Organization and set Role
    await prisma.user.update({
      where: { id: userId },
      data: {
        organizationId: organization.id,
        role: Role.OWNER,
      },
    });

    await AuditService.log('TENANT_INITIALIZED', `organization:${organization.id}`, userId, {
      workspaceId: workspace.id,
    });

    return { organization, workspace };
  }

  /**
   * Fetch Workspaces for a given organization
   */
  static async getWorkspaces(organizationId: string) {
    return prisma.workspace.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Fetch Projects for a given workspace
   */
  static async getProjects(workspaceId: string) {
    return prisma.project.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
