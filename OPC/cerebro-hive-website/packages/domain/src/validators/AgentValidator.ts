import { MaximumToolsSpecification } from '../specifications/AgentSpecifications';

export class AgentValidator {
  private maxToolsSpec = new MaximumToolsSpecification(50);

  validatePublish(agentId: string, modelId: string, instructions: string, tools: any[]) {
    const errors: string[] = [];

    if (!modelId) errors.push("Model ID is required.");
    if (!instructions || instructions.trim().length === 0) errors.push("Instructions cannot be empty.");
    if (!this.maxToolsSpec.isSatisfiedBy(tools)) errors.push("Agent exceeds maximum allowed tools (50).");

    if (errors.length > 0) {
      throw new Error(`Validation failed for Agent: ${errors.join(', ')}`);
    }
  }
}
