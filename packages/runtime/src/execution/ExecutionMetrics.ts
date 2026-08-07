export class ExecutionMetrics {
  private startTime: number;
  private metrics: Record<string, number> = {};
  
  private promptTokens = 0;
  private completionTokens = 0;
  private cachedTokens = 0;
  private totalCostUSD = 0;
  private provider = 'unknown';
  private model = 'unknown';
  private tenantId = 'unknown';
  private workspaceId = 'unknown';

  constructor() {
    this.startTime = Date.now();
  }

  setContext(tenantId: string, workspaceId: string) {
    this.tenantId = tenantId;
    this.workspaceId = workspaceId;
  }

  recordUsage(provider: string, model: string, prompt: number, completion: number, cached: number, costUSD: number) {
    this.provider = provider;
    this.model = model;
    this.promptTokens += prompt;
    this.completionTokens += completion;
    this.cachedTokens += cached;
    this.totalCostUSD += costUSD;
  }

  record(name: string, value: number) {
    this.metrics[name] = (this.metrics[name] || 0) + value;
  }

  recordLatency(name: string, durationMs: number) {
    this.record(`${name}_latency_ms`, durationMs);
  }

  getMetrics() {
    return {
      ...this.metrics,
      total_duration_ms: Date.now() - this.startTime,
      promptTokens: this.promptTokens,
      completionTokens: this.completionTokens,
      cachedTokens: this.cachedTokens,
      totalCostUSD: this.totalCostUSD,
      provider: this.provider,
      model: this.model,
      tenantId: this.tenantId,
      workspaceId: this.workspaceId
    };
  }
}
