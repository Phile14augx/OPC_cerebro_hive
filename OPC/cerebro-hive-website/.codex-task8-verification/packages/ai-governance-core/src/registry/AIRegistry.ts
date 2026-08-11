import { AIModel } from '../domain/AIModel';
import { PromptTemplate } from '../domain/PromptTemplate';
import { Dataset } from '../domain/Dataset';
import { AIEvaluation } from '../domain/AIEvaluation';
import { AIProvider } from '../domain/AIProvider';

export class AIRegistry {
  private models = new Map<string, AIModel>();
  private prompts = new Map<string, PromptTemplate>();
  private datasets = new Map<string, Dataset>();
  private evaluations = new Map<string, AIEvaluation>();
  private providers = new Map<string, AIProvider>();

  async registerModel(model: AIModel): Promise<void> {
    this.models.set(model.modelId, model);
  }

  async getModel(modelId: string): Promise<AIModel | undefined> {
    return this.models.get(modelId);
  }

  async registerPrompt(prompt: PromptTemplate): Promise<void> {
    this.prompts.set(prompt.promptId, prompt);
  }

  async registerDataset(dataset: Dataset): Promise<void> {
    this.datasets.set(dataset.datasetId, dataset);
  }

  async registerEvaluation(evalRecord: AIEvaluation): Promise<void> {
    this.evaluations.set(evalRecord.evaluationId, evalRecord);
  }
  
  async getEvaluationsForModel(modelId: string): Promise<AIEvaluation[]> {
    return Array.from(this.evaluations.values()).filter(e => e.modelId === modelId);
  }

  async registerProvider(provider: AIProvider): Promise<void> {
    this.providers.set(provider.providerId, provider);
  }
}
