import { test, describe, beforeEach } from 'node:test';
import * as assert from 'node:assert';
import { ExperimentTracker } from '../src/domain/experiment-tracker';
import { TenantContext, TenantIsolationError, ExperimentNotFoundError } from '../src/contracts';

describe('ExperimentTracker', () => {
  let tracker: ExperimentTracker;
  let ctx: TenantContext;
  let otherCtx: TenantContext;

  beforeEach(() => {
    tracker = new ExperimentTracker();
    ctx = { tenantId: 'tenant-1', userId: 'user-1' };
    otherCtx = { tenantId: 'tenant-2', userId: 'user-2' };
  });

  test('should create an experiment and enforce tenant isolation', () => {
    const exp = tracker.createExperiment(ctx, 'session-1', 'Exp 1', { optimizer: 'adam', batchSize: 32, epochs: 10, learningRate: 0.01 });
    
    assert.strictEqual(exp.name, 'Exp 1');
    assert.strictEqual(exp.tenantId, ctx.tenantId);
    assert.strictEqual(exp.sessionId, 'session-1');
  });

  test('should retrieve an experiment for the same tenant', () => {
    const created = tracker.createExperiment(ctx, 'session-1', 'Exp 1', { optimizer: 'adam', batchSize: 32, epochs: 10, learningRate: 0.01 });
    const fetched = tracker.getExperiment(ctx, created.id);
    assert.strictEqual(fetched.id, created.id);
  });

  test('should not retrieve an experiment from a different tenant', () => {
    const created = tracker.createExperiment(ctx, 'session-1', 'Exp 1', { optimizer: 'adam', batchSize: 32, epochs: 10, learningRate: 0.01 });
    assert.throws(() => {
      tracker.getExperiment(otherCtx, created.id);
    }, ExperimentNotFoundError);
  });

  test('should list experiments for a session', () => {
    tracker.createExperiment(ctx, 'session-1', 'Exp 1', { optimizer: 'adam', batchSize: 32, epochs: 10, learningRate: 0.01 });
    tracker.createExperiment(ctx, 'session-1', 'Exp 2', { optimizer: 'sgd', batchSize: 16, epochs: 5, learningRate: 0.1 });
    tracker.createExperiment(ctx, 'session-2', 'Exp 3', { optimizer: 'adam', batchSize: 32, epochs: 10, learningRate: 0.01 });

    const session1Exps = tracker.listExperiments(ctx, 'session-1');
    assert.strictEqual(session1Exps.length, 2);
  });

  test('should record metrics', () => {
    const exp = tracker.createExperiment(ctx, 'session-1', 'Exp 1', { optimizer: 'adam', batchSize: 32, epochs: 10, learningRate: 0.01 });
    tracker.recordMetrics(ctx, exp.id, { loss: 0.5, accuracy: 0.8 });
    
    const updated = tracker.getExperiment(ctx, exp.id);
    assert.strictEqual(updated.metrics.loss, 0.5);
    assert.strictEqual(updated.metrics.accuracy, 0.8);
  });

  test('should delete experiment', () => {
    const exp = tracker.createExperiment(ctx, 'session-1', 'Exp 1', { optimizer: 'adam', batchSize: 32, epochs: 10, learningRate: 0.01 });
    const success = tracker.deleteExperiment(ctx, exp.id);
    assert.strictEqual(success, true);
    
    assert.throws(() => {
      tracker.getExperiment(ctx, exp.id);
    }, ExperimentNotFoundError);
  });
});
