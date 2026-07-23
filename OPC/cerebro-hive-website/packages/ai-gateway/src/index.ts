export interface AIModel {
  id: string;
  provider: string; // 'anthropic', 'openai', etc.
  modelName: string;
  contextWindow: number;
  costPer1kInputTokens: number;
  costPer1kOutputTokens: number;
  isActive: boolean;
}

export class ModelRegistry {
  private models: Map<string, AIModel> = new Map();

  register(model: AIModel) {
    this.models.set(model.id, model);
  }

  getModel(id: string): AIModel | undefined {
    return this.models.get(id);
  }

  listModels(): AIModel[] {
    return Array.from(this.models.values());
  }
}

export interface PromptTemplate {
  id: string;
  version: string;
  content: string;
  variables: string[];
}

export class PromptRegistry {
  private prompts: Map<string, PromptTemplate[]> = new Map();

  register(prompt: PromptTemplate) {
    const versions = this.prompts.get(prompt.id) || [];
    versions.push(prompt);
    this.prompts.set(prompt.id, versions);
  }

  getPrompt(id: string, version?: string): PromptTemplate | undefined {
    const versions = this.prompts.get(id);
    if (!versions) return undefined;
    if (version) return versions.find(p => p.version === version);
    // Return latest
    return versions[versions.length - 1];
  }
}

export class CostTracker {
  calculateCost(model: AIModel, inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1000) * model.costPer1kInputTokens;
    const outputCost = (outputTokens / 1000) * model.costPer1kOutputTokens;
    return inputCost + outputCost;
  }
}

export class AIGateway {
  constructor(
    public readonly models: ModelRegistry,
    public readonly prompts: PromptRegistry,
    public readonly costs: CostTracker
  ) {}
}
