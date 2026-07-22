import { createHash } from "node:crypto";
import { newId } from "../../kernel/ids/id.js";
import { PlatformError } from "../../kernel/errors/errors.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { Telemetry } from "../../kernel/telemetry/telemetry.js";
import { type AiCallRepository, type AiProvider, type CompletionRequest, type CompletionResult, type EmbeddingResult } from "./types.js";
import { PromptRegistry } from "./prompt-registry.js";

/** USD per 1M tokens (prompt, completion). */
const PRICING: Record<string, [number, number]> = {
  "cerebro-mock-1": [0, 0],
  "gpt-4o-mini": [0.15, 0.6],
  "gpt-4o": [2.5, 10],
  "claude-haiku-4-5-20251001": [1, 5],
  "claude-sonnet-5": [3, 15],
  "llama3.2": [0, 0],
};

interface CacheEntry { result: CompletionResult; at: number }

export interface XGatewayOptions {
  providers: AiProvider[];
  defaultProvider: string;
  fallbackOrder?: string[];
  cacheTtlMs?: number;
  maxRetries?: number;
}

/**
 * Cerebro X™ — the single door to every model. Routing, retries, fallback,
 * caching, pricing, telemetry, prompt registry, embeddings, streaming.
 * Nothing in the platform calls a provider directly.
 */
export class XGateway {
  readonly prompts = new PromptRegistry();
  private cache = new Map<string, CacheEntry>();
  private readonly ttl: number;
  private readonly maxRetries: number;

  constructor(
    private readonly opts: XGatewayOptions,
    private readonly calls: AiCallRepository,
    private readonly bus: EventBus,
    private readonly telemetry: Telemetry,
  ) {
    this.ttl = opts.cacheTtlMs ?? 10 * 60_000;
    this.maxRetries = opts.maxRetries ?? 2;
  }

  provider(name: string): AiProvider {
    const p = this.opts.providers.find(pr => pr.name === name);
    if (!p) throw PlatformError.notFound("ai provider", name);
    return p;
  }

  private chain(preferred?: string): AiProvider[] {
    const order = [preferred ?? this.opts.defaultProvider, ...(this.opts.fallbackOrder ?? []), "mock"];
    const seen = new Set<string>();
    const out: AiProvider[] = [];
    for (const name of order) {
      if (seen.has(name)) continue;
      seen.add(name);
      const p = this.opts.providers.find(pr => pr.name === name);
      if (p) out.push(p);
    }
    return out;
  }

  async complete(organizationId: string, req: CompletionRequest, opts?: { provider?: string; traceId?: string }): Promise<CompletionResult> {
    return this.telemetry.tracer.withSpan("x.complete", async span => {
      span.setAttribute("org", organizationId);
      const cacheable = (req.temperature ?? 0.2) <= 0.2 && !req.onToken;
      const key = createHash("sha256").update(JSON.stringify({ m: req.messages, model: req.model, t: req.temperature })).digest("hex");
      if (cacheable) {
        const hit = this.cache.get(key);
        if (hit && Date.now() - hit.at < this.ttl) {
          this.telemetry.metrics.increment("x.cache.hit");
          return { ...hit.result, cached: true };
        }
      }
      let lastErr: unknown;
      for (const provider of this.chain(opts?.provider)) {
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
          const started = Date.now();
          try {
            if (!(await provider.available())) break;
            const raw = await provider.complete(req);
            const latencyMs = Date.now() - started;
            const [pIn, pOut] = PRICING[raw.model] ?? [0, 0];
            const result: CompletionResult = {
              ...raw, latencyMs, cached: false,
              costUsd: (raw.promptTokens * pIn! + raw.completionTokens * pOut!) / 1_000_000,
            };
            if (cacheable) this.cache.set(key, { result, at: Date.now() });
            await this.recordCall(organizationId, provider.name, result.model, "completion", result.promptTokens, result.completionTokens, result.costUsd, latencyMs, false, true, opts?.traceId);
            span.setAttribute("provider", provider.name).setAttribute("latencyMs", latencyMs);
            return result;
          } catch (err) {
            lastErr = err;
            this.telemetry.metrics.increment("x.provider.error", 1, { provider: provider.name });
            await this.recordCall(organizationId, provider.name, req.model ?? "unknown", "completion", 0, 0, 0, Date.now() - started, false, false, opts?.traceId);
            if (attempt < this.maxRetries) await new Promise(r => setTimeout(r, 150 * 2 ** attempt));
          }
        }
      }
      throw new PlatformError("unavailable", `all ai providers failed: ${String(lastErr)}`, { retryable: true });
    });
  }

  async embed(organizationId: string, texts: string[], opts?: { provider?: string; traceId?: string }): Promise<EmbeddingResult> {
    const started = Date.now();
    for (const provider of this.chain(opts?.provider)) {
      try {
        if (!(await provider.available())) continue;
        const raw = await provider.embed(texts);
        await this.recordCall(organizationId, provider.name, raw.model, "embedding", texts.join(" ").length / 4, 0, 0, Date.now() - started, false, true, opts?.traceId);
        await this.bus.publish(Subjects.ai.embedding, { count: texts.length, model: raw.model }, { organizationId, traceId: opts?.traceId });
        return { ...raw, provider: provider.name };
      } catch { /* next provider */ }
    }
    throw new PlatformError("unavailable", "no embedding provider available");
  }

  private async recordCall(organizationId: string, provider: string, model: string, operation: "completion" | "embedding", promptTokens: number, completionTokens: number, costUsd: number, latencyMs: number, cached: boolean, ok: boolean, traceId?: string): Promise<void> {
    this.telemetry.metrics.increment(`x.${operation}`, 1, { provider, ok: String(ok) });
    this.telemetry.metrics.observe("x.latency_ms", latencyMs, { provider });
    await this.calls.append({
      id: newId("aic"), organizationId, provider, model, operation,
      promptTokens: Math.round(promptTokens), completionTokens, costUsd, latencyMs, cached, ok, traceId,
      createdAt: new Date().toISOString(),
    });
    if (operation === "completion" && ok) {
      await this.bus.publish(Subjects.ai.completion, { provider, model, promptTokens, completionTokens, costUsd, latencyMs }, { organizationId, traceId });
    }
  }

  usage(organizationId: string) { return this.calls.usage(organizationId); }
}
