
export interface AgentCapabilities {
  skills: string[];
  supportedTools: string[];
  latencyMs: number;
  reliability: number;
  costPerTask: number;
}

export class AgentRegistry {
  private registry = new Map<string, AgentCapabilities>();

  register(agentId: string, caps: AgentCapabilities) {
    this.registry.set(agentId, caps);
  }

  // Capability Index Matching
  allocateBestAgent(requiredSkills: string[]): string | null {
    let bestAgent = null;
    let highestScore = -1;

    for (const [agentId, caps] of this.registry.entries()) {
      const hasSkills = requiredSkills.every(s => caps.skills.includes(s));
      if (hasSkills) {
        // Simple heuristic: reliability / cost
        const score = caps.reliability / (caps.costPerTask || 1);
        if (score > highestScore) {
          highestScore = score;
          bestAgent = agentId;
        }
      }
    }
    return bestAgent;
  }
}
