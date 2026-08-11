// =============================================================================
// CerebroHive™ AI Service — Core interfaces
// =============================================================================

export type AIProviderType = 'openai' | 'anthropic' | 'mock';

export interface AIServiceConfig {
  provider: AIProviderType;
  modelId: string;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIGenerateRequest {
  systemPrompt?: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  temperature?: number;
  maxTokens?: number;
}

export interface AIGenerateResult {
  text: string;
  tokensIn: number;
  tokensOut: number;
  model: string;
  durationMs: number;
}

export interface AIStreamChunk {
  delta: string;
  done: boolean;
}

export interface AIService {
  generateText(req: AIGenerateRequest): Promise<AIGenerateResult>;
  streamText(req: AIGenerateRequest): AsyncGenerator<AIStreamChunk>;
  generateStructured<T>(req: AIGenerateRequest & {
    schema: string;
    schemaDescription: string;
  }): Promise<T>;
}
