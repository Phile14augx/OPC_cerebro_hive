export type CoordinatorEvent = 
  | { type: 'BatchStarted', batchId: string }
  | { type: 'ReviewProgressUpdated', batchId: string, percentComplete: number }
  | { type: 'BatchCompleted', batchId: string }
  | { type: 'BatchFailed', batchId: string, error: Error };

export class CoordinatorEventBus {
  private listeners: ((event: CoordinatorEvent) => void)[] = [];

  subscribe(callback: (event: CoordinatorEvent) => void): void {
    this.listeners.push(callback);
  }

  publish(event: CoordinatorEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}

export class ExecutionMetricsCollector {
  private readonly metrics = {
    totalEnqueued: 0,
    totalCompleted: 0,
    totalFailed: 0,
    totalRetries: 0,
    cacheHits: 0,
    cacheMisses: 0,
    bytesSaved: 0,
    executionTimeSavedMs: 0
  };

  recordEnqueue(): void {
    this.metrics.totalEnqueued++;
  }

  recordCompletion(_durationMs: number): void {
    this.metrics.totalCompleted++;
  }

  recordFailure(): void {
    this.metrics.totalFailed++;
  }

  recordRetry(): void {
    this.metrics.totalRetries++;
  }

  recordCacheHit(bytesSaved: number, executionTimeSavedMs: number): void {
    this.metrics.cacheHits++;
    this.metrics.bytesSaved += bytesSaved;
    this.metrics.executionTimeSavedMs += executionTimeSavedMs;
  }

  recordCacheMiss(): void {
    this.metrics.cacheMisses++;
  }

  getMetrics() {
    return { ...this.metrics };
  }
}
