// =============================================================================
// @cerebro/ai-gateway — Public API
// =============================================================================

// Main gateway class + factory
export { AIGateway, createGateway } from './gateway';

// Types
export type {
  ChatRequest,
  ChatResponse,
  StreamChunk,
  GatewayConfig,
  ProviderConfig,
  ProviderName,
  ChatMessage,
} from './types';
export { GatewayError, GATEWAY_ERRORS } from './types';

// Provider interface (for custom providers)
export type { AIProvider } from './providers/base.provider';

// Circuit breaker (exported for monitoring)
export { CircuitBreaker } from './circuit-breaker';
export type { CircuitState } from './circuit-breaker';

// Rate limiter
export { RateLimiter } from './rate-limiter';

// Cache
export { ResponseCache } from './cache';

// Routing infrastructure (from existing files)
export { ModelRouter } from './routing/ModelRouter';
export { ModelRegistry } from './routing/ModelRegistry';
