// =============================================================================
// AI Service Factory
// =============================================================================
import type { AIService, AIServiceConfig } from './service/AIService';
import { OpenAIProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { MockProvider } from './providers/mock.provider';

export function createAIService(config: AIServiceConfig): AIService {
  switch (config.provider) {
    case 'openai':
      return new OpenAIProvider(config);
    case 'anthropic':
      return new AnthropicProvider(config);
    case 'mock':
      return new MockProvider();
    default:
      throw new Error(`Unknown AI provider: ${(config as any).provider}`);
  }
}

/** Convenience: create from environment variables */
export function createAIServiceFromEnv(): AIService {
  const provider = (process.env.AI_PROVIDER ?? 'anthropic') as AIServiceConfig['provider'];
  const modelId = process.env.AI_MODEL_ID ?? 'claude-sonnet-4-6';
  return createAIService({ provider, modelId });
}
