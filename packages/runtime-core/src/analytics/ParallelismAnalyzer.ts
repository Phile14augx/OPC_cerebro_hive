import { RuleResult } from '../governance/GovernanceRule.js';
import { ParallelismReport, IAnalyzer } from './GovernanceAnalytics.js';

export class ParallelismAnalyzer implements IAnalyzer<ParallelismReport> {
  analyze(results: RuleResult[]): ParallelismReport {
    if (results.length === 0) {
      return {
        wallClockTimeMs: 0,
        sumOfDurationsMs: 0,
        parallelizationEfficiency: 1,
        maxParallelWidth: 0,
        avgParallelWidth: 0
      };
    }

    let minStart = Infinity;
    let maxEnd = -Infinity;
    let sumDurations = 0;
    
    // For parallelism width (tier-based)
    const tierMap = new Map<number, number>();

    for (const res of results) {
      if (res.metadata) {
        const start = res.metadata.startedAt.getTime();
        const end = res.metadata.completedAt.getTime();
        
        if (start < minStart) minStart = start;
        if (end > maxEnd) maxEnd = end;
        
        sumDurations += res.metadata.durationMs;
        
        tierMap.set(res.metadata.tier, (tierMap.get(res.metadata.tier) || 0) + 1);
      }
    }

    const wallClockTimeMs = maxEnd - minStart;
    const efficiency = wallClockTimeMs === 0 ? 1 : sumDurations / wallClockTimeMs;

    let maxParallelWidth = 0;
    let totalWidth = 0;

    for (const width of tierMap.values()) {
      if (width > maxParallelWidth) maxParallelWidth = width;
      totalWidth += width;
    }

    const avgParallelWidth = tierMap.size === 0 ? 0 : totalWidth / tierMap.size;

    return {
      wallClockTimeMs,
      sumOfDurationsMs: sumDurations,
      parallelizationEfficiency: efficiency,
      maxParallelWidth,
      avgParallelWidth
    };
  }
}
