import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import type { EvalCase, EvalRun, EvalService } from "../evaluation/evaluation.js";

/**
 * Cerebro Research™ — the AI Research Platform pillar: versioned prompt and
 * agent-config registries, and experiment provenance that ties a specific
 * prompt/agent version to the Eval run that scored it. Built as a thin
 * provenance layer on top of Cerebro Eval (which already owns suite
 * execution, grounding checks, regression detection, and model-vs-model
 * comparison) rather than duplicating evaluation logic.
 */

export interface PromptVersion { id: string; organizationId: string; name: string; version: number; template: string; notes?: string; createdAt: string }
export interface AgentVersion { id: string; organizationId: string; name: string; version: number; config: Record<string, unknown>; notes?: string; createdAt: string }
export interface Experiment { id: string; organizationId: string; name: string; promptVersionId?: string; agentVersionId?: string; evalRunId?: string; notes?: string; createdAt: string }

export interface ResearchRepository {
  insertPrompt(p: PromptVersion): Promise<void>;
  listPrompts(org: string, name?: string): Promise<PromptVersion[]>;
  insertAgent(a: AgentVersion): Promise<void>;
  listAgents(org: string, name?: string): Promise<AgentVersion[]>;
  insertExperiment(e: Experiment): Promise<void>;
  listExperiments(org: string, limit?: number): Promise<Experiment[]>;
}

export class InMemoryResearchRepository implements ResearchRepository {
  prompts: PromptVersion[] = [];
  agents: AgentVersion[] = [];
  experiments: Experiment[] = [];
  async insertPrompt(p: PromptVersion) { this.prompts.push(p); }
  async listPrompts(org: string, name?: string) { return this.prompts.filter(p => p.organizationId === org && (!name || p.name === name)).reverse(); }
  async insertAgent(a: AgentVersion) { this.agents.push(a); }
  async listAgents(org: string, name?: string) { return this.agents.filter(a => a.organizationId === org && (!name || a.name === name)).reverse(); }
  async insertExperiment(e: Experiment) { this.experiments.push(e); }
  async listExperiments(org: string, limit = 50) { return this.experiments.filter(e => e.organizationId === org).slice(-limit).reverse(); }
}

export class ResearchService {
  constructor(
    private readonly repo: ResearchRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
    private readonly evals: EvalService,
  ) {}

  async registerPrompt(ctx: RequestContext, input: { name: string; template: string; notes?: string }): Promise<PromptVersion> {
    this.policy.assert(ctx.principal, "research:write", { kind: "prompt_version", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const existing = await this.repo.listPrompts(org, input.name);
    const version: PromptVersion = {
      id: newId("pv"), organizationId: org, name: input.name, version: (existing[0]?.version ?? 0) + 1,
      template: input.template, notes: input.notes, createdAt: new Date().toISOString(),
    };
    await this.repo.insertPrompt(version);
    await this.bus.publish(Subjects.research.promptVersioned, { promptVersionId: version.id, name: version.name, version: version.version }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return version;
  }

  listPrompts(ctx: RequestContext, name?: string): Promise<PromptVersion[]> {
    this.policy.assert(ctx.principal, "research:read", { kind: "prompt_version", organizationId: ctx.principal.organizationId });
    return this.repo.listPrompts(ctx.principal.organizationId, name);
  }

  async registerAgent(ctx: RequestContext, input: { name: string; config: Record<string, unknown>; notes?: string }): Promise<AgentVersion> {
    this.policy.assert(ctx.principal, "research:write", { kind: "agent_version", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const existing = await this.repo.listAgents(org, input.name);
    const version: AgentVersion = {
      id: newId("av"), organizationId: org, name: input.name, version: (existing[0]?.version ?? 0) + 1,
      config: input.config, notes: input.notes, createdAt: new Date().toISOString(),
    };
    await this.repo.insertAgent(version);
    await this.bus.publish(Subjects.research.agentVersioned, { agentVersionId: version.id, name: version.name, version: version.version }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return version;
  }

  listAgents(ctx: RequestContext, name?: string): Promise<AgentVersion[]> {
    this.policy.assert(ctx.principal, "research:read", { kind: "agent_version", organizationId: ctx.principal.organizationId });
    return this.repo.listAgents(ctx.principal.organizationId, name);
  }

  /** A/B test: reuses Cerebro Eval's model-vs-model comparison, then records provenance as an experiment. */
  async runAbTest(ctx: RequestContext, input: { name: string; cases: EvalCase[]; providers: string[]; promptVersionId?: string; agentVersionId?: string }): Promise<{ ranking: { provider: string; score: number }[]; experiment: Experiment }> {
    this.policy.assert(ctx.principal, "research:write", { kind: "experiment", organizationId: ctx.principal.organizationId });
    const ranking = await this.evals.compareProviders(ctx, input.cases, input.providers);
    const experiment = await this.recordExperiment(ctx, {
      name: input.name, promptVersionId: input.promptVersionId, agentVersionId: input.agentVersionId,
      notes: `A/B: ${ranking.map(r => `${r.provider}=${r.score}`).join(", ")}`,
    });
    return { ranking, experiment };
  }

  async recordExperiment(ctx: RequestContext, input: { name: string; promptVersionId?: string; agentVersionId?: string; evalRunId?: string; notes?: string }): Promise<Experiment> {
    this.policy.assert(ctx.principal, "research:write", { kind: "experiment", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const experiment: Experiment = {
      id: newId("exp"), organizationId: org, name: input.name, promptVersionId: input.promptVersionId,
      agentVersionId: input.agentVersionId, evalRunId: input.evalRunId, notes: input.notes, createdAt: new Date().toISOString(),
    };
    await this.repo.insertExperiment(experiment);
    await this.bus.publish(Subjects.research.experimentRecorded, { experimentId: experiment.id, name: experiment.name }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return experiment;
  }

  listExperiments(ctx: RequestContext, limit?: number): Promise<Experiment[]> {
    this.policy.assert(ctx.principal, "research:read", { kind: "experiment", organizationId: ctx.principal.organizationId });
    return this.repo.listExperiments(ctx.principal.organizationId, limit);
  }

  /** Benchmark leaderboard: eval history for a suite, ranked best-first. */
  async leaderboard(ctx: RequestContext, suite: string): Promise<{ target: string; score: number; regression: boolean; at: string }[]> {
    this.policy.assert(ctx.principal, "research:read", { kind: "leaderboard", organizationId: ctx.principal.organizationId });
    const history: EvalRun[] = await this.evals.history(ctx, 200);
    const bySuite = history.filter(r => r.suite === suite);
    const latestByTarget = new Map<string, EvalRun>();
    for (const run of bySuite) if (!latestByTarget.has(run.target)) latestByTarget.set(run.target, run);
    return [...latestByTarget.values()]
      .map(r => ({ target: r.target, score: r.score, regression: r.regression, at: r.createdAt }))
      .sort((a, b) => b.score - a.score);
  }
}
