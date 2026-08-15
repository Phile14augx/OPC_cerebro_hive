import { RuleResult, EventTimelineRecord } from '../governance/GovernanceRule.js';
import { GovernanceAnalyticsReport } from './GovernanceAnalytics.js';
import { CriticalPathAnalyzer } from './CriticalPathAnalyzer.js';
import { BranchAnalyzer } from './BranchAnalyzer.js';
import { ParallelismAnalyzer } from './ParallelismAnalyzer.js';
import { BottleneckAnalyzer } from './BottleneckAnalyzer.js';
import { TimelineAnalyzer } from './TimelineAnalyzer.js';

export class GovernanceAnalyticsEngine {
  private criticalPathAnalyzer = new CriticalPathAnalyzer();
  private branchAnalyzer = new BranchAnalyzer();
  private parallelismAnalyzer = new ParallelismAnalyzer();
  private bottleneckAnalyzer = new BottleneckAnalyzer();
  private timelineAnalyzer = new TimelineAnalyzer();

  public generateReport(results: RuleResult[], timeline?: EventTimelineRecord[]): GovernanceAnalyticsReport {
    return {
      criticalPath: this.criticalPathAnalyzer.analyze(results),
      branchStats: this.branchAnalyzer.analyze(results),
      parallelism: this.parallelismAnalyzer.analyze(results),
      bottlenecks: this.bottleneckAnalyzer.analyze(results),
      ...(timeline ? { timeline: this.timelineAnalyzer.analyze(timeline) } : {})
    };
  }
}
