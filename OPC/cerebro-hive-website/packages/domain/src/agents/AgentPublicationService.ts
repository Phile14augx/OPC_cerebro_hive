import { hashAgentDefinition, validateForPublication } from '@cerebro/agent-registry-contracts';
import type { AgentDefinitionV1 } from '@cerebro/agent-registry-contracts';
import type { AgentRepository } from '@cerebro/db';
import { createHash } from 'node:crypto';
import { Result } from '../dto/Result';
import { AgentRegistryActorContext, AgentRegistryError, normalizeAgentRegistryError, requireAgentCapability } from './AgentRegistryErrors';

export type AgentModelResolver = (definition: AgentDefinitionV1, context: AgentRegistryActorContext) => Promise<string>;

export class AgentPublicationService {
  constructor(private readonly repository: AgentRepository, private readonly resolveModel: AgentModelResolver) {}

  async publish(agentId: string, command: { expectedDraftRevision: number; idempotencyKey: string }, context: AgentRegistryActorContext): Promise<Result<any>> {
    const denied = requireAgentCapability(context, 'agent.version.publish');
    if (denied) return Result.fail(denied);
    const idempotencyKey = command.idempotencyKey?.trim();
    if (!idempotencyKey) {
      return Result.fail(new AgentRegistryError('AGENT_IDEMPOTENCY_KEY_REQUIRED', 'An Idempotency-Key header is required for publication'));
    }
    try {
      const idempotencyKeyHash = createHash('sha256')
        .update(`agent.version.publish:${context.workspaceId}:${agentId}:${idempotencyKey}`)
        .digest('hex');
      const idempotencyFingerprint = createHash('sha256')
        .update(JSON.stringify(['agent.version.publish', context.tenantId, context.workspaceId, agentId, command.expectedDraftRevision, context.userId ?? null]))
        .digest('hex');
      const prepared = await this.repository.preparePublication(agentId, {
        expectedDraftRevision: command.expectedDraftRevision,
        idempotencyKeyHash,
        idempotencyFingerprint,
      }, { context });
      const agent = prepared.agent;
      if (!agent.draft) return Result.fail(new AgentRegistryError('AGENT_NOT_FOUND', 'Agent draft not found'));
      if (prepared.replay) {
        return Result.ok({ version: prepared.replay.version });
      }
      if (agent.draft.revision !== command.expectedDraftRevision) {
        return Result.fail(new AgentRegistryError('AGENT_DRAFT_REVISION_CONFLICT', 'The agent draft changed before publication', { currentRevision: agent.draft.revision }));
      }
      if (agent.draft.baseVersionId !== agent.activeVersionId) {
        return Result.fail(new AgentRegistryError('AGENT_DRAFT_BASE_VERSION_CONFLICT', 'The active version changed before publication', { baseVersionId: agent.draft.baseVersionId, activeVersionId: agent.activeVersionId }));
      }
      if (agent.lifecycleStatus === 'PRODUCTION' || agent.lifecycleStatus === 'SUSPENDED') {
        return Result.fail(new AgentRegistryError('AGENT_LIFECYCLE_CONFLICT', 'Suspend and return the agent to a governed editing state before publishing'));
      }
      const validated = validateForPublication(agent.draft.definition);
      if (!validated.success) {
        const invalidDraft = await this.repository.updateDraft(agentId, {
          expectedRevision: command.expectedDraftRevision,
          definition: agent.draft.definition as any,
          updatedBy: context.userId ?? null,
          validationStatus: 'INVALID',
          validationErrors: validated.errors,
        }, { context });
        return Result.fail(new AgentRegistryError('AGENT_DEFINITION_INVALID', 'Agent definition is not publishable', { errors: validated.errors, currentRevision: invalidDraft.revision }));
      }
      const modelId = await this.resolveModel(validated.definition, context);
      const nextLifecycleStatus = agent.lifecycleStatus === 'CERTIFIED' ? 'SANDBOX' : (agent.lifecycleStatus ?? 'DRAFT');
      const published = await this.repository.publishDraftTransaction(agentId, {
        expectedDraftRevision: command.expectedDraftRevision,
        definition: validated.definition,
        definitionHash: hashAgentDefinition(validated.definition),
        modelId,
        actorId: context.userId ?? null,
        nextLifecycleStatus,
        idempotencyKeyHash,
        idempotencyFingerprint,
        auditMetadata: { idempotencyRef: idempotencyKeyHash.slice(0, 12) },
      }, { context });
      return Result.ok({ version: published.version });
    } catch (error) { return Result.fail(normalizeAgentRegistryError(error)); }
  }
}
