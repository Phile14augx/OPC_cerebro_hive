// =============================================================================
// CerebroHive AI Gateway — Base provider interface
// =============================================================================

import type { ChatRequest, ChatResponse, ProviderConfig, StreamChunk } from '../types';

export interface AIProvider {
  readonly name: string;
  readonly config: ProviderConfig;

  /** Non-streaming chat completion */
  complete(request: ChatRequest): Promise<ChatResponse>;

  /** Server-sent streaming completion */
  stream(request: ChatRequest): AsyncGenerator<StreamChunk>;

  /** Check if provider is reachable (used by circuit breaker) */
  healthCheck(): Promise<boolean>;
}

/** Token-count estimator (fallback when provider doesn't return usage) */
export function estimateTokens(text: string): number {
  // Rough: ~4 chars per token for English
  return Math.ceil(text.length / 4);
}

/** Calculate cost given usage and provider config */
export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  config: ProviderConfig
): ChatResponse['cost'] {
  const inputCostUSD = (inputTokens / 1000) * config.costPer1kInput;
  const outputCostUSD = (outputTokens / 1000) * config.costPer1kOutput;
  return {
    inputCostUSD,
    outputCostUSD,
    totalCostUSD: inputCostUSD + outputCostUSD,
  };
}
