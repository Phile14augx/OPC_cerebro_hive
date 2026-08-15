import { describe, it, expect, beforeEach } from 'vitest';
import { MetaPlanner } from './MetaPlanner.js';
import { SequentialPlanner } from './SequentialPlanner.js';
import { ReActPlanner } from './ReActPlanner.js';
import { DefaultEvaluationProvider } from './DefaultEvaluationProvider.js';
import { RuntimeRegistry } from '../registry/RuntimeRegistry.js';
import { CapabilityDescriptor } from '../registry/CapabilityDescriptor.js';
import { Goal } from './Goal.js';
import { ExecutionContext } from '../context/ExecutionContext.js';

describe('MetaPlanner — evaluator produces ranked alternatives under Balanced optimization', () => {
  beforeEach(async () => {
    const registry = RuntimeRegistry.getInstance();
    await registry.clearAll();
    registry.register(
      new CapabilityDescriptor(
        { name: 'SequentialPlanner', capability: 'PlannerProvider', version: '1', priority: 10 },
        () => new SequentialPlanner()
      )
    );
    registry.register(
      new CapabilityDescriptor(
        { name: 'ReActPlanner', capability: 'PlannerProvider', version: '1', priority: 10 },
        () => new ReActPlanner()
      )
    );
    registry.register(
      new CapabilityDescriptor(
        { name: 'EvaluationProvider', capability: 'EvaluationProvider', version: '1', priority: 10 },
        () => new DefaultEvaluationProvider()
      )
    );
    registry.listCapabilities().forEach((c) => c.setHealth('Healthy'));
  });

  it('evaluates both candidate planners and logs the rejected one as an alternative', async () => {
    const metaPlanner = new MetaPlanner();
    const context = new ExecutionContext({
      executionId: 'test-exec',
      workspaceId: 'test-ws',
      tenantId: 'test-tenant',
      userId: 'test-user',
      variables: {},
      secretRefs: {},
      policies: [],
    });
    const goal: Goal = {
      id: 'g1',
      intent: 'Provision complex infrastructure',
      optimizationLevel: 'Balanced',
      budget: { maxCostUsd: 100, maxDurationMs: 50000 },
    };

    const plan = await metaPlanner.createPlan(goal, context);

    // Balanced (non-'Fast') always generates both candidates, so exactly one is
    // rejected and recorded as an alternative for traceability.
    expect(plan.alternatives).toHaveLength(1);
    expect(plan.assumptions.some((a) => a.startsWith('Selected planner archetype:'))).toBe(true);
  });
});
