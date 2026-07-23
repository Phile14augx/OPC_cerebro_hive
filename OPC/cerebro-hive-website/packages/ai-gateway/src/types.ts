// =============================================================================
// CerebroHive AI Gateway — Core types
// =============================================================================

export type ProviderName = 'anthropic' | 'openai' | 'google' | 'azure' | 'ollama';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;           // optional: override model routing
  provider?: ProviderName;  // optional: force specific provider
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stream?: boolean;
  /** Org-level context for cost attribution and rate limiting */
  organizationId?: string;
  workflowId?: string;
  agentId?: string;
  /** TTL in seconds for response caching; 0 = no cache */
  cacheTTL?: number;
}

export interface ChatResponse {
  id: string;
  content: string;
  model: string;
  provider: ProviderName;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  cost: {
    inputCostUSD: number;
    outputCostUSD: number;
    totalCostUSD: number;
  };
  durationMs: number;
  ttftMs?: number;
  cached: boolean;
  finishReason: 'stop' | 'max_tokens' | 'error' | 'cancelled';
}

export interface StreamChunk {
  id: string;
  delta: string;
  done: boolean;
  /** Only present on final chunk */
  usage?: ChatResponse['usage'];
  /** Only present on final chunk */
  cost?: ChatResponse['cost'];
}

export interface ProviderConfig {
  name: ProviderName;
  enabled: boolean;
  apiKey?: string;
  baseUrl?: string;
  defaultModel: string;
  /** Max requests per minute per organization */
  rpmLimit?: number;
  /** Max tokens per minute */
  tpmLimit?: number;
  /** Cost per 1k input tokens in USD */
  costPer1kInput: number;
  /** Cost per 1k output tokens in USD */
  costPer1kOutput: number;
  /** Priority for routing: lower = preferred */
  priority: number;
  /** Timeout per request in ms */
  timeoutMs?: number;
}

export interface GatewayConfig {
  providers: ProviderConfig[];
  /** Default model ID to use when none specified */
  defaultModel: string;
  /** Redis URL for rate limiting and caching */
  redisUrl?: string;
  /** Default cache TTL in seconds */
  cacheTTL: number;
  enableCostTracking: boolean;
  enableCaching: boolean;
  enableRateLimiting: boolean;
  /** Circuit breaker threshold: error rate before opening */
  circuitBreakerThreshold: number;
  /** Circuit breaker reset timeout in ms */
  circuitBreakerResetMs: number;
}

export class GatewayError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly provider?: ProviderName,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = 'GatewayError';
  }
}

export const GATEWAY_ERRORS = {
  RATE_LIMITED: 'RATE_LIMITED',
  NO_PROVIDER: 'NO_PROVIDER',
  PROVIDER_ERROR: 'PROVIDER_ERROR',
  CIRCUIT_OPEN: 'CIRCUIT_OPEN',
  TIMEOUT: 'TIMEOUT',
  INVALID_REQUEST: 'INVALID_REQUEST',
} as const;
