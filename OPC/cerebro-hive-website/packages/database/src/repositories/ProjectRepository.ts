import { Project } from '@prisma/client';
import { BaseRepository, IRepositoryOptions } from './BaseRepository';

export class ProjectRepository extends BaseRepository {
  async createProject(name: string, description: string, options: IRepositoryOptions): Promise<Project> {
    const db = this.getClient(options);
    const { workspaceId } = this.workspaceFilter(options.context);

    return db.project.create({
      data: {
        workspaceId,
        name,
        description,
      }
    });
  }

  async listProjects(options: IRepositoryOptions): Promise<Project[]> {
    const db = this.getClient(options);
    const { workspaceId } = this.workspaceFilter(options.context);

    return db.project.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
