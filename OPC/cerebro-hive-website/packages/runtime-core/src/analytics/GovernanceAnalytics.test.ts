import { GovernanceAnalyticsEngine } from './GovernanceAnalyticsEngine';
import { RuleResult } from '../governance/GovernanceRule';

async function runTests() {
  const engine = new GovernanceAnalyticsEngine();
  const baseTime = new Date('2026-07-25T10:00:00Z').getTime();

  // Test 1: Critical Path Computation
  // Graph: A -> B -> D (100 + 50 + 200 = 350ms)
  //        A -> C -> D (100 + 300 + 200 = 600ms)
  // Expected Critical Path: A -> C -> D (600ms)
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
        resolvedDependencies: []
      }
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
        resolvedDependencies: ['A']
      }
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
        resolvedDependencies: ['A']
      }
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
        resolvedDependencies: ['B', 'C']
      }
    }
  ];

  console.log('[Test 1] Critical Path Analyzer');
  const report = engine.generateReport(mockedResults);
  
  const path = report.criticalPath.pathRuleIds.join(' -> ');
  if (path !== 'A -> C -> D') {
    throw new Error(`Critical path incorrect. Expected A -> C -> D, got ${path}`);
  }
  if (report.criticalPath.totalLatencyMs !== 600) {
    throw new Error(`Critical path latency incorrect. Expected 600, got ${report.criticalPath.totalLatencyMs}`);
  }
  console.log('-> Passed');

  console.log('[Test 2] Parallelization Efficiency');
  // Wall clock time: 600ms (A(100) + C(300) + D(200))
  // Sum of durations: 100 + 50 + 300 + 200 = 650ms
  // Efficiency: 650 / 600 = 1.0833...
  if (report.parallelism.wallClockTimeMs !== 600) {
    throw new Error(`Wall clock incorrect. Expected 600, got ${report.parallelism.wallClockTimeMs}`);
  }
  if (report.parallelism.sumOfDurationsMs !== 650) {
    throw new Error(`Sum of durations incorrect. Expected 650, got ${report.parallelism.sumOfDurationsMs}`);
  }
  if (Math.abs(report.parallelism.parallelizationEfficiency - (650/600)) > 0.001) {
    throw new Error(`Efficiency incorrect. Got ${report.parallelism.parallelizationEfficiency}`);
  }
  console.log('-> Passed');

  console.log('[Test 3] Branch Analytics');
  if (report.branchStats.totalRules !== 4) throw new Error('Total rules incorrect');
  if (report.branchStats.passed !== 4) throw new Error('Passed rules incorrect');
  console.log('-> Passed');

  console.log('All Analytics tests passed.');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
