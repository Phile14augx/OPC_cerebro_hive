/**
 * Decision Engine & Agents
 */

export type DecisionCategory = "Recommend" | "Explain" | "Predict" | "Compare" | "Diagnose" | "Optimize" | "Escalate";

export interface AIDecision {
  id: string; // Decision UUID
  category: DecisionCategory;
  confidenceScore: number;
  explanation: string;
  referencedKnowledgeNodes: string[]; // Graph node IDs
  referencedCorrelationIds: string[]; // Event/Workflow IDs
  proposedExecutionPlanId?: string; // Optional if it requires user approval to execute
}

export interface IntelligenceAgent {
  name: string;
  domain: string;
  evaluate(contextQuery: any): Promise<AIDecision>;
}

export class DecisionEngine {
  private agents: Map<string, IntelligenceAgent> = new Map();

  registerAgent(agent: IntelligenceAgent) {
    this.agents.set(agent.name, agent);
  }

  async processRequest(category: DecisionCategory, contextQuery: any): Promise<AIDecision[]> {
    const decisions: AIDecision[] = [];
    for (const agent of this.agents.values()) {
      // In reality, we'd route only to relevant agents
      const decision = await agent.evaluate(contextQuery);
      if (decision.category === category) {
        decisions.push(decision);
      }
    }
    return decisions;
  }
}

export const decisionEngine = new DecisionEngine();
