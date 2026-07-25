import { GovernanceRuleEngine } from './GovernanceRuleEngine';
import { GovernanceContextSnapshot } from './GovernanceContextSnapshot';
import { GovernanceRule } from './GovernanceRule';
import { ExecutionPlan } from '../planning/ExecutionPlan';
import { Goal } from '../planning/Goal';
import { GovernanceGraphValidator } from './GovernanceGraphValidator';

async function runTests() {
  const engine = new GovernanceRuleEngine();
  
  const snapshot: GovernanceContextSnapshot = {
    evaluationTime: new Date(),
    isWeekend: false, // Weekday
    hourOfDay: 14,
    tenantId: 't-1',
    workspaceId: 'w-1'
  };

  const goal: Goal = {
    id: 'g-1',
    intent: 'Deploy production database',
    optimizationLevel: 'Optimal'
  };

  const plan: ExecutionPlan = {
    id: 'p-1',
    goalId: 'g-1',
    nodes: [{
      id: 'n-1',
      capability: 'Deploy',
      estimatedCostUsd: 50,
      estimatedDurationMs: 1000
    }],
    edges: [],
    confidence: 0.9,
    assumptions: [],
    alternatives: []
  };

  // Rule 1: Scanner (Injects new rules)
  const scannerRule: GovernanceRule = {
    id: 'rule.scanner',
    name: 'Document Scanner',
    description: 'Scans and finds PII',
    category: 'Security',
    stage: 'PreScoring',
    severity: 'Block',
    evaluateNative: async () => {
      // Discover PII and inject new rules
      return {
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
              evaluateNative: async () => true // Assume passes
            },
            {
              id: 'rule.retention_policy',
              name: 'Retention Policy',
              description: 'Ensures data is retained properly',
              category: 'Compliance',
              stage: 'PreScoring',
              severity: 'Block',
              evaluateNative: async () => true // Assume passes
            }
          ],
          reason: 'PII detected in payload'
        }
      };
    }
  };

  // Rule 2: Final Approval (Depends on everything)
  const finalApproval: GovernanceRule = {
    id: 'rule.final_approval',
    name: 'Final Approval',
    description: 'Runs at the end',
    category: 'Organizational',
    stage: 'PreScoring',
    severity: 'Block',
    dependsOn: ['rule.scanner'], // Initially only depends on scanner
    evaluateNative: async () => true
  };

  const rules = [finalApproval, scannerRule];

  // Execute PreScoring
  const preExecution = await engine.evaluateStage('PreScoring', rules, plan, goal, snapshot);
  const preResults = preExecution.results;
  
  console.log('[Test 1] Dynamic Expansion Execution');
  const scanRes = preResults.find(r => r.ruleId === 'rule.scanner');
  const encRes = preResults.find(r => r.ruleId === 'rule.encryption_check');
  const retRes = preResults.find(r => r.ruleId === 'rule.retention_policy');
  const finalRes = preResults.find(r => r.ruleId === 'rule.final_approval');

  if (!scanRes || scanRes.status !== 'Passed') throw new Error('Scanner should have passed');
  if (!encRes || encRes.status !== 'Passed') throw new Error('Injected Encryption Check should have passed');
  if (!retRes || retRes.status !== 'Passed') throw new Error('Injected Retention Policy should have passed');
  if (!finalRes || finalRes.status !== 'Passed') throw new Error('Final approval should have passed');
  
  // Verify automatic dependency injection
  const encryptionRule = preResults.find(r => r.ruleId === 'rule.encryption_check');
  if (!encryptionRule) throw new Error('Encryption rule not in results');
  console.log('-> Passed\n');

  // Test 2: Cross-Stage Expansion Violation (PostScoring injecting PreScoring)
  console.log('[Test 2] Cross-Stage Reverse Expansion Violation');
  
  const postScoringScanner: GovernanceRule = {
    id: 'rule.post_scanner',
    name: 'Post Scanner',
    description: 'Scans late',
    category: 'Security',
    stage: 'PostScoring',
    severity: 'Block',
    evaluateNative: async () => {
      return {
        passed: true,
        expansion: {
          rules: [{
            id: 'rule.illegal_prescoring',
            name: 'Illegal PreScoring',
            description: 'Should fail validation',
            category: 'Security',
            stage: 'PreScoring',
            severity: 'Block'
          }]
        }
      };
    }
  };

  try {
    const postExecution = await engine.evaluateStage('PostScoring', [postScoringScanner], plan, goal, snapshot);
    const postResults = postExecution.results;
    throw new Error('Engine failed to throw cross-stage violation');
  } catch (err: any) {
    if (err.message.includes('Stage Violation - PreScoring Rule \'rule.illegal_prescoring\' cannot depend on PostScoring Rule \'rule.post_scanner\'')) {
      console.log('-> Passed\n');
    } else {
      throw new Error(`Unexpected error message: ${err.message}`);
    }
  }

  console.log('All Adaptive Governance Graph tests passed.');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
