export interface AIServiceConfig {
  provider: 'openai' | 'anthropic' | 'mock';
  modelId: string;
}

export interface AIGenerateRequest {
  systemPrompt?: string;
  messages: Array<{ role: 'user' | 'assistant', content: string }>;
}

export interface AIService {
  generateText(req: AIGenerateRequest): Promise<string>;
  streamText(req: AIGenerateRequest): AsyncIterable<string>;
}
