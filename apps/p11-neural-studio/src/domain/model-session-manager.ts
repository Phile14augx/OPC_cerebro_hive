import {
  ModelSession,
  TenantContext,
  SessionLifecycleState,
  TenantIsolationError,
  SessionNotFoundError,
} from '../contracts';
import { SessionStateMachine } from './session-state-machine';

function requireTenant(ctx: TenantContext | undefined, op: string): TenantContext {
  if (!ctx || !ctx.tenantId) throw new TenantIsolationError(op);
  return ctx;
}

let _seq = 0;
function newSessionId(): string {
  return `session_${Date.now()}_${++_seq}`;
}

export class ModelSessionManager {
  /** tenantId -> sessionId -> ModelSession */
  private readonly store = new Map<string, Map<string, ModelSession>>();

  private tenantStore(tenantId: string): Map<string, ModelSession> {
    if (!this.store.has(tenantId)) {
      this.store.set(tenantId, new Map());
    }
    return this.store.get(tenantId)!;
  }

  createSession(ctx: TenantContext, options: { name: string; description?: string }): ModelSession {
    requireTenant(ctx, 'createSession');
    const now = new Date();
    const session: ModelSession = {
      id: newSessionId(),
      tenantId: ctx.tenantId,
      createdBy: ctx.userId,
      name: options.name,
      description: options.description,
      state: 'CREATED',
      experimentIds: [],
      createdAt: now,
      updatedAt: now,
    };

    this.tenantStore(ctx.tenantId).set(session.id, session);
    return session;
  }

  getSession(ctx: TenantContext, sessionId: string): ModelSession {
    requireTenant(ctx, 'getSession');
    const session = this.tenantStore(ctx.tenantId).get(sessionId);
    if (!session) {
      throw new SessionNotFoundError(sessionId);
    }
    return session;
  }

  listSessions(ctx: TenantContext): ModelSession[] {
    requireTenant(ctx, 'listSessions');
    return Array.from(this.tenantStore(ctx.tenantId).values());
  }

  transitionState(ctx: TenantContext, sessionId: string, nextState: SessionLifecycleState): ModelSession {
    requireTenant(ctx, 'transitionState');
    const session = this.getSession(ctx, sessionId);
    
    // Validates and throws if transition is invalid
    const newState = SessionStateMachine.transition(session.state, nextState);
    
    session.state = newState;
    session.updatedAt = new Date();
    
    return session;
  }

  updateSession(ctx: TenantContext, sessionId: string, patch: Partial<Pick<ModelSession, 'name' | 'description' | 'metadata' | 'hyperparameters'>>): ModelSession {
    requireTenant(ctx, 'updateSession');
    const session = this.getSession(ctx, sessionId);
    
    if (patch.name !== undefined) session.name = patch.name;
    if (patch.description !== undefined) session.description = patch.description;
    if (patch.metadata !== undefined) session.metadata = patch.metadata;
    if (patch.hyperparameters !== undefined) session.hyperparameters = patch.hyperparameters;
    
    session.updatedAt = new Date();
    
    return session;
  }

  addExperiment(ctx: TenantContext, sessionId: string, experimentId: string): ModelSession {
    requireTenant(ctx, 'addExperiment');
    const session = this.getSession(ctx, sessionId);
    
    if (!session.experimentIds.includes(experimentId)) {
      session.experimentIds.push(experimentId);
      session.updatedAt = new Date();
    }
    
    return session;
  }
}
