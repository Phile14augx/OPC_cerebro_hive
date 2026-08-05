import { Workflow, WorkflowVersion } from '@prisma/client';
import { BaseRepository, IRepositoryOptions } from './BaseRepository';

export interface CreateWorkflowInput {
  name: string;
  templateId?: string;
}

export class WorkflowRepository extends BaseRepository {
  async createWorkflow(input: CreateWorkflowInput, options: IRepositoryOptions): Promise<{ workflow: Workflow; initialVersion: WorkflowVersion }> {
    const db = this.getClient(options);
    const { workspaceId } = this.workspaceFilter(options.context);

    const workflow = await db.workflow.create({
      data: {
        workspaceId,
        name: input.name,
        templateId: input.templateId,
        versions: {
          create: {
            version: 1,
          }
        }
      },
      include: {
        versions: true
      }
    });

    return { workflow, initialVersion: workflow.versions[0] };
  }

  async publishVersion(workflowId: string, input: { nodes: any[]; edges: any[] }, options: IRepositoryOptions): Promise<WorkflowVersion> {
    const db = this.getClient(options);
    const { workspaceId } = this.workspaceFilter(options.context);

    // Verify ownership
    const workflow = await db.workflow.findFirst({
      where: { id: workflowId, workspaceId }
    });
    if (!workflow) throw new Error('Workflow not found or unauthorized');

    const latest = await db.workflowVersion.findFirst({
      where: { workflowId },
      orderBy: { version: 'desc' }
    });
    const nextVersion = (latest?.version ?? 0) + 1;

    return db.workflowVersion.create({
      data: {
        workflowId,
        version: nextVersion,
        // Detailed node/edge creation is typically handled via a Unit of Work 
        // to map logical IDs to database UUIDs.
      }
    });
  }

  async getLatestVersion(workflowId: string, options: IRepositoryOptions): Promise<WorkflowVersion | null> {
    const db = this.getClient(options);
    const { workspaceId } = this.workspaceFilter(options.context);

    const workflow = await db.workflow.findFirst({
      where: { id: workflowId, workspaceId }
    });
    if (!workflow) return null;

    return db.workflowVersion.findFirst({
      where: { workflowId },
      orderBy: { version: 'desc' },
      include: { nodes: true, edges: true }
    });
  }
}
