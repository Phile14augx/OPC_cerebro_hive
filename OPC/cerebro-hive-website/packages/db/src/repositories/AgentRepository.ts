import type { AgentDefinitionV1, AgentDraftDocumentV1, DefinitionValidationError } from '@cerebro/agent-registry-contracts';
import { Agent, AgentVersion, Prisma } from '../generated/client';
import { BaseRepository, IRepositoryOptions, PrismaTransactionClient } from './BaseRepository';

export interface CreateAgentInput {
  name: string;
  description?: string;
  avatarUrl?: string;
  modelId: string;
  instructions: string;
}

export class AgentRegistryRepositoryError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = 'AgentRegistryRepositoryError';
    Object.assign(this, details);
  }
}

export interface UpdateAgentDraftInput {
  expectedRevision: number;
  definition: AgentDraftDocumentV1;
  updatedBy: string | null;
  validationStatus?: 'UNVALIDATED' | 'VALID' | 'INVALID';
  validationErrors?: DefinitionValidationError[];
}

export interface PublishAgentDraftPersistenceInput {
  expectedDraftRevision: number;
  definition: AgentDefinitionV1;
  definitionHash: string;
  modelId: string;
  actorId: string | null;
  nextLifecycleStatus: 'DRAFT' | 'SANDBOX' | 'CERTIFIED';
  idempotencyKeyHash: string;
  idempotencyFingerprint: string;
  auditMetadata?: Record<string, unknown>;
}

export class AgentRepository extends BaseRepository {
  async createRegistryAgent(
    input: { name: string; description?: string; ownerId?: string | null; definition: AgentDraftDocumentV1 },
    options: IRepositoryOptions,
  ) {
    const db = this.getClient(options);
    const { workspaceId } = this.workspaceFilter(options.context);
    const actorId = options.context.userId ?? null;

    return db.agent.create({
      data: {
        workspaceId,
        name: input.name,
        description: input.description,
        lifecycleStatus: 'DRAFT',
        ownerId: input.ownerId ?? actorId,
        createdBy: actorId,
        draft: {
          create: {
            workspaceId,
            definition: input.definition as Prisma.InputJsonValue,
            revision: 1,
            validationStatus: 'UNVALIDATED',
            createdBy: actorId,
            updatedBy: actorId,
          },
        },
      },
      include: { activeVersion: true, draft: true },
    });
  }

  async listRegistryAgents(options: IRepositoryOptions) {
    const db = this.getClient(options);
    const { workspaceId } = this.workspaceFilter(options.context);
    return db.agent.findMany({
      where: { workspaceId },
      orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
      include: {
        activeVersion: true,
        draft: {
          select: {
            id: true,
            agentId: true,
            baseVersionId: true,
            revision: true,
            validationStatus: true,
            validationErrors: true,
            updatedBy: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async getRegistryAgent(agentId: string, options: IRepositoryOptions) {
    const db = this.getClient(options);
    const { workspaceId } = this.workspaceFilter(options.context);
    return db.agent.findFirst({
      where: { id: agentId, workspaceId },
      include: { activeVersion: true, draft: true },
    });
  }

  async getDraft(agentId: string, options: IRepositoryOptions) {
    const db = this.getClient(options);
    const { workspaceId } = this.workspaceFilter(options.context);
    return db.agentDraft.findFirst({ where: { agentId, workspaceId } });
  }

  async updateDraft(agentId: string, input: UpdateAgentDraftInput, options: IRepositoryOptions) {
    const db = this.getClient(options);
    const { workspaceId } = this.workspaceFilter(options.context);
    const update = await db.agentDraft.updateMany({
      where: { agentId, workspaceId, revision: input.expectedRevision },
      data: {
        definition: input.definition as Prisma.InputJsonValue,
        revision: { increment: 1 },
        validationStatus: input.validationStatus ?? 'UNVALIDATED',
        validationErrors: input.validationErrors?.length
          ? input.validationErrors as unknown as Prisma.InputJsonValue
          : Prisma.DbNull,
        updatedBy: input.updatedBy,
      },
    });

    if (update.count === 0) {
      const current = await db.agentDraft.findFirst({
        where: { agentId, workspaceId },
        select: { revision: true, updatedBy: true, updatedAt: true },
      });
      if (!current) throw new AgentRegistryRepositoryError('AGENT_NOT_FOUND', 'Agent draft not found');
      throw new AgentRegistryRepositoryError(
        'AGENT_DRAFT_REVISION_CONFLICT',
        'The agent draft was changed by another editor',
        { currentRevision: current.revision, updatedBy: current.updatedBy, updatedAt: current.updatedAt },
      );
    }

    return db.agentDraft.findFirstOrThrow({ where: { agentId, workspaceId } });
  }

  async listVersions(agentId: string, options: IRepositoryOptions) {
    const db = this.getClient(options);
    const { workspaceId } = this.workspaceFilter(options.context);
    return db.agentVersion.findMany({
      where: { agentId, agent: { workspaceId } },
      orderBy: { version: 'desc' },
    });
  }

  async getVersion(agentId: string, versionId: string, options: IRepositoryOptions) {
    const db = this.getClient(options);
    const { workspaceId } = this.workspaceFilter(options.context);
    return db.agentVersion.findFirst({ where: { id: versionId, agentId, agent: { workspaceId } } });
  }

  async preparePublication(
    agentId: string,
    input: { expectedDraftRevision: number; idempotencyKeyHash: string; idempotencyFingerprint: string },
    options: IRepositoryOptions,
  ) {
    const db = this.getClient(options);
    const { workspaceId } = this.workspaceFilter(options.context);
    const agent = await db.agent.findFirst({ where: { id: agentId, workspaceId }, include: { draft: true } });
    if (!agent?.draft) throw new AgentRegistryRepositoryError('AGENT_NOT_FOUND', 'Agent draft not found');

    const idempotency = await db.idempotencyRecord.findUnique({
      where: { tenantId_requestHash: { tenantId: options.context.tenantId, requestHash: input.idempotencyKeyHash } },
    });
    if (!idempotency) return { agent, replay: null };
    if (idempotency.operation !== 'agent.version.publish' || idempotency.responseHash !== input.idempotencyFingerprint) {
      throw new AgentRegistryRepositoryError('AGENT_IDEMPOTENCY_CONFLICT', 'The idempotency key was already used for a different publication request');
    }
    if (idempotency.status !== 'completed') return { agent, replay: null };

    const version = await db.agentVersion.findFirst({
      where: { agentId, sourceDraftId: agent.draft.id, sourceDraftRevision: input.expectedDraftRevision },
    });
    if (!version) throw new AgentRegistryRepositoryError('AGENT_IDEMPOTENCY_CONFLICT', 'The completed publication result could not be reconstructed');
    return { agent, replay: { agent, version, draft: agent.draft, replayed: true } };
  }

  private async inTransaction<T>(
    options: IRepositoryOptions,
    work: (tx: PrismaTransactionClient) => Promise<T>,
  ): Promise<T> {
    if (options.tx) return work(options.tx);
    return this.prisma.$transaction(work, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  async publishDraftTransaction(
    agentId: string,
    input: PublishAgentDraftPersistenceInput,
    options: IRepositoryOptions,
  ) {
    const { workspaceId } = this.workspaceFilter(options.context);
    return this.inTransaction(options, async tx => {
      const lock = (tx as unknown as { $queryRawUnsafe?: (...args: unknown[]) => Promise<unknown> }).$queryRawUnsafe;
      if (lock) {
        await lock.call(tx, 'SELECT id FROM "Agent" WHERE id = $1::uuid AND "workspaceId" = $2::uuid FOR UPDATE', agentId, workspaceId);
      }

      const agent = await tx.agent.findFirst({
        where: { id: agentId, workspaceId },
        include: { draft: true },
      });
      if (!agent?.draft) throw new AgentRegistryRepositoryError('AGENT_NOT_FOUND', 'Agent draft not found');

      const idempotency = await tx.idempotencyRecord.findUnique({
        where: {
          tenantId_requestHash: {
            tenantId: options.context.tenantId,
            requestHash: input.idempotencyKeyHash,
          },
        },
      });
      if (idempotency) {
        if (idempotency.operation !== 'agent.version.publish' || idempotency.responseHash !== input.idempotencyFingerprint) {
          throw new AgentRegistryRepositoryError('AGENT_IDEMPOTENCY_CONFLICT', 'The idempotency key was already used for a different publication request');
        }
        if (idempotency.status === 'completed') {
          const replayedVersion = await tx.agentVersion.findFirst({
            where: { agentId, sourceDraftId: agent.draft.id, sourceDraftRevision: input.expectedDraftRevision },
          });
          if (!replayedVersion) {
            throw new AgentRegistryRepositoryError('AGENT_IDEMPOTENCY_CONFLICT', 'The completed publication result could not be reconstructed');
          }
          return { agent, version: replayedVersion, draft: agent.draft, replayed: true };
        }
        throw new AgentRegistryRepositoryError('AGENT_IDEMPOTENCY_CONFLICT', 'The publication request is already in progress');
      }

      if (agent.draft.revision !== input.expectedDraftRevision) {
        throw new AgentRegistryRepositoryError(
          'AGENT_DRAFT_REVISION_CONFLICT',
          'The agent draft was changed before publication',
          { currentRevision: agent.draft.revision },
        );
      }
      if (agent.draft.baseVersionId !== agent.activeVersionId) {
        throw new AgentRegistryRepositoryError(
          'AGENT_DRAFT_BASE_VERSION_CONFLICT',
          'The active version changed before publication',
          { baseVersionId: agent.draft.baseVersionId, activeVersionId: agent.activeVersionId },
        );
      }

      await tx.idempotencyRecord.create({
        data: {
          tenantId: options.context.tenantId,
          workspaceId,
          operation: 'agent.version.publish',
          requestHash: input.idempotencyKeyHash,
          responseHash: input.idempotencyFingerprint,
          status: 'pending',
        },
      });

      const latest = await tx.agentVersion.findFirst({
        where: { agentId },
        select: { version: true },
        orderBy: { version: 'desc' },
      });
      const now = new Date();
      const version = await tx.agentVersion.create({
        data: {
          agentId,
          workspaceId,
          version: (latest?.version ?? 0) + 1,
          definition: input.definition as Prisma.InputJsonValue,
          definitionSchemaVersion: 1,
          definitionHash: input.definitionHash,
          publishedBy: input.actorId,
          publishedAt: now,
          publicationSource: 'USER',
          sourceDraftId: agent.draft.id,
          sourceDraftRevision: agent.draft.revision,
          modelId: input.modelId,
          instructions: input.definition.systemInstructions,
          config: input.definition.modelConfig as Prisma.InputJsonValue,
        },
      });

      await tx.agent.update({
        where: { id: agentId },
        data: {
          activeVersionId: version.id,
          lifecycleStatus: input.nextLifecycleStatus,
          statusChangedAt: agent.lifecycleStatus === input.nextLifecycleStatus ? undefined : now,
          statusChangedBy: agent.lifecycleStatus === input.nextLifecycleStatus ? undefined : input.actorId,
        },
      });
      await tx.auditLog.create({
        data: {
          workspaceId,
          userId: input.actorId,
          action: 'agent.version.published',
          resource: 'Agent',
          resourceId: agentId,
          metadata: {
            versionId: version.id,
            version: version.version,
            definitionHash: input.definitionHash,
            sourceDraftId: agent.draft.id,
            sourceDraftRevision: agent.draft.revision,
            ...input.auditMetadata,
          } as Prisma.InputJsonValue,
        },
      });
      await tx.outboxEvent.create({
        data: {
          aggregateId: agentId,
          aggregateType: 'Agent',
          eventType: 'agent.version.published',
          tenantId: options.context.tenantId,
          traceId: options.context.traceId,
          correlationId: options.context.correlationId,
          partitionKey: workspaceId,
          payload: {
            workspaceId,
            agentId,
            versionId: version.id,
            version: version.version,
            definitionHash: input.definitionHash,
          } as Prisma.InputJsonValue,
        },
      });
      const rebased = await tx.agentDraft.updateMany({
        where: { id: agent.draft.id, workspaceId, revision: input.expectedDraftRevision },
        data: {
          baseVersionId: version.id,
          definition: version.definition as Prisma.InputJsonValue,
          revision: { increment: 1 },
          validationStatus: 'VALID',
          validationErrors: Prisma.DbNull,
          updatedBy: input.actorId,
        },
      });
      if (rebased.count !== 1) {
        throw new AgentRegistryRepositoryError('AGENT_DRAFT_REVISION_CONFLICT', 'Draft changed during publication');
      }
      await tx.idempotencyRecord.update({
        where: {
          tenantId_requestHash: {
            tenantId: options.context.tenantId,
            requestHash: input.idempotencyKeyHash,
          },
        },
        data: { status: 'completed' },
      });
      const draft = await tx.agentDraft.findUniqueOrThrow({ where: { id: agent.draft.id } });
      return { agent: { ...agent, activeVersionId: version.id, lifecycleStatus: input.nextLifecycleStatus }, version, draft, replayed: false };
    });
  }

  async transitionLifecycle(
    agentId: string,
    input: { from: 'DRAFT' | 'SANDBOX' | 'CERTIFIED' | 'PRODUCTION' | 'SUSPENDED'; to: 'DRAFT' | 'SANDBOX' | 'CERTIFIED' | 'PRODUCTION' | 'SUSPENDED'; actorId: string | null },
    options: IRepositoryOptions,
  ) {
    const { workspaceId } = this.workspaceFilter(options.context);
    return this.inTransaction(options, async tx => {
      const changedAt = new Date();
      const result = await tx.agent.updateMany({
        where: { id: agentId, workspaceId, lifecycleStatus: input.from },
        data: { lifecycleStatus: input.to, statusChangedAt: changedAt, statusChangedBy: input.actorId },
      });
      if (result.count !== 1) {
        const agent = await tx.agent.findFirst({ where: { id: agentId, workspaceId }, select: { lifecycleStatus: true } });
        if (!agent) throw new AgentRegistryRepositoryError('AGENT_NOT_FOUND', 'Agent not found');
        throw new AgentRegistryRepositoryError('AGENT_LIFECYCLE_CONFLICT', 'Agent lifecycle changed', { currentStatus: agent.lifecycleStatus });
      }
      await tx.auditLog.create({
        data: {
          workspaceId,
          userId: input.actorId,
          action: 'agent.lifecycle.transitioned',
          resource: 'Agent',
          resourceId: agentId,
          metadata: { from: input.from, to: input.to, changedAt: changedAt.toISOString() },
        },
      });
      await tx.outboxEvent.create({
        data: {
          aggregateId: agentId,
          aggregateType: 'Agent',
          eventType: 'agent.lifecycle.transitioned',
          tenantId: options.context.tenantId,
          traceId: options.context.traceId,
          correlationId: options.context.correlationId,
          partitionKey: workspaceId,
          payload: { workspaceId, agentId, from: input.from, to: input.to, changedAt: changedAt.toISOString() },
        },
      });
      return tx.agent.findFirstOrThrow({ where: { id: agentId, workspaceId }, include: { activeVersion: true, draft: true } });
    });
  }

  async getActiveVersion(agentId: string, options: IRepositoryOptions & { allowLegacyFallback?: boolean }) {
    const db = this.getClient(options);
    const { workspaceId } = this.workspaceFilter(options.context);
    const agent = await db.agent.findFirst({ where: { id: agentId, workspaceId }, include: { activeVersion: true } });
    if (!agent) return null;
    if (agent.activeVersion) return { agent, version: agent.activeVersion, fallbackUsed: false };
    if (!options.allowLegacyFallback) return { agent, version: null, fallbackUsed: false };
    const version = await db.agentVersion.findFirst({ where: { agentId }, orderBy: { version: 'desc' } });
    return { agent, version, fallbackUsed: Boolean(version) };
  }

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
