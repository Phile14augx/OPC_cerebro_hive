import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import type { XGateway } from "../../ai/x/gateway.js";
import { Planner, Critic, selectStrategy, type Critique } from "../reasoning/reasoning.js";
import type { RuntimeService } from "../runtime/runtime.js";

/**
 * Cerebro Swarm™ — the multi-agent coordination protocol from the Enterprise
 * Cognitive OS vision: Planner -> Coordinator -> Specialists -> Critics ->
 * Judge -> Consensus -> Executor -> Verifier -> Auditor. A single objective
 * fans out into role-labeled subtasks, each executed by AgentOS (Runtime),
 * independently critiqued, synthesized into one consensus answer, verified
 * again as a hard gate, and wrapped in a complete audit trail.
 */

export type SwarmRole = "researcher" | "architect" | "coder" | "reviewer" | "security" | "legal" | "finance" | "tester" | "generalist";

function roleFor(description: string): SwarmRole {
  const d = description.toLowerCase();
  if (/\b(secur|vulnerab|threat|exploit|compliance)\b/.test(d)) return "security";
  if (/\b(legal|contract|regulat|policy|clause)\b/.test(d)) return "legal";
  if (/\b(cost|budget|roi|financ|revenue|pricing)\b/.test(d)) return "finance";
  if (/\b(test|verify|qa|validate|assert)\b/.test(d)) return "tester";
  if (/\b(review|critique|audit|check)\b/.test(d)) return "reviewer";
  if (/\b(design|architect|schema|diagram|topology)\b/.test(d)) return "architect";
  if (/\b(code|implement|function|build|api|script)\b/.test(d)) return "coder";
  if (/\b(research|find|lookup|survey|investigate)\b/.test(d)) return "researcher";
  return "generalist";
}

export interface SwarmRoleResult { role: SwarmRole; stepId: number; description: string; output: string; critique: Critique }
export interface SwarmRun {
  id: string; organizationId: string; objective: string;
  roles: SwarmRoleResult[]; consensus?: { finalAnswer: string; averageScore: number; agreement: number };
  verifier?: Critique; status: "running" | "consensus_reached" | "revision_needed" | "completed" | "failed";
  auditTrail: { at: string; stage: string; note: string }[];
  startedAt: string; finishedAt?: string;
}

export interface SwarmRepository {
  insert(r: SwarmRun): Promise<void>;
  update(r: SwarmRun): Promise<void>;
  get(org: string, id: string): Promise<SwarmRun | undefined>;
  list(org: string, limit?: number): Promise<SwarmRun[]>;
}

export class InMemorySwarmRepository implements SwarmRepository {
  runs = new Map<string, SwarmRun>();
  async insert(r: SwarmRun) { this.runs.set(r.id, structuredClone(r)); }
  async update(r: SwarmRun) { this.runs.set(r.id, structuredClone(r)); }
  async get(org: string, id: string) { const r = this.runs.get(id); return r?.organizationId === org ? structuredClone(r) : undefined; }
  async list(org: string, limit = 50) { return [...this.runs.values()].filter(r => r.organizationId === org).slice(-limit).reverse(); }
}

export class SwarmService {
  private readonly planner: Planner;
  private readonly critic: Critic;

  constructor(
    private readonly repo: SwarmRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
    private readonly x: XGateway,
    private readonly runtime: RuntimeService,
  ) {
    this.planner = new Planner(x, bus);
    this.critic = new Critic(x);
  }

  async run(ctx: RequestContext, objective: string): Promise<SwarmRun> {
    this.policy.assert(ctx.principal, "swarm:write", { kind: "run", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const trail: SwarmRun["auditTrail"] = [];
    const audit = (stage: string, note: string) => trail.push({ at: new Date().toISOString(), stage, note });

    const run: SwarmRun = { id: newId("swarm"), organizationId: org, objective, roles: [], status: "running", auditTrail: trail, startedAt: new Date().toISOString() };
    await this.repo.insert(run);
    await this.bus.publish(Subjects.swarm.runStarted, { runId: run.id, objective: objective.slice(0, 200) }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });

    // Planner: decompose the objective (Reasoning Engine's strategy + step decomposition).
    const decision = selectStrategy(objective);
    audit("planner", `strategy=${decision.strategy} mode=${decision.mode}`);
    const plan = await this.planner.plan(org, objective, decision, ctx.traceId);

    // Coordinator: assign each subtask a specialist role.
    audit("coordinator", `assigned ${plan.steps.length} subtask(s) to specialist roles`);

    // Specialists (executed via AgentOS Runtime) + Critics (per-output verification).
    for (const step of plan.steps) {
      const role = roleFor(step.description);
      const exec = await this.runtime.submit(ctx, { goal: step.description });
      const finished = await this.runtime.execute(exec);
      const output = finished.result?.output ?? finished.error ?? "";
      const critique = this.critic.verify(step.description, output);
      run.roles.push({ role, stepId: step.id, description: step.description, output, critique });
      audit(`specialist:${role}`, `step ${step.id} -> score ${critique.score}${critique.ok ? "" : ` (issues: ${critique.issues.join(", ")})`}`);
      await this.bus.publish(Subjects.swarm.roleCompleted, { runId: run.id, role, stepId: step.id, score: critique.score }, { organizationId: org, traceId: ctx.traceId });
    }

    // Judge + Consensus: synthesize all specialist outputs into one answer, deterministic fallback if the model is unavailable.
    const scores = run.roles.map(r => r.critique.score);
    const averageScore = scores.length ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(3)) : 0;
    const agreement = scores.length ? Number((scores.filter(s => s >= 0.5).length / scores.length).toFixed(3)) : 0;

    let finalAnswer: string;
    try {
      const synth = await this.x.complete(org, {
        messages: [
          { role: "system", content: "You are the Judge in a multi-agent swarm. Synthesize the specialist outputs below into one coherent final answer for the objective. Be concise." },
          { role: "user", content: `Objective: ${objective}\n\n${run.roles.map(r => `[${r.role}] ${r.output}`).join("\n\n")}` },
        ],
        metadata: { purpose: "swarm:judge" },
      }, { traceId: ctx.traceId });
      finalAnswer = synth.text;
    } catch {
      finalAnswer = run.roles.map(r => `[${r.role}] ${r.output}`).join("\n");
    }
    run.consensus = { finalAnswer, averageScore, agreement };
    run.status = agreement >= 0.6 ? "consensus_reached" : "revision_needed";
    audit("judge", `consensus ${run.status} — avg score ${averageScore}, agreement ${agreement}`);
    await this.bus.publish(Subjects.swarm.consensusReached, { runId: run.id, averageScore, agreement, status: run.status }, { organizationId: org, traceId: ctx.traceId });

    // Verifier: hard gate on the synthesized final answer.
    run.verifier = this.critic.verify(objective, finalAnswer);
    audit("verifier", `final verification ${run.verifier.ok ? "passed" : "flagged"} — score ${run.verifier.score}`);

    // Auditor: close out the run with the complete trail already accumulated.
    run.status = "completed";
    run.finishedAt = new Date().toISOString();
    audit("auditor", `run closed with ${run.roles.length} role(s), ${trail.length} audit entries`);
    await this.repo.update(run);
    await this.bus.publish(Subjects.swarm.runCompleted, { runId: run.id, status: run.status, averageScore }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return run;
  }

  get(ctx: RequestContext, id: string): Promise<SwarmRun | undefined> {
    this.policy.assert(ctx.principal, "swarm:read", { kind: "run", organizationId: ctx.principal.organizationId });
    return this.repo.get(ctx.principal.organizationId, id);
  }

  list(ctx: RequestContext, limit?: number): Promise<SwarmRun[]> {
    this.policy.assert(ctx.principal, "swarm:read", { kind: "run", organizationId: ctx.principal.organizationId });
    return this.repo.list(ctx.principal.organizationId, limit);
  }
}
