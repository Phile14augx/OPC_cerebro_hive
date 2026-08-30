import { test, describe, beforeEach } from 'node:test';
import * as assert from 'node:assert';
import { ModelSessionManager } from '../src/domain/model-session-manager';
import { TenantContext, SessionLifecycleState, InvalidTransitionError, TenantIsolationError, SessionNotFoundError } from '../src/contracts';

describe('ModelSessionManager', () => {
  let manager: ModelSessionManager;
  let ctx: TenantContext;
  let otherCtx: TenantContext;

  beforeEach(() => {
    manager = new ModelSessionManager();
    ctx = { tenantId: 'tenant-1', userId: 'user-1' };
    otherCtx = { tenantId: 'tenant-2', userId: 'user-2' };
  });

  test('should create a model session and enforce tenant isolation', () => {
    const session = manager.createSession(ctx, { name: 'My Session', description: 'Test session' });
    
    assert.strictEqual(session.name, 'My Session');
    assert.strictEqual(session.description, 'Test session');
    assert.strictEqual(session.tenantId, ctx.tenantId);
    assert.strictEqual(session.createdBy, ctx.userId);
    assert.strictEqual(session.state, 'CREATED');
    assert.deepStrictEqual(session.experimentIds, []);
    assert.ok(session.id);
    assert.ok(session.createdAt);
    assert.ok(session.updatedAt);
  });

  test('should retrieve a created session for the same tenant', () => {
    const created = manager.createSession(ctx, { name: 'Get Session' });
    const fetched = manager.getSession(ctx, created.id);
    assert.strictEqual(fetched.id, created.id);
  });

  test('should not retrieve a session from a different tenant', () => {
    const created = manager.createSession(ctx, { name: 'Tenant isolated' });
    assert.throws(() => {
      manager.getSession(otherCtx, created.id);
    }, SessionNotFoundError);
  });

  test('should fail to create without TenantContext', () => {
    assert.throws(() => {
      // @ts-expect-error Testing missing context
      manager.createSession(undefined, { name: 'Invalid' });
    }, TenantIsolationError);
  });

  test('should update session state and throw on invalid transitions', () => {
    const session = manager.createSession(ctx, { name: 'State Test' });
    assert.strictEqual(session.state, 'CREATED');

    manager.transitionState(ctx, session.id, 'RUNNING');
    const runningSession = manager.getSession(ctx, session.id);
    assert.strictEqual(runningSession.state, 'RUNNING');

    manager.transitionState(ctx, session.id, 'PAUSED');
    const pausedSession = manager.getSession(ctx, session.id);
    assert.strictEqual(pausedSession.state, 'PAUSED');

    // Invalid transition
    assert.throws(() => {
      manager.transitionState(ctx, session.id, 'CREATED');
    }, InvalidTransitionError);
  });

  test('should update session properties', () => {
    const session = manager.createSession(ctx, { name: 'Old Name' });
    manager.updateSession(ctx, session.id, { name: 'New Name' });
    
    const updated = manager.getSession(ctx, session.id);
    assert.strictEqual(updated.name, 'New Name');
  });

  test('should list sessions for a specific tenant only', () => {
    manager.createSession(ctx, { name: 'Session 1' });
    manager.createSession(ctx, { name: 'Session 2' });
    manager.createSession(otherCtx, { name: 'Other Session' });

    const tenant1Sessions = manager.listSessions(ctx);
    const tenant2Sessions = manager.listSessions(otherCtx);

    assert.strictEqual(tenant1Sessions.length, 2);
    assert.strictEqual(tenant2Sessions.length, 1);
    assert.strictEqual(tenant2Sessions[0].name, 'Other Session');
  });

  test('should add experiment to session', () => {
    const session = manager.createSession(ctx, { name: 'Session 1' });
    manager.addExperiment(ctx, session.id, 'exp-123');
    
    const updated = manager.getSession(ctx, session.id);
    assert.deepStrictEqual(updated.experimentIds, ['exp-123']);
  });
});
