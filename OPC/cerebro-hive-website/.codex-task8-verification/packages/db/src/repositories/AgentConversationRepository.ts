import { BaseRepository, IRepositoryOptions } from './BaseRepository';

export interface AppendMessageInput {
  role: string;
  content: string;
  toolInvocations?: Record<string, any>;
  metadata?: Record<string, any>;
}

export class AgentConversationRepository extends BaseRepository {
  /**
   * Creates a new conversation for the given agent, scoped to the workspace.
   * Validates agent ownership through the workspace filter.
   */
  async createConversation(
    agentId: string,
    options: IRepositoryOptions
  ) {
    const db = this.getClient(options);
    const { workspaceId } = this.workspaceFilter(options.context);

    // Validate agent belongs to this workspace
    const agent = await db.agent.findFirst({
      where: { id: agentId, workspaceId },
    });
    if (!agent) {
      throw new Error('Agent not found or not accessible in this workspace');
    }

    return db.agentConversation.create({
      data: { agentId },
    });
  }

  /**
   * Appends a message to an existing conversation.
   * Returns the created message record.
   */
  async appendMessage(
    conversationId: string,
    input: AppendMessageInput,
    options: IRepositoryOptions
  ) {
    const db = this.getClient(options);

    return db.agentMessage.create({
      data: {
        conversationId,
        role: input.role,
        content: input.content,
        toolInvocations: input.toolInvocations ?? undefined,
        metadata: input.metadata ?? undefined,
      },
    });
  }

  /**
   * Appends multiple messages in a single batch (for transactional writes
   * of user + assistant + tool messages together).
   */
  async appendMessages(
    conversationId: string,
    inputs: AppendMessageInput[],
    options: IRepositoryOptions
  ) {
    const db = this.getClient(options);

    // createMany doesn't return records on all adapters; use individual
    // creates inside the same transaction (caller wraps in UoW)
    const created = [];
    for (const input of inputs) {
      const msg = await db.agentMessage.create({
        data: {
          conversationId,
          role: input.role,
          content: input.content,
          toolInvocations: input.toolInvocations ?? undefined,
          metadata: input.metadata ?? undefined,
        },
      });
      created.push(msg);
    }
    return created;
  }

  /**
   * Loads a conversation with all messages ordered chronologically.
   * Validates workspace access through the Agent relation.
   */
  async loadWithMessages(
    conversationId: string,
    options: IRepositoryOptions
  ) {
    const db = this.getClient(options);
    const { workspaceId } = this.workspaceFilter(options.context);

    const conversation = await db.agentConversation.findFirst({
      where: {
        id: conversationId,
        agent: { workspaceId },
      },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        agent: { select: { id: true, workspaceId: true } },
      },
    });

    return conversation;
  }

  /**
   * Lists conversations for a given agent, most recent first.
   */
  async listByAgent(
    agentId: string,
    options: IRepositoryOptions,
    pagination: { take?: number; skip?: number } = {}
  ) {
    const db = this.getClient(options);
    const { workspaceId } = this.workspaceFilter(options.context);

    // Verify agent ownership
    const agent = await db.agent.findFirst({
      where: { id: agentId, workspaceId },
    });
    if (!agent) return [];

    return db.agentConversation.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
      take: pagination.take ?? 50,
      skip: pagination.skip ?? 0,
      include: {
        _count: { select: { messages: true } },
      },
    });
  }

  /**
   * Updates the working memory snapshot stored on the conversation.
   */
  async updateMemory(
    conversationId: string,
    memory: Record<string, any>,
    options: IRepositoryOptions
  ) {
    const db = this.getClient(options);

    return db.agentConversation.update({
      where: { id: conversationId },
      data: { memory },
    });
  }
}
