/**
 * Reusable Intelligence APIs (UI Agnostic)
 */

import { decisionEngine, AIDecision } from "./DecisionEngine";

export class IntelligenceService {
  
  async explainTopology(resourceId: string): Promise<AIDecision> {
    const query = { target: resourceId, intent: "explain_topology" };
    const decisions = await decisionEngine.processRequest("Explain", query);
    return decisions[0]; // Simplified
  }

  async compareProviders(blueprintId: string): Promise<AIDecision> {
    const query = { target: blueprintId, intent: "compare_providers" };
    const decisions = await decisionEngine.processRequest("Compare", query);
    return decisions[0];
  }

  async recommendOptimization(workspaceId: string): Promise<AIDecision> {
    const query = { target: workspaceId, intent: "optimize_cost" };
    const decisions = await decisionEngine.processRequest("Optimize", query);
    return decisions[0];
  }

  async predictFailure(deploymentId: string): Promise<AIDecision> {
    const query = { target: deploymentId, intent: "predict_failure" };
    const decisions = await decisionEngine.processRequest("Predict", query);
    return decisions[0];
  }

  async analyzeIncident(correlationId: string): Promise<AIDecision> {
    const query = { target: correlationId, intent: "diagnose_incident" };
    const decisions = await decisionEngine.processRequest("Diagnose", query);
    return decisions[0];
  }
}

export const intelligenceService = new IntelligenceService();
