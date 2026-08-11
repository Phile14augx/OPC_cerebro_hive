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
      return agent ? Result.ok(agent) : Result.fail(normalizeAgentRegistryError({ code: 'AGENT_NOT_FOUND' }));
    } catch (error) { return Result.fail(normalizeAgentRegistryError(error)); }
  }

  async create(input: { name: string; description?: string }, context: AgentRegistryActorContext): Promise<Result<unknown>> {
    const denied = requireAgentCapability(context, 'agent.create');
    if (denied) return Result.fail(denied);
    try {
      return Result.ok(await this.repository.createRegistryAgent({
        ...input, ownerId: context.userId ?? null, definition: createInitialAgentDraft(),
      }, { context }));
    } catch (error) { return Result.fail(normalizeAgentRegistryError(error)); }
  }
}
