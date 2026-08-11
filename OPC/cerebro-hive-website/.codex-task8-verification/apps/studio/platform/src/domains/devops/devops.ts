import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import { PlatformError } from "../../kernel/errors/errors.js";

/**
 * Cerebro DevOps™ — CI/CD pipeline runs, environment registry, deployment
 * tracking with rollback, and GitOps-style config-drift detection. Mirrors
 * the DevOps/Platform Engineering stack from the tech-stack handbook
 * (GitHub Actions, ArgoCD, Kubernetes, Terraform/OpenTofu) as a set of
 * first-class platform resources rather than raw infra, so every other
 * domain (Governance, AIOps) can reason about "what shipped, where, when".
 */

export type PipelineStage = "lint" | "test" | "build" | "security_scan" | "sbom" | "sign" | "deploy" | "smoke_test";
export type PipelineStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";
export type EnvironmentTier = "dev" | "staging" | "production" | "dr";
export type DeploymentStrategy = "rolling" | "blue_green" | "canary" | "recreate";

export interface PipelineRun {
  id: string; organizationId: string; pipelineName: string; commitSha: string; branch: string;
  triggeredBy: string; status: PipelineStatus;
  stages: { name: PipelineStage; status: PipelineStatus; durationMs?: number; log?: string }[];
  startedAt: string; finishedAt?: string;
}

export interface EnvironmentEntry {
  id: string; organizationId: string; name: string; tier: EnvironmentTier;
  region: string; clusterOrHost: string; iacModule: string; iacStateHash: string;
  driftDetected: boolean; lastReconciledAt: string; createdAt: string;
}

export interface DeploymentEntry {
  id: string; organizationId: string; environmentId: string; service: string; version: string;
  strategy: DeploymentStrategy; status: "in_progress" | "healthy" | "degraded" | "rolled_back";
  pipelineRunId?: string; previousVersion?: string; deployedBy: string; deployedAt: string; rolledBackAt?: string;
}

export interface DevOpsRepository {
  insertPipelineRun(r: PipelineRun): Promise<void>;
  updatePipelineRun(r: PipelineRun): Promise<void>;
  getPipelineRun(org: string, id: string): Promise<PipelineRun | undefined>;
  listPipelineRuns(org: string, limit?: number): Promise<PipelineRun[]>;
  upsertEnvironment(e: EnvironmentEntry): Promise<void>;
  listEnvironments(org: string): Promise<EnvironmentEntry[]>;
  insertDeployment(d: DeploymentEntry): Promise<void>;
  updateDeployment(d: DeploymentEntry): Promise<void>;
  listDeployments(org: string, environmentId?: string): Promise<DeploymentEntry[]>;
}

export class InMemoryDevOpsRepository implements DevOpsRepository {
  runs = new Map<string, PipelineRun>();
  environments = new Map<string, EnvironmentEntry>();
  deployments = new Map<string, DeploymentEntry>();

  async insertPipelineRun(r: PipelineRun) { this.runs.set(r.id, structuredClone(r)); }
  async updatePipelineRun(r: PipelineRun) { this.runs.set(r.id, structuredClone(r)); }
  async getPipelineRun(org: string, id: string) { const r = this.runs.get(id); return r?.organizationId === org ? structuredClone(r) : undefined; }
  async listPipelineRuns(org: string, limit = 100) {
    return [...this.runs.values()].filter(r => r.organizationId === org).slice(-limit).reverse();
  }
  async upsertEnvironment(e: EnvironmentEntry) { this.environments.set(e.id, structuredClone(e)); }
  async listEnvironments(org: string) { return [...this.environments.values()].filter(e => e.organizationId === org); }
  async insertDeployment(d: DeploymentEntry) { this.deployments.set(d.id, structuredClone(d)); }
  async updateDeployment(d: DeploymentEntry) { this.deployments.set(d.id, structuredClone(d)); }
  async listDeployments(org: string, environmentId?: string) {
    return [...this.deployments.values()].filter(d => d.organizationId === org && (!environmentId || d.environmentId === environmentId))
      .sort((a, b) => b.deployedAt.localeCompare(a.deployedAt));
  }
}

const PIPELINE_STAGES: PipelineStage[] = ["lint", "test", "build", "security_scan", "sbom", "sign", "deploy", "smoke_test"];

function hash32(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export class DevOpsService {
  constructor(
    private readonly repo: DevOpsRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
  ) {}

  /** Runs a deterministic simulated CI/CD pipeline through the canonical DevSecOps stage set. */
  async runPipeline(ctx: RequestContext, input: { pipelineName: string; commitSha: string; branch: string; stages?: PipelineStage[] }): Promise<PipelineRun> {
    this.policy.assert(ctx.principal, "devops:write", { kind: "pipeline", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const stageNames = input.stages ?? PIPELINE_STAGES;
    const run: PipelineRun = {
      id: newId("pipe"), organizationId: org, pipelineName: input.pipelineName, commitSha: input.commitSha, branch: input.branch,
      triggeredBy: ctx.principal.userId, status: "running",
      stages: stageNames.map(name => ({ name, status: "queued" as PipelineStatus })),
      startedAt: new Date().toISOString(),
    };
    await this.repo.insertPipelineRun(run);
    await this.bus.publish(Subjects.devops.pipelineStarted, { pipelineRunId: run.id, pipelineName: run.pipelineName, commitSha: run.commitSha }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });

    for (const stage of run.stages) {
      stage.status = "running";
      const seed = hash32(`${run.commitSha}:${stage.name}`);
      const failed = seed % 23 === 0; // deterministic, rare failure for realism
      stage.durationMs = 400 + (seed % 4000);
      stage.status = failed ? "failed" : "succeeded";
      stage.log = failed ? `${stage.name} failed: deterministic simulated defect (seed ${seed})` : `${stage.name} passed`;
      await this.bus.publish(Subjects.devops.pipelineStageCompleted, { pipelineRunId: run.id, stage: stage.name, status: stage.status }, { organizationId: org, traceId: ctx.traceId });
      if (failed) break;
    }
    run.status = run.stages.some(s => s.status === "failed") ? "failed" : "succeeded";
    run.finishedAt = new Date().toISOString();
    await this.repo.updatePipelineRun(run);
    await this.bus.publish(Subjects.devops.pipelineCompleted, { pipelineRunId: run.id, status: run.status }, { organizationId: org, traceId: ctx.traceId });
    return run;
  }

  async listPipelineRuns(ctx: RequestContext, limit?: number): Promise<PipelineRun[]> {
    this.policy.assert(ctx.principal, "devops:read", { kind: "pipeline", organizationId: ctx.principal.organizationId });
    return this.repo.listPipelineRuns(ctx.principal.organizationId, limit);
  }

  async registerEnvironment(ctx: RequestContext, input: { name: string; tier: EnvironmentTier; region: string; clusterOrHost: string; iacModule: string }): Promise<EnvironmentEntry> {
    this.policy.assert(ctx.principal, "devops:write", { kind: "environment", organizationId: ctx.principal.organizationId });
    const env: EnvironmentEntry = {
      id: newId("env"), organizationId: ctx.principal.organizationId, name: input.name, tier: input.tier,
      region: input.region, clusterOrHost: input.clusterOrHost, iacModule: input.iacModule,
      iacStateHash: hash32(`${input.iacModule}:${Date.now()}`).toString(16), driftDetected: false,
      lastReconciledAt: new Date().toISOString(), createdAt: new Date().toISOString(),
    };
    await this.repo.upsertEnvironment(env);
    return env;
  }

  async listEnvironments(ctx: RequestContext): Promise<EnvironmentEntry[]> {
    this.policy.assert(ctx.principal, "devops:read", { kind: "environment", organizationId: ctx.principal.organizationId });
    return this.repo.listEnvironments(ctx.principal.organizationId);
  }

  /** GitOps reconciliation: compares a declared IaC state hash against the environment's last-known hash. */
  async checkDrift(ctx: RequestContext, environmentId: string, declaredStateHash: string): Promise<EnvironmentEntry> {
    this.policy.assert(ctx.principal, "devops:write", { kind: "environment", organizationId: ctx.principal.organizationId });
    const envs = await this.repo.listEnvironments(ctx.principal.organizationId);
    const env = envs.find(e => e.id === environmentId);
    if (!env) throw PlatformError.notFound("environment", environmentId);
    env.driftDetected = declaredStateHash !== env.iacStateHash;
    env.lastReconciledAt = new Date().toISOString();
    await this.repo.upsertEnvironment(env);
    if (env.driftDetected) {
      await this.bus.publish(Subjects.devops.driftDetected, { environmentId, expected: env.iacStateHash, actual: declaredStateHash }, { organizationId: env.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    }
    return env;
  }

  async deploy(ctx: RequestContext, input: { environmentId: string; service: string; version: string; strategy?: DeploymentStrategy; pipelineRunId?: string }): Promise<DeploymentEntry> {
    this.policy.assert(ctx.principal, "devops:write", { kind: "deployment", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const previous = (await this.repo.listDeployments(org, input.environmentId)).find(d => d.service === input.service && d.status === "healthy");
    const deployment: DeploymentEntry = {
      id: newId("deploy"), organizationId: org, environmentId: input.environmentId, service: input.service, version: input.version,
      strategy: input.strategy ?? "rolling", status: "healthy", pipelineRunId: input.pipelineRunId,
      previousVersion: previous?.version, deployedBy: ctx.principal.userId, deployedAt: new Date().toISOString(),
    };
    await this.repo.insertDeployment(deployment);
    await this.bus.publish(Subjects.devops.deploymentCompleted, { deploymentId: deployment.id, service: deployment.service, version: deployment.version, environmentId: deployment.environmentId }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return deployment;
  }

  async rollback(ctx: RequestContext, deploymentId: string): Promise<DeploymentEntry> {
    this.policy.assert(ctx.principal, "devops:write", { kind: "deployment", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const deployment = (await this.repo.listDeployments(org)).find(d => d.id === deploymentId);
    if (!deployment) throw PlatformError.notFound("deployment", deploymentId);
    if (!deployment.previousVersion) throw new PlatformError("precondition_failed", "no previous version to roll back to");
    deployment.status = "rolled_back";
    deployment.rolledBackAt = new Date().toISOString();
    await this.repo.updateDeployment(deployment);
    const rollbackDeployment: DeploymentEntry = {
      id: newId("deploy"), organizationId: org, environmentId: deployment.environmentId, service: deployment.service,
      version: deployment.previousVersion, strategy: "rolling", status: "healthy",
      deployedBy: ctx.principal.userId, deployedAt: new Date().toISOString(),
    };
    await this.repo.insertDeployment(rollbackDeployment);
    await this.bus.publish(Subjects.devops.rollback, { deploymentId, rolledBackTo: rollbackDeployment.version }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return rollbackDeployment;
  }

  async listDeployments(ctx: RequestContext, environmentId?: string): Promise<DeploymentEntry[]> {
    this.policy.assert(ctx.principal, "devops:read", { kind: "deployment", organizationId: ctx.principal.organizationId });
    return this.repo.listDeployments(ctx.principal.organizationId, environmentId);
  }
}
