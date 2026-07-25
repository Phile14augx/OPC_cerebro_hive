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
    workspaceId: 'test-ws',
    tenantId: 'test-tenant',
    userId: 'test-user',
    variables: {},
    secretRefs: {},
    policies: []
  });

  // Test: Balanced Optimization (Competition enabled)
  const goal: Goal = {
    id: 'g1',
    intent: 'Provision complex infrastructure',
    optimizationLevel: 'Balanced',
    budget: { maxCostUsd: 100, maxDurationMs: 50000 }
  };

  const plan = await metaPlanner.createPlan(goal, context);
  
  if (plan.alternatives.length === 0) {
    throw new Error('MetaPlanner failed to generate alternatives in Balanced mode.');
  }
  
  console.log(`[Test] MetaPlanner evaluated multiple plans and selected: ${plan.assumptions.find(a => a.startsWith('Selected planner archetype:'))}`);
  console.log(`[Test] Rejected Alternatives logged: ${plan.alternatives.length}`);
  console.log(`[Test] Rejected Reason: ${plan.alternatives[0]}`);

  console.log('All Evaluation tests passed.');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
