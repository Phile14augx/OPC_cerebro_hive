import { RuleResult } from '../governance/GovernanceRule';
import { BranchStatsReport, IAnalyzer } from './GovernanceAnalytics';

export class BranchAnalyzer implements IAnalyzer<BranchStatsReport> {
  analyze(results: RuleResult[]): BranchStatsReport {
    const report: BranchStatsReport = {
      totalRules: results.length,
      executed: 0,
      passed: 0,
      failed: 0,
      skippedOptimization: 0,
      skippedDependency: 0,
      injected: 0,
      expanded: 0,
      errors: 0
    };

    for (const res of results) {
      if (res.status === 'Passed') report.passed++;
      if (res.status === 'Failed') report.failed++;
      if (res.status === 'SkippedOptimization') report.skippedOptimization++;
      if (res.status === 'SkippedDependency') report.skippedDependency++;
      if (res.status === 'Error') report.errors++;
      
      if (res.metadata?.executionState?.includes('Executed')) report.executed++;
      if (res.metadata?.executionState?.includes('Injected')) report.injected++;
      if (res.metadata?.executionState?.includes('Expanded')) report.expanded++;
    }

    return report;
  }
}
