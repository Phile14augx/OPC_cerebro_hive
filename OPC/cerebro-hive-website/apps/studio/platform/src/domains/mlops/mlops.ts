import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import { PlatformError } from "../../kernel/errors/errors.js";

/**
 * Cerebro MLOps™ — experiment tracking (MLflow-style), model version
 * lineage with promotion gates (Kubeflow/KServe-style stage/prod
 * separation), a feature registry (Feast-style), serving-endpoint
 * registry (BentoML/Ray Serve-style), and deterministic drift detection.
 */

export type ModelStage = "none" | "staging" | "production" | "archived";
export type DriftSeverity = "none" | "low" | "medium" | "high";

export interface Experiment {
  id: string; organizationId: string; name: string; framework: string;
  params: Record<string, unknown>; metrics: Record<string, number>;
  status: "running" | "completed" | "failed"; startedAt: string; completedAt?: string;
}

export interface ModelVersion {
  id: string; organizationId: string; modelName: string; version: number; experimentId?: string;
  stage: ModelStage; metrics: Record<string, number>; artifactUri: string;
  gateChecks: { name: string; passed: boolean; detail: string }[];
  promotedBy?: string; promotedAt?: string; createdAt: string;
}

export interface FeatureDef {
  id: string; organizationId: string; name: string; entity: string; valueType: "int" | "float" | "string" | "bool" | "vector";
  owner: string; freshnessSlaMinutes: number; tags: string[]; createdAt: string;
}

export interface ServingEndpoint {
  id: string; organizationId: string; modelVersionId: string; name: string; replicas: number;
  status: "provisioning" | "serving" | "draining" | "stopped"; requestsPerSec: number; p99LatencyMs: number; createdAt: string;
}

export interface DriftReport {
  id: string; organizationId: string; modelVersionId: string; feature: string;
  baselineMean: number; currentMean: number; psi: number; severity: DriftSeverity; detectedAt: string;
}

export interface MlopsRepository {
  insertExperiment(e: Experiment): Promise<void>;
  updateExperiment(e: Experiment): Promise<void>;
  listExperiments(org: string): Promise<Experiment[]>;
  insertModelVersion(m: ModelVersion): Promise<void>;
  updateModelVersion(m: ModelVersion): Promise<void>;
  listModelVersions(org: string, modelName?: string): Promise<ModelVersion[]>;
  upsertFeature(f: FeatureDef): Promise<void>;
  listFeatures(org: string): Promise<FeatureDef[]>;
  insertEndpoint(e: ServingEndpoint): Promise<void>;
  updateEndpoint(e: ServingEndpoint): Promise<void>;
  listEndpoints(org: string): Promise<ServingEndpoint[]>;
  insertDrift(d: DriftReport): Promise<void>;
  listDrift(org: string, modelVersionId?: string): Promise<DriftReport[]>;
}

export class InMemoryMlopsRepository implements MlopsRepository {
  experiments = new Map<string, Experiment>();
  modelVersions = new Map<string, ModelVersion>();
  features = new Map<string, FeatureDef>();
  endpoints = new Map<string, ServingEndpoint>();
  driftReports: DriftReport[] = [];

  async insertExperiment(e: Experiment) { this.experiments.set(e.id, structuredClone(e)); }
  async updateExperiment(e: Experiment) { this.experiments.set(e.id, structuredClone(e)); }
  async listExperiments(org: string) { return [...this.experiments.values()].filter(e => e.organizationId === org).reverse(); }
  async insertModelVersion(m: ModelVersion) { this.modelVersions.set(m.id, structuredClone(m)); }
  async updateModelVersion(m: ModelVersion) { this.modelVersions.set(m.id, structuredClone(m)); }
  async listModelVersions(org: string, modelName?: string) {
    return [...this.modelVersions.values()].filter(m => m.organizationId === org && (!modelName || m.modelName === modelName))
      .sort((a, b) => b.version - a.version);
  }
  async upsertFeature(f: FeatureDef) { this.features.set(f.id, structuredClone(f)); }
  async listFeatures(org: string) { return [...this.features.values()].filter(f => f.organizationId === org); }
  async insertEndpoint(e: ServingEndpoint) { this.endpoints.set(e.id, structuredClone(e)); }
  async updateEndpoint(e: ServingEndpoint) { this.endpoints.set(e.id, structuredClone(e)); }
  async listEndpoints(org: string) { return [...this.endpoints.values()].filter(e => e.organizationId === org); }
  async insertDrift(d: DriftReport) { this.driftReports.push(d); }
  async listDrift(org: string, modelVersionId?: string) {
    return this.driftReports.filter(d => d.organizationId === org && (!modelVersionId || d.modelVersionId === modelVersionId)).reverse();
  }
}

function hash32(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/** Promotion gates a model version must clear before it can move staging -> production. */
const PROMOTION_GATES: { name: string; check: (m: { metrics: Record<string, number> }) => boolean; detail: string }[] = [
  { name: "min_accuracy", check: m => (m.metrics.accuracy ?? 0) >= 0.8, detail: "accuracy >= 0.80" },
  { name: "max_bias_gap", check: m => (m.metrics.biasGap ?? 0) <= 0.1, detail: "fairness bias gap <= 0.10" },
  { name: "eval_suite_pass", check: m => (m.metrics.evalPassRate ?? 0) >= 0.9, detail: "eval suite pass rate >= 0.90" },
];

export class MlopsService {
  constructor(
    private readonly repo: MlopsRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
  ) {}

  async startExperiment(ctx: RequestContext, input: { name: string; framework: string; params?: Record<string, unknown> }): Promise<Experiment> {
    this.policy.assert(ctx.principal, "mlops:write", { kind: "experiment", organizationId: ctx.principal.organizationId });
    const exp: Experiment = {
      id: newId("exp"), organizationId: ctx.principal.organizationId, name: input.name, framework: input.framework,
      params: input.params ?? {}, metrics: {}, status: "running", startedAt: new Date().toISOString(),
    };
    await this.repo.insertExperiment(exp);
    return exp;
  }

  async logMetrics(ctx: RequestContext, experimentId: string, metrics: Record<string, number>): Promise<Experiment> {
    const org = ctx.principal.organizationId;
    const exp = (await this.repo.listExperiments(org)).find(e => e.id === experimentId);
    if (!exp) throw PlatformError.notFound("experiment", experimentId);
    exp.metrics = { ...exp.metrics, ...metrics };
    await this.repo.updateExperiment(exp);
    return exp;
  }

  async completeExperiment(ctx: RequestContext, experimentId: string): Promise<Experiment> {
    const org = ctx.principal.organizationId;
    const exp = (await this.repo.listExperiments(org)).find(e => e.id === experimentId);
    if (!exp) throw PlatformError.notFound("experiment", experimentId);
    exp.status = "completed";
    exp.completedAt = new Date().toISOString();
    await this.repo.updateExperiment(exp);
    return exp;
  }

  async listExperiments(ctx: RequestContext): Promise<Experiment[]> {
    this.policy.assert(ctx.principal, "mlops:read", { kind: "experiment", organizationId: ctx.principal.organizationId });
    return this.repo.listExperiments(ctx.principal.organizationId);
  }

  async registerModelVersion(ctx: RequestContext, input: { modelName: string; artifactUri: string; metrics: Record<string, number>; experimentId?: string }): Promise<ModelVersion> {
    this.policy.assert(ctx.principal, "mlops:write", { kind: "model_version", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const existing = await this.repo.listModelVersions(org, input.modelName);
    const version: ModelVersion = {
      id: newId("mver"), organizationId: org, modelName: input.modelName, version: (existing[0]?.version ?? 0) + 1,
      experimentId: input.experimentId, stage: "none", metrics: input.metrics, artifactUri: input.artifactUri,
      gateChecks: [], createdAt: new Date().toISOString(),
    };
    await this.repo.insertModelVersion(version);
    await this.bus.publish(Subjects.mlops.modelRegistered, { modelVersionId: version.id, modelName: version.modelName, version: version.version }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return version;
  }

  /** Evaluates the promotion gates and moves the version to the requested stage only if they all pass (or the target is "staging"/"archived", which have no gates). */
  async promote(ctx: RequestContext, modelVersionId: string, targetStage: ModelStage): Promise<ModelVersion> {
    this.policy.assert(ctx.principal, "mlops:write", { kind: "model_version", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const version = (await this.repo.listModelVersions(org)).find(m => m.id === modelVersionId);
    if (!version) throw PlatformError.notFound("model_version", modelVersionId);

    if (targetStage === "production") {
      const gateChecks = PROMOTION_GATES.map(g => ({ name: g.name, passed: g.check(version), detail: g.detail }));
      version.gateChecks = gateChecks;
      if (!gateChecks.every(g => g.passed)) {
        throw new PlatformError("precondition_failed", "model failed promotion gates", { details: gateChecks });
      }
      // demote any currently-production version of the same model
      for (const other of await this.repo.listModelVersions(org, version.modelName)) {
        if (other.id !== version.id && other.stage === "production") {
          other.stage = "archived";
          await this.repo.updateModelVersion(other);
        }
      }
    }
    version.stage = targetStage;
    version.promotedBy = ctx.principal.userId;
    version.promotedAt = new Date().toISOString();
    await this.repo.updateModelVersion(version);
    await this.bus.publish(Subjects.mlops.modelPromoted, { modelVersionId, modelName: version.modelName, stage: targetStage }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return version;
  }

  async listModelVersions(ctx: RequestContext, modelName?: string): Promise<ModelVersion[]> {
    this.policy.assert(ctx.principal, "mlops:read", { kind: "model_version", organizationId: ctx.principal.organizationId });
    return this.repo.listModelVersions(ctx.principal.organizationId, modelName);
  }

  async registerFeature(ctx: RequestContext, input: { name: string; entity: string; valueType: FeatureDef["valueType"]; freshnessSlaMinutes?: number; tags?: string[] }): Promise<FeatureDef> {
    this.policy.assert(ctx.principal, "mlops:write", { kind: "feature", organizationId: ctx.principal.organizationId });
    const feature: FeatureDef = {
      id: newId("feat"), organizationId: ctx.principal.organizationId, name: input.name, entity: input.entity,
      valueType: input.valueType, owner: ctx.principal.userId, freshnessSlaMinutes: input.freshnessSlaMinutes ?? 60,
      tags: input.tags ?? [], createdAt: new Date().toISOString(),
    };
    await this.repo.upsertFeature(feature);
    return feature;
  }

  async listFeatures(ctx: RequestContext): Promise<FeatureDef[]> {
    this.policy.assert(ctx.principal, "mlops:read", { kind: "feature", organizationId: ctx.principal.organizationId });
    return this.repo.listFeatures(ctx.principal.organizationId);
  }

  async deployEndpoint(ctx: RequestContext, input: { modelVersionId: string; name: string; replicas?: number }): Promise<ServingEndpoint> {
    this.policy.assert(ctx.principal, "mlops:write", { kind: "endpoint", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const version = (await this.repo.listModelVersions(org)).find(m => m.id === input.modelVersionId);
    if (!version) throw PlatformError.notFound("model_version", input.modelVersionId);
    const seed = hash32(input.modelVersionId);
    const endpoint: ServingEndpoint = {
      id: newId("ep"), organizationId: org, modelVersionId: input.modelVersionId, name: input.name,
      replicas: input.replicas ?? 2, status: "serving", requestsPerSec: 5 + (seed % 200), p99LatencyMs: 40 + (seed % 300),
      createdAt: new Date().toISOString(),
    };
    await this.repo.insertEndpoint(endpoint);
    await this.bus.publish(Subjects.mlops.endpointDeployed, { endpointId: endpoint.id, modelVersionId: input.modelVersionId }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return endpoint;
  }

  async listEndpoints(ctx: RequestContext): Promise<ServingEndpoint[]> {
    this.policy.assert(ctx.principal, "mlops:read", { kind: "endpoint", organizationId: ctx.principal.organizationId });
    return this.repo.listEndpoints(ctx.principal.organizationId);
  }

  /** Deterministic PSI-style drift check between a declared baseline and current feature distribution mean. */
  async checkDrift(ctx: RequestContext, input: { modelVersionId: string; feature: string; baselineMean: number; currentMean: number }): Promise<DriftReport> {
    this.policy.assert(ctx.principal, "mlops:write", { kind: "drift", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const relDelta = input.baselineMean === 0 ? Math.abs(input.currentMean) : Math.abs(input.currentMean - input.baselineMean) / Math.abs(input.baselineMean);
    const psi = Math.round(relDelta * 1000) / 1000;
    const severity: DriftSeverity = psi >= 0.5 ? "high" : psi >= 0.25 ? "medium" : psi >= 0.1 ? "low" : "none";
    const report: DriftReport = {
      id: newId("drift"), organizationId: org, modelVersionId: input.modelVersionId, feature: input.feature,
      baselineMean: input.baselineMean, currentMean: input.currentMean, psi, severity, detectedAt: new Date().toISOString(),
    };
    await this.repo.insertDrift(report);
    if (severity === "high" || severity === "medium") {
      await this.bus.publish(Subjects.mlops.driftDetected, { modelVersionId: input.modelVersionId, feature: input.feature, severity, psi }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    }
    return report;
  }

  async listDrift(ctx: RequestContext, modelVersionId?: string): Promise<DriftReport[]> {
    this.policy.assert(ctx.principal, "mlops:read", { kind: "drift", organizationId: ctx.principal.organizationId });
    return this.repo.listDrift(ctx.principal.organizationId, modelVersionId);
  }
}
