import { Workspace } from '@prisma/client';
import { BaseRepository, IRepositoryOptions } from './BaseRepository';

export interface CreateWorkspaceInput {
  name: string;
  slug: string;
}

export class WorkspaceRepository extends BaseRepository {
  async createWorkspace(input: CreateWorkspaceInput, options: IRepositoryOptions): Promise<Workspace> {
    const db = this.getClient(options);
    const { tenantId } = this.tenantFilter(options.context);

    return db.workspace.create({
      data: {
        tenantId,
        name: input.name,
        slug: input.slug,
      },
    });
  }

  async getWorkspaceById(workspaceId: string, options: IRepositoryOptions): Promise<Workspace | null> {
    const db = this.getClient(options);
    const { tenantId } = this.tenantFilter(options.context);

    // Enforce tenant isolation on read
    return db.workspace.findFirst({
      where: {
        id: workspaceId,
        tenantId, 
      },
    });
  }

  async getActiveWorkspaces(options: IRepositoryOptions): Promise<Workspace[]> {
    const db = this.getClient(options);
    const { tenantId } = this.tenantFilter(options.context);

    return db.workspace.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
