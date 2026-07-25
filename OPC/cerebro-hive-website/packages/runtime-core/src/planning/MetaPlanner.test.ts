import { MetaPlanner } from './MetaPlanner';
import { SequentialPlanner } from './SequentialPlanner';
import { ReActPlanner } from './ReActPlanner';
import { RuntimeRegistry } from '../registry/RuntimeRegistry';
import { CapabilityDescriptor } from '../registry/CapabilityDescriptor';
import { Goal } from './Goal';
import { ExecutionContext } from '../context/ExecutionContext';

async function runTests() {
  const registry = RuntimeRegistry.getInstance();
  await registry.clearAll();

  // Register planners
  registry.register(new CapabilityDescriptor({
    name: 'SequentialPlanner',
    capability: 'PlannerProvider',
    version: '1',
    priority: 10
  }, () => new SequentialPlanner()));

  registry.register(new CapabilityDescriptor({
    name: 'ReActPlanner',
    capability: 'PlannerProvider',
    version: '1',
    priority: 10
  }, () => new ReActPlanner()));
  registry.listCapabilities().forEach(c => c.setHealth('Healthy'));

  const metaPlanner = new MetaPlanner();
  const context = new ExecutionContext({
    executionId: 'test-exec-1',
    workspaceId: 'test-ws',
    tenantId: 'test-tenant',
    userId: 'test-user',
    variables: {},
    secretRefs: {},
    policies: []
  });

  // Test 1: Linear Goal
  const linearGoal: Goal = {
    id: 'g1',
    intent: 'Provision a new S3 bucket',
  };

  const plan1 = await metaPlanner.createPlan(linearGoal, context);
  if (!plan1.assumptions.some(a => a.includes('SequentialPlanner'))) {
    throw new Error('MetaPlanner failed to select SequentialPlanner for linear goal');
  }
  console.log('[Test 1] MetaPlanner correctly selected SequentialPlanner');
  
  // Test 2: Investigation Goal
  const investigateGoal: Goal = {
    id: 'g2',
    intent: 'Investigate the root cause of high latency in production',
  };

  const plan2 = await metaPlanner.createPlan(investigateGoal, context);
  if (!plan2.assumptions.some(a => a.includes('ReActPlanner'))) {
    throw new Error('MetaPlanner failed to select ReActPlanner for investigate goal');
  }
  console.log('[Test 2] MetaPlanner correctly selected ReActPlanner');
  
  console.log('All planner tests passed.');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
