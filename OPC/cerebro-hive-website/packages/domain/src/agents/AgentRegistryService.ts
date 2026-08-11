import { createInitialAgentDraft } from '@cerebro/agent-registry-contracts';
import type { AgentRepository } from '@cerebro/db';
import { Result } from '../dto/Result';
import { AgentRegistryActorContext, normalizeAgentRegistryError, requireAgentCapability } from './AgentRegistryErrors';

export class AgentRegistryService {
  constructor(private readonly repository: AgentRepository) {}

  async list(context: AgentRegistryActorContext): Promise<Result<unknown>> {
    const denied = requireAgentCapability(context, 'agent.read');
    if (denied) return Result.fail(denied);
    try { return Result.ok(await this.repository.listRegistryAgents({ context })); }
    catch (error) { return Result.fail(normalizeAgentRegistryError(error)); }
  }

  async get(agentId: string, context: AgentRegistryActorContext): Promise<Result<unknown>> {
    const denied = requireAgentCapability(context, 'agent.read');
    if (denied) return Result.fail(denied);
    try {
      const agent = await this.repository.getRegistryAgent(agentId, { context });
      if (!agent) return Result.fail(normalizeAgentRegistryError({ code: 'AGENT_NOT_FOUND' }));
      const draft = agent.draft ? (() => {
        const { definition: _definition, ...metadata } = agent.draft;
        return metadata;
      })() : null;
      return Result.ok({ ...agent, draft });
    } catch (error) { return Result.fail(normalizeAgentRegistryError(error)); }
  }

  async create(input: { name: string; description?: string; avatarUrl?: string; modelId?: string; instructions?: string }, context: AgentRegistryActorContext): Promise<Result<unknown>> {
    const denied = requireAgentCapability(context, 'agent.create');
    if (denied) return Result.fail(denied);
    try {
      const definition = createInitialAgentDraft();
      if (input.instructions) definition.systemInstructions = input.instructions;
      if (input.modelId) definition.modelConfig = { ...definition.modelConfig, providerRef: 'provider:legacy', modelRef: `model:${input.modelId}` };
      return Result.ok(await this.repository.createRegistryAgent({
        name: input.name, description: input.description, avatarUrl: input.avatarUrl,
        ownerId: context.userId ?? null, definition,
      }, { context }));
    } catch (error) { return Result.fail(normalizeAgentRegistryError(error)); }
  }

  async listVersions(agentId: string, context: AgentRegistryActorContext): Promise<Result<unknown>> {
    const denied = requireAgentCapability(context, 'agent.read');
    if (denied) return Result.fail(denied);
    try { return Result.ok(await this.repository.listVersions(agentId, { context })); }
    catch (error) { return Result.fail(normalizeAgentRegistryError(error)); }
  }

  async getVersion(agentId: string, versionId: string, context: AgentRegistryActorContext): Promise<Result<unknown>> {
    const denied = requireAgentCapability(context, 'agent.read');
    if (denied) return Result.fail(denied);
    try {
      const version = await this.repository.getVersion(agentId, versionId, { context });
      return version ? Result.ok(version) : Result.fail(normalizeAgentRegistryError({ code: 'AGENT_NOT_FOUND' }));
    } catch (error) { return Result.fail(normalizeAgentRegistryError(error)); }
  }
}
