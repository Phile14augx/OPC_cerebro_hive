import { Agent, AgentVersion, Prisma } from '@prisma/client';
import { BaseRepository, IRepositoryOptions } from './BaseRepository';

export interface CreateAgentInput {
  name: string;
  description?: string;
  avatarUrl?: string;
  modelId: string;
  instructions: string;
}

export class AgentRepository extends BaseRepository {
  async createAgent(input: CreateAgentInput, options: IRepositoryOptions): Promise<{ agent: Agent; initialVersion: AgentVersion }> {
    const db = this.getClient(options);
    const { workspaceId } = this.workspaceFilter(options.context);
    
    const agent = await db.agent.create({
      data: {
        workspaceId,
        name: input.name,
        description: input.description,
        avatarUrl: input.avatarUrl,
        versions: {
          create: {
            version: 1,
            modelId: input.modelId,
            instructions: input.instructions,
          }
        }
      },
      include: {
        versions: true
      }
    });

    return { agent, initialVersion: agent.versions[0] };
  }

  async publishVersion(agentId: string, input: { modelId: string; instructions: string; config?: any }, options: IRepositoryOptions): Promise<AgentVersion> {
    const db = this.getClient(options);
    const { workspaceId } = this.workspaceFilter(options.context);

    // Validate agent ownership
    const agent = await db.agent.findFirst({
      where: { id: agentId, workspaceId }
    });
    if (!agent) throw new Error('Agent not found or unauthorized');

    // Get max version
    const latest = await db.agentVersion.findFirst({
      where: { agentId },
      orderBy: { version: 'desc' }
    });
    const nextVersion = (latest?.version ?? 0) + 1;

    return db.agentVersion.create({
      data: {
        agentId,
        version: nextVersion,
        modelId: input.modelId,
        instructions: input.instructions,
        config: input.config ? (input.config as Prisma.InputJsonValue) : Prisma.JsonNull,
      }
    });
  }

  async getLatestVersion(agentId: string, options: IRepositoryOptions): Promise<AgentVersion | null> {
    const db = this.getClient(options);
    const { workspaceId } = this.workspaceFilter(options.context);

    // Verify workspace ownership
    const agent = await db.agent.findFirst({
      where: { id: agentId, workspaceId }
    });
    if (!agent) return null;

    return db.agentVersion.findFirst({
      where: { agentId },
      orderBy: { version: 'desc' },
      include: { tools: true, prompts: true, capabilities: true }
    });
  }

  async archiveAgent(agentId: string, options: IRepositoryOptions): Promise<void> {
    const db = this.getClient(options);
    const { workspaceId } = this.workspaceFilter(options.context);

    const result = await db.agent.updateMany({
      where: { id: agentId, workspaceId },
      data: { isActive: false }
    });
    
    if (result.count === 0) {
      throw new Error("Agent not found or unauthorized");
    }
  }
}
