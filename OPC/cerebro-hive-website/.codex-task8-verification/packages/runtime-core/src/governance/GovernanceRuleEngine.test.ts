import { describe, it, expect } from 'vitest';
import { GovernanceRuleEngine } from './GovernanceRuleEngine';
import { GovernanceContextSnapshot } from './GovernanceContextSnapshot';
import { GovernanceRule } from './GovernanceRule';
import { ExecutionPlan } from '../planning/ExecutionPlan';
import { Goal } from '../planning/Goal';

describe('GovernanceRuleEngine — Adaptive Governance Graph', () => {
  const snapshot: GovernanceContextSnapshot = {
    evaluationTime: new Date(),
    isWeekend: false,
    hourOfDay: 14,
    tenantId: 't-1',
    workspaceId: 'w-1',
  };

  const goal: Goal = {
    id: 'g-1',
    intent: 'Deploy production database',
    optimizationLevel: 'Optimal',
  };

  const plan: ExecutionPlan = {
    id: 'p-1',
    goalId: 'g-1',
    nodes: [
      {
        id: 'n-1',
        capability: 'Deploy',
        estimatedCostUsd: 50,
        estimatedDurationMs: 1000,
      },
    ],
    edges: [],
    confidence: 0.9,
    assumptions: [],
    alternatives: [],
  };

  it('executes rule-injected dynamic expansion and honors injected dependencies', async () => {
    const engine = new GovernanceRuleEngine();

    // Rule 1: Scanner — injects two new rules at runtime based on what it finds.
    const scannerRule: GovernanceRule = {
      id: 'rule.scanner',
      name: 'Document Scanner',
      description: 'Scans and finds PII',
      category: 'Security',
      stage: 'PreScoring',
      severity: 'Block',
      evaluateNative: async () => ({
        passed: true,
        expansion: {
          rules: [
            {
              id: 'rule.encryption_check',
              name: 'Encryption Validation',
              description: 'Ensures data is encrypted',
              category: 'Security',
              stage: 'PreScoring',
              severity: 'Block',
              evaluateNative: async () => true,
            },
            {
              id: 'rule.retention_policy',
              name: 'Retention Policy',
              description: 'Ensures data is retained properly',
              category: 'Compliance',
              stage: 'PreScoring',
              severity: 'Block',
              evaluateNative: async () => true,
            },
          ],
          reason: 'PII detected in payload',
        },
      }),
    };

    // Rule 2: Final Approval — depends on the scanner having run.
    const finalApproval: GovernanceRule = {
      id: 'rule.final_approval',
      name: 'Final Approval',
      description: 'Runs at the end',
      category: 'Organizational',
      stage: 'PreScoring',
      severity: 'Block',
      dependsOn: ['rule.scanner'],
      evaluateNative: async () => true,
    };

    const execution = await engine.evaluateStage('PreScoring', [finalApproval, scannerRule], plan, goal, snapshot);
    const results = execution.results;

    const scanRes = results.find((r) => r.ruleId === 'rule.scanner');
    const encRes = results.find((r) => r.ruleId === 'rule.encryption_check');
    const retRes = results.find((r) => r.ruleId === 'rule.retention_policy');
    const finalRes = results.find((r) => r.ruleId === 'rule.final_approval');

    expect(scanRes?.status).toBe('Passed');
    expect(encRes?.status).toBe('Passed');
    expect(retRes?.status).toBe('Passed');
    expect(finalRes?.status).toBe('Passed');
  });

  it('rejects a rule expansion that would inject an earlier-stage rule (cross-stage violation)', async () => {
    const engine = new GovernanceRuleEngine();

    const postScoringScanner: GovernanceRule = {
      id: 'rule.post_scanner',
      name: 'Post Scanner',
      description: 'Scans late',
      category: 'Security',
      stage: 'PostScoring',
      severity: 'Block',
      evaluateNative: async () => ({
        passed: true,
        expansion: {
          rules: [
            {
              id: 'rule.illegal_prescoring',
              name: 'Illegal PreScoring',
              description: 'Should fail validation',
              category: 'Security',
              stage: 'PreScoring',
              severity: 'Block',
            },
          ],
        },
      }),
    };

    await expect(
      engine.evaluateStage('PostScoring', [postScoringScanner], plan, goal, snapshot)
    ).rejects.toThrow(
      "Stage Violation - PreScoring Rule 'rule.illegal_prescoring' cannot depend on PostScoring Rule 'rule.post_scanner'"
    );
  });
});
