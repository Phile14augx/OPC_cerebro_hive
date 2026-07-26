/**
 * HiveSwarm — Agent Metrics Types
 */

export interface AgentMetrics {
  agentId:          string;

  /** Counters */
  tasksStarted:     number;
  tasksCompleted:   number;
  tasksFailed:      number;
  tasksCancelled:   number;

  /** Latency percentiles (ms) */
  p50LatencyMs:     number;
  p90LatencyMs:     number;
  p99LatencyMs:     number;

  /** LLM usage */
  totalTokensUsed:  number;
  totalCostUsd:     number;

  /** Quality */
  avgQualityScore:  number;   // 0.0–1.0 from observe()
  avgConfidence:    number;   // 0.0–1.0 from task outputs

  /** Tool calls */
  totalToolCalls:   number;
  toolErrorRate:    number;   // 0.0–1.0

  /** Memory */
  memoryWriteCount: number;
  memoryReadCount:  number;

  collectedAt:      string;
}
