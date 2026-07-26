/**
 * HiveSwarm — Learning & Optimization Types
 *
 * Mirrors services/learning-service/src/learner/models.py.
 * Used by agents to store replays and query performance benchmarks.
 */

/** Full execution trace of a completed agent task. */
export interface ReplayRecord {
  id?:              string;
  taskId:           string;
  runId:            string;
  agentId:          string;
  capability:       string;
  taskDescription:  string;
  planSteps:        string[];
  outputContent:    string;
  qualityScore:     number;        // 0–1
  evalCriteria:     Record<string, number>;
  toolCalls:        unknown[];
  durationMs:       number;
  totalTokens:      number;
  costUsd:          number;
  learnings:        string[];
  antiPatterns:     string[];
  createdAt?:       string;        // ISO 8601
}

/** Aggregated performance statistics for an agent+capability pair. */
export interface AgentBenchmark {
  agentId:         string;
  capability:      string;
  windowSize:      number;
  avgQualityScore: number;
  p50Quality:      number;
  p90Quality:      number;
  passRate:        number;        // fraction with score >= 0.6
  avgDurationMs:   number;
  avgCostUsd:      number;
  avgTokens:       number;
  totalTasks:      number;
  computedAt:      string;
}

export interface OptimizeRequest {
  agentId:             string;
  capability:          string;
  currentSystemPrompt: string;
  sampleSize?:         number;   // default 20
}

export interface OptimizeResponse {
  agentId:               string;
  capability:            string;
  optimizedPrompt:       string;
  improvementRationale:  string;
  expectedScoreDelta:    number;
  replaysUsed:           number;
  llmTokensUsed:         number;
}
