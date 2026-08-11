import type { AgentLifecycleAction, AgentLifecycleStatus } from '@cerebro/agent-registry-contracts';
import type { AgentRepository } from '@cerebro/db';
import { Result } from '../dto/Result';
import { AgentRegistryActorContext, AgentRegistryError, normalizeAgentRegistryError, requireAgentCapability } from './AgentRegistryErrors';

const transitions: Record<AgentLifecycleAction, { from: AgentLifecycleStatus; to: AgentLifecycleStatus; permission: string }> = {
  enter_sandbox: { from: 'DRAFT', to: 'SANDBOX', permission: 'agent.lifecycle.certify' },
  certify: { from: 'SANDBOX', to: 'CERTIFIED', permission: 'agent.lifecycle.certify' },
  promote_to_production: { from: 'CERTIFIED', to: 'PRODUCTION', permission: 'agent.lifecycle.promote_production' },
  suspend: { from: 'PRODUCTION', to: 'SUSPENDED', permission: 'agent.lifecycle.suspend' },
  reactivate: { from: 'SUSPENDED', to: 'PRODUCTION', permission: 'agent.lifecycle.suspend' },
};

export class AgentLifecycleService {
  constructor(private readonly repository: AgentRepository) {}

  async transition(agentId: string, command: { action: AgentLifecycleAction }, context: AgentRegistryActorContext): Promise<Result<unknown>> {
    const transition = transitions[command.action];
    const denied = requireAgentCapability(context, transition.permission);
    if (denied) return Result.fail(denied);
    try {
      const agent = await this.repository.getRegistryAgent(agentId, { context });
      if (!agent) return Result.fail(new AgentRegistryError('AGENT_NOT_FOUND', 'Agent not found'));
      if (agent.lifecycleStatus !== transition.from) {
        return Result.fail(new AgentRegistryError('AGENT_LIFECYCLE_CONFLICT', `Cannot ${command.action} from ${agent.lifecycleStatus}`));
      }
      if (!agent.activeVersionId && transition.to !== 'SUSPENDED') {
        return Result.fail(new AgentRegistryError('AGENT_ACTIVE_VERSION_REQUIRED', 'Publish an agent version before changing lifecycle'));
      }
      return Result.ok(await this.repository.transitionLifecycle(agentId, {
        from: transition.from, to: transition.to, actorId: context.userId ?? null,
      }, { context }));
    } catch (error) { return Result.fail(normalizeAgentRegistryError(error)); }
  }
}
