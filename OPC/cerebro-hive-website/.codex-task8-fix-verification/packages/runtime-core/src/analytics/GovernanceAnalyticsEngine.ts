import { RuleResult, EventTimelineRecord } from '../governance/GovernanceRule';
import { GovernanceAnalyticsReport } from './GovernanceAnalytics';
import { CriticalPathAnalyzer } from './CriticalPathAnalyzer';
import { BranchAnalyzer } from './BranchAnalyzer';
import { ParallelismAnalyzer } from './ParallelismAnalyzer';
import { BottleneckAnalyzer } from './BottleneckAnalyzer';
import { TimelineAnalyzer } from './TimelineAnalyzer';

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
