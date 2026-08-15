import { describe, it, expect } from 'vitest';
import { GovernanceAnalyticsEngine } from './GovernanceAnalyticsEngine.js';
import { RuleResult } from '../governance/GovernanceRule.js';

// Graph under test:
//   A -> B -> D   (100 + 50 + 200  = 350ms)
//   A -> C -> D   (100 + 300 + 200 = 600ms)
// Expected critical path: A -> C -> D (600ms)
const baseTime = new Date('2026-07-25T10:00:00Z').getTime();

const mockedResults: RuleResult[] = [
  {
    ruleId: 'A',
    status: 'Passed',
    executed: true,
    severity: 'Block',
    dependencyFailures: [],
    executionTimeMs: 100,
    metadata: {
      tier: 1,
      executionOrder: 1,
      startedAt: new Date(baseTime),
      completedAt: new Date(baseTime + 100),
      durationMs: 100,
      resolvedDependencies: [],
    },
  },
  {
    ruleId: 'B',
    status: 'Passed',
    executed: true,
    severity: 'Block',
    dependencyFailures: [],
    executionTimeMs: 50,
    metadata: {
      tier: 2,
      executionOrder: 2,
      startedAt: new Date(baseTime + 100),
      completedAt: new Date(baseTime + 150),
      durationMs: 50,
      resolvedDependencies: ['A'],
    },
  },
  {
    ruleId: 'C',
    status: 'Passed',
    executed: true,
    severity: 'Block',
    dependencyFailures: [],
    executionTimeMs: 300,
    metadata: {
      tier: 2,
      executionOrder: 3,
      startedAt: new Date(baseTime + 100),
      completedAt: new Date(baseTime + 400),
      durationMs: 300,
      resolvedDependencies: ['A'],
    },
  },
  {
    ruleId: 'D',
    status: 'Passed',
    executed: true,
    severity: 'Block',
    dependencyFailures: [],
    executionTimeMs: 200,
    metadata: {
      tier: 3,
      executionOrder: 4,
      startedAt: new Date(baseTime + 400),
      completedAt: new Date(baseTime + 600),
      durationMs: 200,
      resolvedDependencies: ['B', 'C'],
    },
  },
];

describe('GovernanceAnalyticsEngine', () => {
  const engine = new GovernanceAnalyticsEngine();
  const report = engine.generateReport(mockedResults);

  it('computes the critical path (longest dependency chain)', () => {
    expect(report.criticalPath.pathRuleIds.join(' -> ')).toBe('A -> C -> D');
    expect(report.criticalPath.totalLatencyMs).toBe(600);
  });

  it('computes parallelization efficiency from wall-clock vs. summed durations', () => {
    // Wall clock: 600ms (A(100) + C(300) + D(200), the critical path)
    // Sum of durations: 100 + 50 + 300 + 200 = 650ms
    expect(report.parallelism.wallClockTimeMs).toBe(600);
    expect(report.parallelism.sumOfDurationsMs).toBe(650);
    expect(report.parallelism.parallelizationEfficiency).toBeCloseTo(650 / 600, 3);
  });

  it('computes branch stats across all rules', () => {
    expect(report.branchStats.totalRules).toBe(4);
    expect(report.branchStats.passed).toBe(4);
  });
});
