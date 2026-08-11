import { hashAgentDefinition, validateForPublication } from '@cerebro/agent-registry-contracts';
import type { AgentDefinitionV1 } from '@cerebro/agent-registry-contracts';
import type { AgentRepository } from '@cerebro/db';
import { Result } from '../dto/Result';
import { AgentRegistryActorContext, AgentRegistryError, normalizeAgentRegistryError, requireAgentCapability } from './AgentRegistryErrors';

export type AgentModelResolver = (definition: AgentDefinitionV1, context: AgentRegistryActorContext) => Promise<string>;

export class AgentPublicationService {
  constructor(private readonly repository: AgentRepository, private readonly resolveModel: AgentModelResolver) {}

  async publish(agentId: string, command: { expectedDraftRevision: number }, context: AgentRegistryActorContext): Promise<Result<any>> {
    const denied = requireAgentCapability(context, 'agent.version.publish');
    if (denied) return Result.fail(denied);
    try {
      const agent = await this.repository.getRegistryAgent(agentId, { context });
      if (!agent?.draft) return Result.fail(new AgentRegistryError('AGENT_NOT_FOUND', 'Agent draft not found'));
      if (agent.lifecycleStatus === 'PRODUCTION' || agent.lifecycleStatus === 'SUSPENDED') {
        return Result.fail(new AgentRegistryError('AGENT_LIFECYCLE_CONFLICT', 'Suspend and return the agent to a governed editing state before publishing'));
      }
      const validated = validateForPublication(agent.draft.definition);
      if (!validated.success) {
        return Result.fail(new AgentRegistryError('AGENT_DEFINITION_INVALID', 'Agent definition is not publishable', { errors: validated.errors }));
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
      }, { context });
      return Result.ok({ ...published, lifecycle: nextLifecycleStatus });
    } catch (error) { return Result.fail(normalizeAgentRegistryError(error)); }
  }
}
