import { RuleResult } from '../governance/GovernanceRule';
import { BottleneckReport, IAnalyzer } from './GovernanceAnalytics';

export class BottleneckAnalyzer implements IAnalyzer<BottleneckReport> {
  analyze(results: RuleResult[]): BottleneckReport {
    const executedRules = results.filter(r => r.metadata?.executionState?.includes('Executed'));
    
    // Sort by duration descending
    executedRules.sort((a, b) => (b.metadata?.durationMs || 0) - (a.metadata?.durationMs || 0));

    const slowestRules = executedRules.slice(0, 10).map(r => ({
      ruleId: r.ruleId,
      durationMs: r.metadata?.durationMs || 0
    }));

    return {
      slowestRules
    };
  }
}
