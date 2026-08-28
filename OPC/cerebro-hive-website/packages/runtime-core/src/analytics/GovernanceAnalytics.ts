import { RuleResult } from '../governance/GovernanceRule';
import { TimelineAnalytics } from './TimelineAnalyzer';

export interface GovernanceAnalyticsReport {
  criticalPath: CriticalPathReport;
  branchStats: BranchStatsReport;
  parallelism: ParallelismReport;
  bottlenecks: BottleneckReport;
  timeline?: TimelineAnalytics;
}

export interface CriticalPathReport {
  pathRuleIds: string[];
  totalLatencyMs: number;
}

export interface BranchStatsReport {
  totalRules: number;
  executed: number;
  passed: number;
  failed: number;
  skippedOptimization: number;
  skippedDependency: number;
  injected: number;
  expanded: number;
  errors: number;
}

export interface ParallelismReport {
  wallClockTimeMs: number;
  sumOfDurationsMs: number;
  parallelizationEfficiency: number; // sumOfDurations / wallClock
  maxParallelWidth: number;
  avgParallelWidth: number;
}

export interface BottleneckReport {
  slowestRules: Array<{ruleId: string, durationMs: number}>;
}

export interface IAnalyzer<T> {
  analyze(results: RuleResult[]): T;
}
