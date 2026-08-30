// ─── Experiment Tracker ───────────────────────────────────────────────────────
// In-memory experiment store, tenant-isolated.

import {
  TenantContext,
  Experiment,
  ExperimentMetrics,
  HyperparameterConfig,
  TenantIsolationError,
  ExperimentNotFoundError,
} from '../contracts';

function requireTenant(ctx: TenantContext | undefined, op: string): TenantContext {
  if (!ctx || !ctx.tenantId) throw new TenantIsolationError(op);
  return ctx;
}

let _seq = 0;
function newExperimentId(): string {
  return `exp_${Date.now()}_${++_seq}`;
}

export class ExperimentTracker {
  /** tenantId → experimentId → Experiment */
  private readonly store = new Map<string, Map<string, Experiment>>();

  private tenantStore(tenantId: string): Map<string, Experiment> {
    if (!this.store.has(tenantId)) {
      this.store.set(tenantId, new Map());
    }
    return this.store.get(tenantId)!;
  }

  /** Create a new experiment scoped to a session. */
  createExperiment(
    ctx: TenantContext,
    sessionId: string,
    name: string,
    hyperparameters: HyperparameterConfig,
    tags: string[] = [],
  ): Experiment {
    requireTenant(ctx, 'createExperiment');
    const now = new Date();
    const experiment: Experiment = {
      id: newExperimentId(),
      tenantId: ctx.tenantId,
      sessionId,
      name,
      hyperparameters,
      metrics: {},
      createdAt: now,
      updatedAt: now,
      tags,
    };
    this.tenantStore(ctx.tenantId).set(experiment.id, experiment);
    return experiment;
  }

  /** Retrieve an experiment by id, enforcing tenant isolation. */
  getExperiment(ctx: TenantContext, experimentId: string): Experiment {
    requireTenant(ctx, 'getExperiment');
    const exp = this.tenantStore(ctx.tenantId).get(experimentId);
    if (!exp) throw new ExperimentNotFoundError(experimentId);
    return exp;
  }

  /** List all experiments for a session, scoped to tenant. */
  listExperiments(ctx: TenantContext, sessionId: string): Experiment[] {
    requireTenant(ctx, 'listExperiments');
    const results: Experiment[] = [];
    for (const exp of this.tenantStore(ctx.tenantId).values()) {
      if (exp.sessionId === sessionId) results.push(exp);
    }
    return results;
  }

  /** Record metrics on an existing experiment. */
  recordMetrics(
    ctx: TenantContext,
    experimentId: string,
    metrics: ExperimentMetrics,
  ): Experiment {
    requireTenant(ctx, 'recordMetrics');
    const exp = this.getExperiment(ctx, experimentId);
    exp.metrics = { ...exp.metrics, ...metrics };
    exp.updatedAt = new Date();
    return exp;
  }

  /** Delete an experiment (idempotent). */
  deleteExperiment(ctx: TenantContext, experimentId: string): boolean {
    requireTenant(ctx, 'deleteExperiment');
    return this.tenantStore(ctx.tenantId).delete(experimentId);
  }
}
