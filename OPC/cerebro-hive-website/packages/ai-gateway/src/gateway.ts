// =============================================================================
// CerebroHive AI Gateway — Main gateway orchestrator
// Handles: routing → rate limiting → circuit breaker → caching →
//          provider call → cost tracking → metrics → OTel spans
// =============================================================================

import { randomUUID } from 'crypto';
import type { AIProvider } from './providers/base.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { CircuitBreaker } from './circuit-breaker';
import { RateLimiter } from './rate-limiter';
import { ResponseCache } from './cache';
import {
  GatewayError,
  GATEWAY_ERRORS,
  type ChatRequest,
  type ChatResponse,
  type GatewayConfig,
  type ProviderName,
  type StreamChunk,
} from './types';

// Lazy-import telemetry so gateway can be used without OTel configured
let telemetry: typeof import('@cerebro/telemetry') | undefined;
try {
  telemetry = require('@cerebro/telemetry');
} catch {
  // telemetry not available — run silent
}

export class AIGateway {
  private providers = new Map<ProviderName, AIProvider>();
  private breakers = new Map<ProviderName, CircuitBreaker>();
  private rateLimiters = new Map<ProviderName, RateLimiter>();
  private cache: ResponseCache;
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor(private readonly config: GatewayConfig) {
    this.cache = new ResponseCache();

    // Initialise providers
    for (const provCfg of config.providers) {
      if (!provCfg.enabled) continue;

      let provider: AIProvider;
      switch (provCfg.name) {
        case 'anthropic':
          provider = new AnthropicProvider(provCfg);
          break;
        case 'openai':
          provider = new OpenAIProvider(provCfg);
          break;
        default:
          continue; // skip unsupported providers
      }

      this.providers.set(provCfg.name, provider);
      this.breakers.set(
        provCfg.name,
        new CircuitBreaker(provCfg.name, {
          errorThreshold: config.circuitBreakerThreshold,
          resetTimeoutMs: config.circuitBreakerResetMs,
        })
      );
      if (config.enableRateLimiting && provCfg.rpmLimit) {
        this.rateLimiters.set(provCfg.name, new RateLimiter(provCfg.rpmLimit));
      }
    }

    // Periodic cache + rate-limiter cleanup
    this.cleanupInterval = setInterval(() => {
      this.cache.purgeExpired();
      for (const rl of this.rateLimiters.values()) rl.cleanup();
    }, 60_000);
    this.cleanupInterval.unref?.();
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const doChat = async (): Promise<ChatResponse> => {
      // 1. Check cache
      if (this.config.enableCaching && !request.stream) {
        const cacheKey = ResponseCache.buildKey(request);
        const ttl = request.cacheTTL ?? this.config.cacheTTL;
        const cached = this.cache.get(cacheKey);
        if (cached) {
          telemetry?.recordAIRequest({
            provider: cached.provider,
            model: cached.model,
            status: 'cached',
            organizationId: request.organizationId,
          });
          return cached;
        }
      }

      // 2. Pick provider with failover
      const response = await this.executeWithFailover(request);

      // 3. Cache the response
      if (this.config.enableCaching && !request.stream) {
        const cacheKey = ResponseCache.buildKey(request);
        const ttl = request.cacheTTL ?? this.config.cacheTTL;
        if (ttl > 0) this.cache.set(cacheKey, response, ttl);
      }

      return response;
    };

    if (telemetry) {
      return telemetry.withAISpan(
        doChat,
        {
          provider: request.provider ?? 'anthropic',
          model: request.model ?? this.config.defaultModel,
          maxTokens: request.maxTokens,
          temperature: request.temperature,
          stream: false,
          organizationId: request.organizationId,
          workflowId: request.workflowId,
          agentId: request.agentId,
        },
        (result) => ({
          inputTokens: result.usage.inputTokens,
          outputTokens: result.usage.outputTokens,
          costUSD: result.cost.totalCostUSD,
          cacheHit: result.cached,
          responseModel: result.model,
          finishReason: result.finishReason,
        })
      );
    }

    return doChat();
  }

  async *stream(request: ChatRequest): AsyncGenerator<StreamChunk> {
    const provider = this.selectProvider(request.provider);
    if (!provider) throw new GatewayError('No available provider', GATEWAY_ERRORS.NO_PROVIDER);

    this.enforceRateLimit(provider.name as ProviderName, request.organizationId);

    const breaker = this.breakers.get(provider.name as ProviderName)!;
    if (!breaker.isAvailable()) {
      throw new GatewayError(`Provider ${provider.name} circuit open`, GATEWAY_ERRORS.CIRCUIT_OPEN, provider.name as ProviderName);
    }

    let ttft: number | undefined;
    const start = Date.now();
    telemetry?.getAIMetrics().activeStreams.add(1, { provider: provider.name });

    try {
      for await (const chunk of provider.stream({ ...request, stream: true })) {
        if (!ttft && chunk.delta) ttft = Date.now() - start;
        yield chunk;
        if (chunk.done && chunk.usage) {
          telemetry?.recordAIRequest({
            provider: provider.name as ProviderName,
            model: request.model ?? provider.config.defaultModel,
            status: 'success',
            inputTokens: chunk.usage.inputTokens,
            outputTokens: chunk.usage.outputTokens,
            durationMs: Date.now() - start,
            ttftMs: ttft,
            costUSD: chunk.cost?.totalCostUSD,
            organizationId: request.organizationId,
          });
        }
      }
      breaker.recordSuccess();
    } catch (err) {
      breaker.recordFailure();
      telemetry?.recordAIRequest({
        provider: provider.name as ProviderName,
        model: request.model ?? provider.config.defaultModel,
        status: 'error',
        durationMs: Date.now() - start,
        organizationId: request.organizationId,
        errorType: err instanceof GatewayError ? err.code : 'UNKNOWN',
      });
      throw err;
    } finally {
      telemetry?.getAIMetrics().activeStreams.add(-1, { provider: provider.name });
    }
  }

  // ─── Health / introspection ────────────────────────────────────────────────

  getHealth() {
    return {
      providers: Array.from(this.providers.entries()).map(([name, p]) => ({
        name,
        circuitState: this.breakers.get(name)?.currentState ?? 'UNKNOWN',
      })),
      cache: {
        size: this.cache.size,
        enabled: this.config.enableCaching,
      },
    };
  }

  async destroy(): Promise<void> {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private async executeWithFailover(request: ChatRequest): Promise<ChatResponse> {
    // Sort providers by priority; if user requested specific provider, use it first
    const ordered = this.getOrderedProviders(request.provider);

    let lastError: Error | undefined;
    for (const provider of ordered) {
      const breaker = this.breakers.get(provider.name as ProviderName)!;
      if (!breaker.isAvailable()) continue;

      try {
        this.enforceRateLimit(provider.name as ProviderName, request.organizationId);

        const start = Date.now();
        const response = await provider.complete(request);
        breaker.recordSuccess();

        if (this.config.enableCostTracking) {
          telemetry?.recordAIRequest({
            provider: provider.name as ProviderName,
            model: response.model,
            status: 'success',
            inputTokens: response.usage.inputTokens,
            outputTokens: response.usage.outputTokens,
            durationMs: response.durationMs,
            costUSD: response.cost.totalCostUSD,
            organizationId: request.organizationId,
          });
        }

        return response;
      } catch (err) {
        breaker.recordFailure();
        lastError = err as Error;

        if (err instanceof GatewayError && !err.retryable) throw err;
        // Retryable: try next provider
      }
    }

    throw lastError ?? new GatewayError('All providers failed', GATEWAY_ERRORS.NO_PROVIDER);
  }

  private selectProvider(preferred?: ProviderName): AIProvider | undefined {
    if (preferred && this.providers.has(preferred)) return this.providers.get(preferred);
    return this.getOrderedProviders()[0];
  }

  private getOrderedProviders(preferred?: ProviderName): AIProvider[] {
    const all = Array.from(this.providers.values()).sort(
      (a, b) => a.config.priority - b.config.priority
    );
    if (!preferred) return all;
    return [
      ...all.filter(p => p.name === preferred),
      ...all.filter(p => p.name !== preferred),
    ];
  }

  private enforceRateLimit(provider: ProviderName, orgId?: string): void {
    if (!this.config.enableRateLimiting) return;
    const rl = this.rateLimiters.get(provider);
    if (!rl) return;
    const key = `${orgId ?? 'global'}:${provider}`;
    if (!rl.consume(key)) {
      const retryAfter = rl.retryAfterSeconds(key);
      throw new GatewayError(
        `Rate limit exceeded for ${provider}. Retry after ${retryAfter.toFixed(1)}s`,
        GATEWAY_ERRORS.RATE_LIMITED,
        provider,
        true
      );
    }
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createGateway(overrides: Partial<GatewayConfig> = {}): AIGateway {
  const config: GatewayConfig = {
    defaultModel: process.env.AI_DEFAULT_MODEL ?? 'claude-sonnet-4-6',
    cacheTTL: Number(process.env.AI_CACHE_TTL ?? 300),
    enableCostTracking: process.env.AI_COST_TRACKING !== 'false',
    enableCaching: process.env.AI_CACHING !== 'false',
    enableRateLimiting: process.env.AI_RATE_LIMITING !== 'false',
    circuitBreakerThreshold: Number(process.env.AI_CB_THRESHOLD ?? 0.5),
    circuitBreakerResetMs: Number(process.env.AI_CB_RESET_MS ?? 30_000),
    providers: [
      {
        name: 'anthropic',
        enabled: Boolean(process.env.ANTHROPIC_API_KEY),
        apiKey: process.env.ANTHROPIC_API_KEY,
        defaultModel: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
        costPer1kInput: 0.003,
        costPer1kOutput: 0.015,
        priority: 1,
        rpmLimit: Number(process.env.ANTHROPIC_RPM ?? 1000),
        timeoutMs: 120_000,
      },
      {
        name: 'openai',
        enabled: Boolean(process.env.OPENAI_API_KEY),
        apiKey: process.env.OPENAI_API_KEY,
        defaultModel: process.env.OPENAI_MODEL ?? 'gpt-4o',
        costPer1kInput: 0.005,
        costPer1kOutput: 0.015,
        priority: 2,
        rpmLimit: Number(process.env.OPENAI_RPM ?? 500),
        timeoutMs: 120_000,
      },
    ],
    ...overrides,
  };

  return new AIGateway(config);
}
