/**
 * M24 — ExecutionMetrics
 *
 * Per-node and aggregate metrics. Powers HiveOps / dashboard later
 * without requiring any changes to the runtime.
 */

export interface NodeMetrics {
  nodeId: string;
  queuedAt: number;
  startedAt: number;
  completedAt: number;
  /** Wall-clock execution time (ms) */
  executionMs: number;
  /** Time spent waiting for dependencies/scheduler (ms) */
  queueMs: number;
  tokenUsage?: { prompt: number; completion: number; total: number };
  costUsd?: number;
  retryCount: number;
  status: 'completed' | 'error' | 'cancelled' | 'skipped' | 'timeout' | 'running';
}

export interface ExecutionMetrics {
  executionId: string;
  startedAt: number;
  finishedAt?: number;
  totalMs?: number;
  totalTokens: number;
  totalCostUsd: number;
  nodeMetrics: Record<string, NodeMetrics>;
  finish(): void;
  snapshot(): Readonly<ExecutionMetrics>;
}

export class DefaultExecutionMetrics implements ExecutionMetrics {
  executionId: string;
  startedAt: number;
  finishedAt?: number;
  totalMs?: number;
  totalTokens = 0;
  totalCostUsd = 0;
  nodeMetrics: Record<string, NodeMetrics> = {};

  constructor(executionId: string) {
    this.executionId = executionId;
    this.startedAt = Date.now();
  }

  recordNodeQueued(nodeId: string): void {
    const now = Date.now();
    this.nodeMetrics[nodeId] = {
      nodeId, queuedAt: now, startedAt: 0,
      completedAt: 0, executionMs: 0, queueMs: 0,
      retryCount: 0, status: 'running',
    };
  }

  recordNodeStart(nodeId: string): void {
    const m = this.nodeMetrics[nodeId];
    if (!m) { this.recordNodeQueued(nodeId); }
    const now = Date.now();
    this.nodeMetrics[nodeId].startedAt = now;
    this.nodeMetrics[nodeId].queueMs = now - (this.nodeMetrics[nodeId].queuedAt ?? now);
  }

  recordNodeEnd(nodeId: string, status: NodeMetrics['status'], extras: Partial<NodeMetrics> = {}): void {
    const m = this.nodeMetrics[nodeId];
    if (!m) return;
    const now = Date.now();
    m.completedAt = now;
    m.executionMs = now - (m.startedAt || now);
    m.status = status;
    Object.assign(m, extras);
    if (extras.tokenUsage) this.totalTokens += extras.tokenUsage.total;
    if (extras.costUsd) this.totalCostUsd += extras.costUsd;
  }

  finish(): void {
    this.finishedAt = Date.now();
    this.totalMs = this.finishedAt - this.startedAt;
  }

  snapshot(): Readonly<ExecutionMetrics> {
    return JSON.parse(JSON.stringify(this));
  }
}
