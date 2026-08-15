import { describe, it, expect, beforeEach } from 'vitest';
import { MetaPlanner } from './MetaPlanner.js';
import { SequentialPlanner } from './SequentialPlanner.js';
import { ReActPlanner } from './ReActPlanner.js';
import { DefaultEvaluationProvider } from './DefaultEvaluationProvider.js';
import { RuntimeRegistry } from '../registry/RuntimeRegistry.js';
import { CapabilityDescriptor } from '../registry/CapabilityDescriptor.js';
import { PolicyResolver } from './PolicyResolver.js';
import { Goal } from './Goal.js';
import { ExecutionContext } from '../context/ExecutionContext.js';

describe('EvaluationPolicy — ComplianceFirst veto threshold', () => {
  it('composes a hard minComplianceScore veto from ComplianceFirst', () => {
    const context = new ExecutionContext({
      executionId: 'test-exec',
      workspaceId: 'ws-1',
      tenantId: 'tenant-1',
      userId: 'user-1',
      variables: {},
      secretRefs: {},
      policies: [],
    });
    const goal: Goal = {
      id: 'g1',
      intent: 'Provision complex infrastructure',
      optimizationLevel: 'Optimal',
      budget: { maxCostUsd: 100, maxDurationMs: 50000 },
      preferredEvaluationPolicyId: 'pol-comp-first-1',
    };

    const composite = PolicyResolver.resolve(goal, context);
    expect(composite.vetoThresholds?.minComplianceScore).toBe(1.0);
    expect(composite.provenance.vetoSources.minComplianceScore).toBe('Compliance First');
  });

  it('does not veto DefaultEvaluationProvider plans in practice, since compliance is simulated at exactly the threshold', async () => {
    // DefaultEvaluationProvider currently hardcodes complianceScore = 1.0 for every plan
    // ("Simulated" per its own comment) and the veto condition is a strict `<` against
    // the threshold. ComplianceFirst's minComplianceScore of 1.0 can therefore never
    // trigger the veto (1.0 < 1.0 is false) until compliance scoring is wired to
    // something real. Documented here as a real, current-code finding rather than
    // asserting the veto fires, which it does not.
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

    const metaPlanner = new MetaPlanner();
    const context = new ExecutionContext({
      executionId: 'test-exec',
      workspaceId: 'ws-1',
      tenantId: 'tenant-1',
      userId: 'user-1',
      variables: {},
      secretRefs: {},
      policies: [],
    });
    const goal: Goal = {
      id: 'g1',
      intent: 'Provision complex infrastructure',
      optimizationLevel: 'Optimal',
      budget: { maxCostUsd: 100, maxDurationMs: 50000 },
      preferredEvaluationPolicyId: 'pol-comp-first-1',
    };

    const plan = await metaPlanner.createPlan(goal, context);
    expect(plan.assumptions.some((a) => a.startsWith('Selected planner archetype:'))).toBe(true);
  });
});

describe('EvaluationPolicy — CostOptimized vs LatencyOptimized composition', () => {
  it('CostOptimized conflicts with the platform default tie-resolution strategy', () => {
    const context = new ExecutionContext({
      executionId: 'test-exec',
      workspaceId: 'ws-1',
      tenantId: 'tenant-1',
      userId: 'user-1',
      variables: {},
      secretRefs: {},
      policies: [],
    });
    const goal: Goal = { id: 'g2', intent: 'x', preferredEvaluationPolicyId: 'pol-cost-opt-1' };

    const composite = PolicyResolver.resolve(goal, context);
    // Balanced defaults to LowestRisk; CostOptimized's LowestCost conflicts with it,
    // so PolicyResolver escalates rather than silently picking either.
    expect(composite.tieResolution).toBe('NeedsApproval');
  });

  it('LatencyOptimized does not conflict with the platform default (both are LowestRisk)', () => {
    const context = new ExecutionContext({
      executionId: 'test-exec',
      workspaceId: 'ws-1',
      tenantId: 'tenant-1',
      userId: 'user-1',
      variables: {},
      secretRefs: {},
      policies: [],
    });
    const goal: Goal = { id: 'g3', intent: 'x', preferredEvaluationPolicyId: 'pol-lat-opt-1' };

    const composite = PolicyResolver.resolve(goal, context);
    expect(composite.tieResolution).toBe('LowestRisk');
    expect(composite.provenance.tieResolutionSource).toBe('Latency Optimized');
    // Latency's own weight dominates the composite once the goal's higher-precedence
    // multiplier is applied.
    expect(composite.customWeights!.latency).toBeGreaterThan(composite.customWeights!.cost);
  });
});
