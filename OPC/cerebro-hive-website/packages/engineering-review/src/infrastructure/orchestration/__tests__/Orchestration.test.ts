import { describe, expect, it } from 'vitest';
import { ExecutionPlanner } from '../ExecutionPlanner';
import { CoordinatorStateMachine } from '../CoordinatorStateMachine';
import { RetryClassifier } from '../RetryClassifier';
import { AnalyzerExecutionRequest } from '../../analyzers/models';

describe('Orchestration (M26.8)', () => {
  it('ExecutionPlanner generates a flat DAG for independent analyzers', () => {
    const planner = new ExecutionPlanner();
    const req1 = { executionId: 'exec-1', targetArtifacts: [], limits: {} as any, context: {} };
    const req2 = { executionId: 'exec-2', targetArtifacts: [], limits: {} as any, context: {} };
    
    const plan = planner.buildPlan([req1, req2]);
    
    expect(plan.nodes).toHaveLength(2);
    expect(plan.dependencies).toHaveLength(0); // Independent execution
  });

  it('CoordinatorStateMachine rejects illegal transitions', () => {
    const sm = new CoordinatorStateMachine();
    expect(sm.getState()).toBe('Planning');
    
    sm.transitionTo('Queued');
    sm.transitionTo('Scheduling');
    
    // Cannot skip Executing and go straight to Completed
    expect(() => sm.transitionTo('Completed')).toThrowError(/Illegal state transition/);
  });

  it('RetryClassifier returns backoff for transient timeouts', () => {
    const classifier = new RetryClassifier();
    
    const decision = classifier.classify({
      failureReason: 'Timeout',
      analyzerId: 'semgrep',
      runtimeType: 'LocalProcessRuntime',
      attemptCount: 1,
      durationMs: 30000
    });

    expect(decision.decision).toBe('RetryWithBackoff');
    expect(decision.backoffMs).toBe(5000);
  });

  it('RetryClassifier rejects terminal policy violations', () => {
    const classifier = new RetryClassifier();
    
    const decision = classifier.classify({
      failureReason: 'PolicyViolation',
      analyzerId: 'trivy',
      runtimeType: 'LocalProcessRuntime',
      attemptCount: 1,
      durationMs: 1000
    });

    expect(decision.decision).toBe('DoNotRetry');
  });
});
