
export interface RoutingDecision {
  targetWorkerId: string;
  reason: string;
  confidenceScore: number;
  historicalLatencyMs: number;
}

export interface OptimizationReport {
  nodesRemoved: number;
  nodesFused: number;
  branchesParallelized: number;
  estimatedLatencySavingsMs: number;
  estimatedCostSavingsUsd: number;
}

export interface PlanningExplanation {
  report: OptimizationReport;
  routingDecisions: Record<string, RoutingDecision>; // By Node ID
}
