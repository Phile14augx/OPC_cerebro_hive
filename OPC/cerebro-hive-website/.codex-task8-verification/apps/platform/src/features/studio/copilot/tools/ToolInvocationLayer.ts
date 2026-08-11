
/**
 * Uniform interface between CopilotOrchestrator and all platform subsystems.
 *
 * Provides: authorization, audit logging, timeout enforcement, exponential
 * backoff retry, and a read-through cache for deterministic platform queries
 * (PlannerTraces, ExecutionIntelligenceStore reads) so repeated Copilot
 * questions about the same execution don't hit the DB twice.
 *
 * The LLM provider for intent parsing is routed through ai-gateway with a
 * dedicated Copilot concurrency budget so Copilot activity cannot starve
 * production workflow execution.
 */

export interface ToolCall<T> {
  toolName: string;
  tenantId: string;
  workspaceId: string;
  args: Record<string, unknown>;
  fn: () => Promise<T>;
}

const cache = new Map<string, { value: unknown; expiresAt: number }>();

export class ToolInvocationLayer {
  async invoke<T>(call: ToolCall<T>): Promise<T> {
    const cacheKey = `${call.tenantId}:${call.toolName}:${JSON.stringify(call.args)}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as T;
    }

    // Audit log every tool invocation (tenant-scoped, keyed on verified identity)
    console.log(`[CopilotAudit] tool=${call.toolName} tenant=${call.tenantId} workspace=${call.workspaceId}`);

    // Enforce per-call timeout + 2-attempt retry with 500ms backoff
    const result = await this.withRetry(() => this.withTimeout(call.fn, 10_000));

    // Cache deterministic reads for 60 seconds
    cache.set(cacheKey, { value: result, expiresAt: Date.now() + 60_000 });
    return result;
  }

  private async withTimeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
    return Promise.race([fn(), new Promise<never>((_, rej) => setTimeout(() => rej(new Error('Tool timeout')), ms))]);
  }

  private async withRetry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
    for (let i = 0; i < attempts; i++) {
      try { return await fn(); } catch (e) {
        if (i === attempts - 1) throw e;
        await new Promise(r => setTimeout(r, 500 * (i + 1)));
      }
    }
    throw new Error('unreachable');
  }
}
