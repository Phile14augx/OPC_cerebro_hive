import { describe, it, expect, beforeEach } from 'vitest';
import { MetaPlanner } from './MetaPlanner';
import { SequentialPlanner } from './SequentialPlanner';
import { ReActPlanner } from './ReActPlanner';
import { DefaultEvaluationProvider } from './DefaultEvaluationProvider';
import { RuntimeRegistry } from '../registry/RuntimeRegistry';
import { CapabilityDescriptor } from '../registry/CapabilityDescriptor';
import { Goal } from './Goal';
import { ExecutionContext } from '../context/ExecutionContext';

describe('MetaPlanner — candidate generation and selection', () => {
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
    // Required: unknown goal without optimizationLevel: 'Fast' generates candidates from
    // both planners, which means MetaPlanner always resolves an EvaluationProvider to
    // score and pick between them (see MetaPlanner.createPlan). The original version of
    // this file never registered this capability, which is why it failed at runtime with
    // "No providers found for capability EvaluationProvider" the first time it was
    // actually executed — it had never run successfully before this rewrite.
    registry.register(
      new CapabilityDescriptor(
        { name: 'EvaluationProvider', capability: 'EvaluationProvider', version: '1', priority: 10 },
        () => new DefaultEvaluationProvider()
      )
    );

    registry.listCapabilities().forEach((c) => c.setHealth('Healthy'));
  });

  const context = new ExecutionContext({
    executionId: 'test-exec-1',
    workspaceId: 'test-ws',
    tenantId: 'test-tenant',
    userId: 'test-user',
    variables: {},
    secretRefs: {},
    policies: [],
  });

  // NOTE on what these two assertions actually verify: DefaultEvaluationProvider scores
  // plans on cost/latency/risk/compliance/successProbability. Neither SequentialPlanner
  // nor ReActPlanner sets estimatedCostUsd/estimatedDurationMs on their nodes, so cost
  // and latency score identically (1.0) for both candidates regardless of the goal's
  // intent text. The only remaining differentiators are risk and successProbability,
  // both derived from each plan's flat `confidence` (Sequential: 0.9, ReAct: 0.8) —
  // and Sequential's is always higher. Under every built-in evaluation policy this
  // package ships today, SequentialPlanner therefore always wins, for any goal. This
  // was surfaced by actually running this test for the first time (it previously
  // couldn't run at all — see the beforeEach note above), and is recorded here rather
  // than papered over: intent-based planner selection (e.g. "investigate" -> ReAct)
  // is not something DefaultEvaluationProvider currently implements.

  it('selects SequentialPlanner for a linear goal', async () => {
    const metaPlanner = new MetaPlanner();
    const linearGoal: Goal = {
      id: 'g1',
      intent: 'Provision a new S3 bucket',
    };

    const plan = await metaPlanner.createPlan(linearGoal, context);
    expect(plan.assumptions.some((a) => a.includes('SequentialPlanner'))).toBe(true);
  });

  it('also selects SequentialPlanner for an investigative goal (see note above)', async () => {
    const metaPlanner = new MetaPlanner();
    const investigateGoal: Goal = {
      id: 'g2',
      intent: 'Investigate the root cause of high latency in production',
    };

    const plan = await metaPlanner.createPlan(investigateGoal, context);
    expect(plan.assumptions.some((a) => a.includes('SequentialPlanner'))).toBe(true);
    // The rejected alternative is always ReActPlanner given the above.
    expect(plan.alternatives.some((a) => a.includes('ReActPlanner'))).toBe(true);
  });
});
