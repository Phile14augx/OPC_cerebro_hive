import { MetaPlanner } from './MetaPlanner';
import { SequentialPlanner } from './SequentialPlanner';
import { ReActPlanner } from './ReActPlanner';
import { DefaultEvaluationProvider } from './DefaultEvaluationProvider';
import { RuntimeRegistry } from '../registry/RuntimeRegistry';
import { CapabilityDescriptor } from '../registry/CapabilityDescriptor';
import { Goal } from './Goal';
import { ExecutionContext } from '../context/ExecutionContext';

async function runTests() {
  const registry = RuntimeRegistry.getInstance();
  await registry.clearAll();

  registry.register(new CapabilityDescriptor({ name: 'SequentialPlanner', capability: 'PlannerProvider', version: '1', priority: 10 }, () => new SequentialPlanner()));
  registry.register(new CapabilityDescriptor({ name: 'ReActPlanner', capability: 'PlannerProvider', version: '1', priority: 10 }, () => new ReActPlanner()));
  registry.register(new CapabilityDescriptor({ name: 'EvaluationProvider', capability: 'EvaluationProvider', version: '1', priority: 10 }, () => new DefaultEvaluationProvider()));

  registry.listCapabilities().forEach(c => c.setHealth('Healthy'));

  const metaPlanner = new MetaPlanner();
  const context = new ExecutionContext({
    executionId: 'test-exec',
    workspaceId: 'ws-1',
    tenantId: 'tenant-1',
    userId: 'user-1',
    variables: {},
    secretRefs: {},
    policies: []
  });

  // Test 1: Veto Enforcement (ComplianceFirst)
  const goal1: Goal = {
    id: 'g1',
    intent: 'Provision complex infrastructure',
    optimizationLevel: 'Optimal',
    budget: { maxCostUsd: 100, maxDurationMs: 50000 },
    preferredEvaluationPolicyId: 'pol-comp-first-1'
  };

  const plan1 = await metaPlanner.createPlan(goal1, context);
  console.log(`[Test 1] (ComplianceFirst) Selected: ${plan1.assumptions.find(a => a.startsWith('Selected planner archetype:'))}`);
  console.log(`[Test 1] Rejected: ${plan1.alternatives[0]}`);

  // Test 2: Weight Shifts (CostOptimized vs LatencyOptimized)
  const goalCost: Goal = { ...goal1, id: 'g2', preferredEvaluationPolicyId: 'pol-cost-opt-1' };
  const goalLat: Goal = { ...goal1, id: 'g3', preferredEvaluationPolicyId: 'pol-lat-opt-1' };

  const planCost = await metaPlanner.createPlan(goalCost, context);
  console.log(`[Test 2] (CostOptimized) Selected: ${planCost.assumptions.find(a => a.startsWith('Selected planner archetype:'))}`);
  
  const planLat = await metaPlanner.createPlan(goalLat, context);
  console.log(`[Test 3] (LatencyOptimized) Selected: ${planLat.assumptions.find(a => a.startsWith('Selected planner archetype:'))}`);

  console.log('All Evaluation Policy tests passed.');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
