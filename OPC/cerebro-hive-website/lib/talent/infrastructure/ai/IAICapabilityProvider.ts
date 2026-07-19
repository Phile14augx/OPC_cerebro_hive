/**
 * AI as an abstract Capability.
 * The core platform never asks for "OpenAI" or "Anthropic".
 * It asks for a "Reviewer" or a "Summarizer".
 */
export interface AICapability {
  executeCapability(context: any): Promise<any>;
}

export interface ReviewCapability extends AICapability {
  executeCapability(context: { code: string, prompt: string, rubricId: string }): Promise<{ score: number, feedback: string }>;
}

export interface SummarizerCapability extends AICapability {
  executeCapability(context: { rawLogs: string }): Promise<{ summary: string }>;
}

/**
 * Standard interface for an AI Vendor Provider.
 */
export interface IAIProvider {
  name: string;
  getCapability<T extends AICapability>(capabilityName: "Reviewer" | "Summarizer" | "Interviewer"): T;
}

/**
 * Example: OpenAI implementation of the capabilities.
 */
export class OpenAIProvider implements IAIProvider {
  name = "OpenAI";

  getCapability<T extends AICapability>(capabilityName: string): T {
    if (capabilityName === "Reviewer") {
      return {
        async executeCapability(context: any) {
          console.log(`[OpenAI: Reviewer] Evaluating against rubric...`);
          return { score: 92, feedback: "Excellent architecture, good use of SOLID principles." };
        }
      } as unknown as T;
    }
    throw new Error(`Capability ${capabilityName} not supported by ${this.name}`);
  }
}

/**
 * High-level orchestration.
 * The AI Review Engine just asks the registry for the best Reviewer.
 */
export class AIProviderRegistry {
  private defaultProvider: IAIProvider = new OpenAIProvider();

  getReviewer(): ReviewCapability {
    return this.defaultProvider.getCapability<ReviewCapability>("Reviewer");
  }
}
