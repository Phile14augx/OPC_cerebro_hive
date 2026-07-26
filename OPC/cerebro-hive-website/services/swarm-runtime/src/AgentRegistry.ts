
import { AgentManifest } from '@cerebro/swarm-sdk';

class AgentRegistryImpl {
  private agents = new Map<string, AgentManifest>();

  register(agent: AgentManifest) {
    this.agents.set(agent.id, agent);
  }

  getCapableAgents(capability: string): AgentManifest[] {
    return Array.from(this.agents.values()).filter(a => a.capabilities.includes(capability));
  }
}
export const AgentRegistry = new AgentRegistryImpl();
