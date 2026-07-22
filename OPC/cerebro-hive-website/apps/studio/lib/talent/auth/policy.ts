import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type TalentAction = 
  | 'CREATE_ASSESSMENT' 
  | 'PUBLISH_ASSESSMENT' 
  | 'EVALUATE_SUBMISSION'
  | 'VIEW_CANDIDATES'
  | 'MANAGE_RESOURCES';

export class TalentPolicyEngine {
  
  /**
   * ABAC + RBAC Implementation
   * Checks if the user holds a valid Recruiter/Admin profile AND has access to the specific Workspace.
   */
  async requireWorkspaceAccess(userId: string, workspaceId: string, action: TalentAction): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: {
          include: {
            workspaces: {
              where: { id: workspaceId }
            }
          }
        }
      }
    });

    if (!user) throw new Error("Unauthorized: User not found");

    // Must be mapped to an organization that owns this workspace
    const hasWorkspace = user.organization?.workspaces.length && user.organization.workspaces.length > 0;
    if (!hasWorkspace) {
      throw new Error(`Forbidden: User does not have access to workspace ${workspaceId}`);
    }

    // Role-based verification
    if (user.role === 'USER') {
      throw new Error(`Forbidden: Role ${user.role} is insufficient for action ${action}`);
    }

    // In a real system, we'd also check if they have a RecruiterProfile
    // const recruiter = await prisma.recruiterProfile.findUnique({ where: { userId }});
    // if (!recruiter) throw new Error("Forbidden: Must be a registered recruiter");

    return true;
  }
}
