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

describe('PolicyResolver — composite policy precedence (Platform < Tenant/Workspace < Goal)', () => {
  it('composes Balanced + context policies + goal override in precedence order', () => {
    // context supplies CostOptimized then ComplianceFirst; goal overrides with LatencyOptimized.
    const context = new ExecutionContext({
      executionId: 'test-exec',
      workspaceId: 'ws-1',
      tenantId: 'tenant-1',
      userId: 'user-1',
      variables: {},
      secretRefs: {},
      policies: ['pol-cost-opt-1', 'pol-comp-first-1'],
    });

    const goal: Goal = {
      id: 'g1',
      intent: 'Provision complex infrastructure',
      optimizationLevel: 'Optimal',
      budget: { maxCostUsd: 100, maxDurationMs: 50000 },
      preferredEvaluationPolicyId: 'pol-lat-opt-1',
    };

    const composite = PolicyResolver.resolve(goal, context);

    // Precedence order is preserved: Balanced (platform default), then context
    // policies in the order given, then the goal override last.
    expect(composite.sourcePolicies).toEqual([
      'pol-bal-1',
      'pol-cost-opt-1',
      'pol-comp-first-1',
      'pol-lat-opt-1',
    ]);

    // Vetoes are monotonic: ComplianceFirst's minComplianceScore is the only one set,
    // so it survives composition even though it isn't the highest-precedence policy.
    expect(composite.vetoThresholds?.minComplianceScore).toBe(1.0);
    expect(composite.provenance.vetoSources.minComplianceScore).toBe('Compliance First');

    // Tie-resolution strategy conflicts across the composed policies (LowestRisk ->
    // LowestCost -> NeedsApproval -> LowestRisk), which PolicyResolver escalates to
    // NeedsApproval rather than silently picking one.
    expect(composite.tieResolution).toBe('NeedsApproval');
    expect(composite.provenance.tieResolutionSource).toBe('Conflict Escalation (NeedsApproval)');

    // Weights are composed as a precedence-weighted average (higher-precedence policies
    // get a larger multiplier) and always renormalize to sum to 1.
    const weightSum = Object.values(composite.customWeights!).reduce((a, b) => a + b, 0);
    expect(weightSum).toBeCloseTo(1, 5);
    // Latency (from the goal-level override, highest precedence/multiplier) ends up
    // the single largest weight.
    const weights = composite.customWeights!;
    expect(weights.latency).toBeGreaterThan(weights.cost);
    expect(weights.latency).toBeGreaterThan(weights.risk);
    expect(weights.latency).toBeGreaterThan(weights.compliance);
    expect(weights.latency).toBeGreaterThan(weights.successProbability);
  });
});

describe('MetaPlanner — end-to-end with a composed policy', () => {
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

  it('runs cleanly under a composed multi-policy context and produces a decision with rejected alternatives', async () => {
    const metaPlanner = new MetaPlanner();
    const context = new ExecutionContext({
      executionId: 'test-exec',
      workspaceId: 'ws-1',
      tenantId: 'tenant-1',
      userId: 'user-1',
      variables: {},
      secretRefs: {},
      policies: ['pol-cost-opt-1', 'pol-comp-first-1'],
    });
    const goal: Goal = {
      id: 'g1',
      intent: 'Provision complex infrastructure',
      optimizationLevel: 'Optimal',
      budget: { maxCostUsd: 100, maxDurationMs: 50000 },
      preferredEvaluationPolicyId: 'pol-lat-opt-1',
    };

    const plan = await metaPlanner.createPlan(goal, context);

    expect(plan.assumptions.some((a) => a.startsWith('Selected planner archetype:'))).toBe(true);
    expect(plan.alternatives).toHaveLength(1);
    expect(plan.alternatives[0]).toContain('Rejected ReActPlanner');
  });
});
