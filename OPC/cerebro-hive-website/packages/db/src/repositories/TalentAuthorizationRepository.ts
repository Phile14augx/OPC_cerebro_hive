import type { PrismaClient } from '../generated/client';

export interface TalentAuthorizationClient {
  workspace: {
    findUnique(args: {
      where: { id: string };
      select: { id: true; tenantId: true };
    }): Promise<{ id: string; tenantId: string } | null>;
  };
  project: {
    findFirst(args: {
      where: { id: string; workspaceId: string };
      select: {
        id: true;
        workspaceId: true;
        workspace: { select: { tenantId: true } };
      };
    }): Promise<{
      id: string;
      workspaceId: string;
      workspace: { tenantId: string };
    } | null>;
  };
  assessmentVersion: {
    findFirst(args: {
      where: { id: string; assessment: { workspaceId: string } };
      select: {
        id: true;
        assessment: {
          select: {
            workspaceId: true;
            workspace: { select: { tenantId: true } };
          };
        };
      };
    }): Promise<{
      id: string;
      assessment: { workspaceId: string; workspace: { tenantId: string } };
    } | null>;
  };
  assessmentSession: {
    findFirst(args: {
      where: {
        id: string;
        assessmentVersion: { assessment: { workspaceId: string } };
      };
      select: {
        id: true;
        candidate: { select: { userId: true } };
        assessmentVersion: {
          select: {
            assessment: {
              select: {
                workspaceId: true;
                workspace: { select: { tenantId: true } };
              };
            };
          };
        };
      };
    }): Promise<{
      id: string;
      candidate: { userId: string };
      assessmentVersion: {
        assessment: { workspaceId: string; workspace: { tenantId: string } };
      };
    } | null>;
  };
}

export type TalentResourceType =
  | 'workspace'
  | 'project'
  | 'assessment_version'
  | 'session';

export interface TalentAuthorizationTarget {
  resourceType: TalentResourceType;
  resourceId: string;
  workspaceId: string;
  tenantId: string;
  ownerUserId: string | null;
}

export class TalentAuthorizationRepository {
  constructor(private readonly client: TalentAuthorizationClient) {}

  static fromPrisma(client: PrismaClient): TalentAuthorizationRepository {
    return new TalentAuthorizationRepository(client);
  }

  async resolveWorkspaceTarget(
    workspaceId: string,
  ): Promise<TalentAuthorizationTarget | null> {
    const workspace = await this.client.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, tenantId: true },
    });

    if (!workspace) {
      return null;
    }

    return {
      resourceType: 'workspace',
      resourceId: workspace.id,
      workspaceId: workspace.id,
      tenantId: workspace.tenantId,
      ownerUserId: null,
    };
  }

  async resolveProjectTarget(
    projectId: string,
    workspaceId: string,
  ): Promise<TalentAuthorizationTarget | null> {
    const project = await this.client.project.findFirst({
      where: { id: projectId, workspaceId },
      select: {
        id: true,
        workspaceId: true,
        workspace: { select: { tenantId: true } },
      },
    });

    if (!project) {
      return null;
    }

    return {
      resourceType: 'project',
      resourceId: project.id,
      workspaceId: project.workspaceId,
      tenantId: project.workspace.tenantId,
      ownerUserId: null,
    };
  }

  async resolveAssessmentVersionTarget(
    assessmentVersionId: string,
    workspaceId: string,
  ): Promise<TalentAuthorizationTarget | null> {
    const assessmentVersion = await this.client.assessmentVersion.findFirst({
      where: { id: assessmentVersionId, assessment: { workspaceId } },
      select: {
        id: true,
        assessment: {
          select: {
            workspaceId: true,
            workspace: { select: { tenantId: true } },
          },
        },
      },
    });

    if (!assessmentVersion) {
      return null;
    }

    return {
      resourceType: 'assessment_version',
      resourceId: assessmentVersion.id,
      workspaceId: assessmentVersion.assessment.workspaceId,
      tenantId: assessmentVersion.assessment.workspace.tenantId,
      ownerUserId: null,
    };
  }

  async resolveSessionTarget(
    sessionId: string,
    workspaceId: string,
  ): Promise<TalentAuthorizationTarget | null> {
    const session = await this.client.assessmentSession.findFirst({
      where: {
        id: sessionId,
        assessmentVersion: { assessment: { workspaceId } },
      },
      select: {
        id: true,
        candidate: { select: { userId: true } },
        assessmentVersion: {
          select: {
            assessment: {
              select: {
                workspaceId: true,
                workspace: { select: { tenantId: true } },
              },
            },
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    return {
      resourceType: 'session',
      resourceId: session.id,
      workspaceId: session.assessmentVersion.assessment.workspaceId,
      tenantId: session.assessmentVersion.assessment.workspace.tenantId,
      ownerUserId: session.candidate.userId,
    };
  }
}
