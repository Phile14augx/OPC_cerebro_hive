import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import { PlatformError } from "../../kernel/errors/errors.js";
import type { XGateway } from "../../ai/x/gateway.js";
import { MeshService, type MeshAgent } from "../mesh/mesh.js";

/**
 * CerebroSwarm™ — Phase 1: the Executive Council + Architecture layer of the Enterprise
 * Cognitive Workforce roadmap. This models the 9-role "brain before workforce" org chart:
 * CEO -> Strategy -> Enterprise Architect -> Project Planner -> Research -> Cloud Architect ->
 * AI Architect -> Solution Architect -> Reviewer. These agents plan, analyze, and coordinate —
 * none of them write or execute code. Execution swarms (Frontend/Backend/DevOps/AI Eng/Security/
 * QA) are a later phase once this coordination layer is validated.
 *
 * Design decisions (revised from the original scripted v0):
 * 1. Reasoning is real, not canned strings — every stage calls the platform's XGateway with a
 *    role-specific system prompt, grounded in the directive text and every prior stage's actual
 *    output (not a fixed lookup table + seeded RNG).
 * 2. Roles are registered as real Agent Mesh agents (`mesh.register`) rather than a disconnected
 *    roster array duplicating `mesh.ts`'s registry concept. This makes the executive council
 *    discoverable, votable, and eligible for leader election alongside every other mesh agent.
 *    The sequential executive review chain itself still runs its own orchestration here (rather
 *    than through `mesh.delegate`'s generic "internal" handler), because that shared handler
 *    always routes through the general-purpose Runtime planner and has no concept of a fixed,
 *    per-role system prompt or of stage-to-stage handoff with revision loops — this chain's
 *    differentiator versus mesh's generic delegate-to-best-agent pattern.
 * 3. The Reviewer can reject and send the directive back to an earlier stage with feedback
 *    (bounded to a small number of revision rounds), instead of always completing after one pass.
 */

export type SwarmAgentRole =
  | "ceo" | "strategy" | "architect" | "planner" | "research"
  | "cloud-architect" | "ai-architect" | "solution-architect" | "reviewer";
export type TaskPriority = "Low" | "Medium" | "High";

export interface SwarmAgentDef {
  role: SwarmAgentRole;
  name: string;
  title: string;
  responsibility: string;
  meshAgentId?: string;
}

export const CEREBROSWARM_ROSTER: SwarmAgentDef[] = [
  { role: "ceo", name: "CEO Agent", title: "Chief Executive", responsibility: "Final strategic go / no-go decisions" },
  { role: "strategy", name: "Strategy Agent", title: "Chief Strategy Officer", responsibility: "Business strategy, market fit, prioritization" },
  { role: "architect", name: "Enterprise Architect", title: "Enterprise Architect", responsibility: "Overall system design and platform fit, technical direction" },
  { role: "planner", name: "Project Planner", title: "Project Planner", responsibility: "Phased execution plan, milestones, resourcing" },
  { role: "research", name: "Research Agent", title: "Research Lead", responsibility: "Prior art, competitive landscape, technical feasibility research" },
  { role: "cloud-architect", name: "Cloud Architect", title: "Cloud Architect", responsibility: "Infrastructure topology, cost, scalability, and deployment model" },
  { role: "ai-architect", name: "AI Architect", title: "AI Architect", responsibility: "Model selection, routing, evaluation, and AI safety architecture" },
  { role: "solution-architect", name: "Solution Architect", title: "Solution Architect", responsibility: "End-to-end solution blueprint reconciling architecture, cloud, and AI inputs" },
  { role: "reviewer", name: "Reviewer", title: "Governance Reviewer", responsibility: "Final review against security, cost, and architecture guardrails; can send the directive back for revision" },
];

/** Sequential handoff order — every role before "reviewer" is revisable. */
const ROLE_CHAIN: SwarmAgentRole[] = ["ceo", "strategy", "architect", "planner", "research", "cloud-architect", "ai-architect", "solution-architect"];
const MAX_REVISIONS = 2;

export interface SwarmTask {
  id: string; directiveId: string; organizationId: string;
  taskId: string; sender: string; recipient: string; role: SwarmAgentRole;
  objective: string; dependencies: string[]; priority: TaskPriority; deadline: string;
  status: "completed"; output: string; order: number; attempt: number; createdAt: string;
}

export interface Directive {
  id: string; organizationId: string; objective: string; priority: TaskPriority;
  status: "running" | "completed"; verdict?: "approved" | "max_revisions_reached";
  revisions: number; createdAt: string; completedAt?: string;
}

export interface CerebroSwarmRepository {
  insertDirective(d: Directive): Promise<void>;
  updateDirective(d: Directive): Promise<void>;
  listDirectives(org: string): Promise<Directive[]>;
  getDirective(org: string, id: string): Promise<Directive | undefined>;

  insertTask(t: SwarmTask): Promise<void>;
  listTasks(directiveId: string): Promise<SwarmTask[]>;
}

export class InMemoryCerebroSwarmRepository implements CerebroSwarmRepository {
  directives = new Map<string, Directive>();
  tasks = new Map<string, SwarmTask>();

  async insertDirective(d: Directive) { this.directives.set(d.id, structuredClone(d)); }
  async updateDirective(d: Directive) { this.directives.set(d.id, structuredClone(d)); }
  async listDirectives(org: string) { return [...this.directives.values()].filter(d => d.organizationId === org).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
  async getDirective(org: string, id: string) { const d = this.directives.get(id); return d?.organizationId === org ? structuredClone(d) : undefined; }

  async insertTask(t: SwarmTask) { this.tasks.set(t.id, structuredClone(t)); }
  async listTasks(directiveId: string) { return [...this.tasks.values()].filter(t => t.directiveId === directiveId).sort((a, b) => a.order - b.order || a.attempt - b.attempt); }
}

const ROLE_SYSTEM_PROMPTS: Record<SwarmAgentRole, string> = {
  ceo: "You are the CEO Agent of an enterprise AI executive council. Given a business directive, decide whether to approve, conditionally approve, or reject it as a strategic priority. Be decisive and concise (3-5 sentences). You plan and decide — you do not write code or produce technical specs.",
  strategy: "You are the Strategy Agent (Chief Strategy Officer). Assess market fit, competitive positioning, and prioritization for the directive, building on the CEO's decision. Be concise (3-5 sentences). You do not write code.",
  architect: "You are the Enterprise Architect. Given the directive and the CEO/Strategy input, outline the overall system design and how it fits the existing platform (reuse existing domains/services where possible rather than proposing a parallel stack). Be concise (4-6 sentences). You produce a design outline, not implementation code.",
  planner: "You are the Project Planner. Given the directive and the prior CEO/Strategy/Architecture input, produce a phased execution plan with milestones. Be concise (4-6 sentences, can use short phase labels). You do not write code.",
  research: "You are the Research Agent. Given the directive and all prior executive input, research the competitive landscape, relevant prior art, and technical feasibility risks. Flag anything the plan may be missing. Be concise (3-5 sentences).",
  "cloud-architect": "You are the Cloud Architect. Given the directive and all prior input, propose the infrastructure topology, cost profile, and deployment/scalability model. Be concise (3-5 sentences).",
  "ai-architect": "You are the AI Architect. Given the directive and all prior input, recommend model selection/routing strategy, evaluation approach, and AI safety considerations. Be concise (3-5 sentences).",
  "solution-architect": "You are the Solution Architect. Given the directive and every prior stage's output (business, architecture, planning, research, cloud, AI), reconcile them into a single coherent end-to-end solution blueprint. Be concise (4-6 sentences) and explicitly note any conflicts between prior stages that you resolved.",
  reviewer: "You are the Governance Reviewer, the final gate before an executive directive is considered ready. Review every prior stage's output against security, cost, and architecture guardrails. Respond with a FIRST LINE that is exactly either \"VERDICT: approved\" or \"VERDICT: revise:<role>\" where <role> is one of: ceo, strategy, architect, planner, research, cloud-architect, ai-architect, solution-architect — naming the single earliest stage that most needs rework. Then on following lines give 2-4 sentences of reasoning, and if requesting revision, state exactly what needs to change.",
};

function roleObjective(role: SwarmAgentRole, objective: string): string {
  const defs: Record<SwarmAgentRole, string> = {
    ceo: `Approve or reject the initiative: "${objective}"`,
    strategy: `Assess business strategy, market fit, and prioritization for: "${objective}"`,
    architect: `Produce a system architecture outline for: "${objective}"`,
    planner: `Produce a phased execution plan for: "${objective}"`,
    research: `Research prior art, competitive landscape, and feasibility for: "${objective}"`,
    "cloud-architect": `Propose infrastructure topology and cost model for: "${objective}"`,
    "ai-architect": `Recommend model routing, evaluation, and AI safety approach for: "${objective}"`,
    "solution-architect": `Reconcile all prior input into a solution blueprint for: "${objective}"`,
    reviewer: `Review the full plan for "${objective}" against security, cost, and architecture guardrails`,
  };
  return defs[role];
}

function parseVerdict(text: string): { verdict: "approved" | "revise"; target?: SwarmAgentRole; reasoning: string } {
  const firstLine = (text.split("\n")[0] ?? "").trim();
  const revise = firstLine.match(/VERDICT:\s*revise:\s*([a-z-]+)/i);
  if (revise && ROLE_CHAIN.includes(revise[1] as SwarmAgentRole)) {
    return { verdict: "revise", target: revise[1] as SwarmAgentRole, reasoning: text };
  }
  return { verdict: "approved", reasoning: text };
}

export class CerebroSwarmService {
  /** organizationId -> role -> registered mesh agent */
  private meshRoster = new Map<string, Map<SwarmAgentRole, MeshAgent>>();

  constructor(
    private readonly repo: CerebroSwarmRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
    private readonly x: XGateway,
    private readonly mesh: MeshService,
  ) {}

  /** Ensure every executive role has a corresponding Agent Mesh registration for this org (idempotent). */
  private async ensureRoster(ctx: RequestContext): Promise<Map<SwarmAgentRole, MeshAgent>> {
    const org = ctx.principal.organizationId;
    const cached = this.meshRoster.get(org);
    if (cached && cached.size === CEREBROSWARM_ROSTER.length) return cached;

    const existing = await this.mesh.directory(ctx);
    const byRole = new Map<SwarmAgentRole, MeshAgent>();
    for (const def of CEREBROSWARM_ROSTER) {
      const found = existing.find(a => a.metadata?.cerebroswarmRole === def.role);
      if (found) { byRole.set(def.role, found); continue; }
      const agent = await this.mesh.register(ctx, {
        name: def.name,
        kind: "internal",
        capabilities: ["cerebroswarm", "planning", def.role],
        metadata: { cerebroswarmRole: def.role, title: def.title, responsibility: def.responsibility },
      });
      byRole.set(def.role, agent);
    }
    this.meshRoster.set(org, byRole);
    return byRole;
  }

  /** Read-only: reflects whatever's already registered in the mesh, without registering (registration is a write). */
  async listAgents(ctx: RequestContext): Promise<SwarmAgentDef[]> {
    this.policy.assert(ctx.principal, "cerebroswarm:read", { kind: "agent", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const cached = this.meshRoster.get(org);
    const directory = cached ? [...cached.values()] : await this.mesh.directory(ctx);
    const byRole = new Map<SwarmAgentRole, MeshAgent>();
    for (const a of directory) {
      const role = a.metadata?.cerebroswarmRole as SwarmAgentRole | undefined;
      if (role) byRole.set(role, a);
    }
    return CEREBROSWARM_ROSTER.map(def => ({ ...def, meshAgentId: byRole.get(def.role)?.id }));
  }

  private async runStage(
    ctx: RequestContext, role: SwarmAgentRole, directiveObjective: string,
    priorOutputs: { role: SwarmAgentRole; title: string; output: string }[], feedback?: string,
  ): Promise<string> {
    const context = priorOutputs.map(o => `### ${o.title}\n${o.output}`).join("\n\n");
    const feedbackBlock = feedback ? `\n\nThe Governance Reviewer requested revision of this stage with this feedback: ${feedback}\nAddress this feedback directly in your revised output.` : "";
    const res = await this.x.complete(ctx.principal.organizationId, {
      messages: [
        { role: "system", content: ROLE_SYSTEM_PROMPTS[role] },
        { role: "user", content: `Directive: ${directiveObjective}\n\nPrior stage outputs:\n${context || "(none yet — you are the first stage)"}${feedbackBlock}` },
      ],
      metadata: { purpose: `cerebroswarm:${role}` },
    }, { traceId: ctx.traceId });
    return res.text;
  }

  async submitDirective(ctx: RequestContext, input: { objective: string; priority?: TaskPriority }): Promise<{ directive: Directive; tasks: SwarmTask[] }> {
    this.policy.assert(ctx.principal, "cerebroswarm:write", { kind: "directive", organizationId: ctx.principal.organizationId });
    if (!input.objective.trim()) throw PlatformError.validation("objective is required");
    const org = ctx.principal.organizationId;
    const priority = input.priority ?? "High";
    const now = new Date().toISOString();
    await this.ensureRoster(ctx);

    const directive: Directive = { id: newId("dir"), organizationId: org, objective: input.objective, priority, status: "running", revisions: 0, createdAt: now };
    await this.repo.insertDirective(directive);
    await this.bus.publish(Subjects.cerebroswarm.directiveSubmitted, { directiveId: directive.id, objective: directive.objective.slice(0, 200) }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });

    // stageOutputs holds the current (possibly revised) output for every chain role, in order.
    const stageOutputs = new Map<SwarmAgentRole, string>();
    let order = 0;
    let attempt = 1;
    let previousBusinessId: string | null = null;

    const runFromStage = async (startIdx: number, feedback?: string): Promise<void> => {
      const startRole = ROLE_CHAIN[startIdx]!;
      let sender = startIdx === 0 ? "User" : CEREBROSWARM_ROSTER.find(a => a.role === ROLE_CHAIN[startIdx - 1])!.name;
      for (let i = startIdx; i < ROLE_CHAIN.length; i++) {
        const role = ROLE_CHAIN[i]!;
        const agentDef = CEREBROSWARM_ROSTER.find(a => a.role === role)!;
        const priorOutputs = ROLE_CHAIN.slice(0, i).map(r => ({ role: r, title: CEREBROSWARM_ROSTER.find(a => a.role === r)!.title, output: stageOutputs.get(r) ?? "" }));
        const output = await this.runStage(ctx, role, directive.objective, priorOutputs, role === startRole ? feedback : undefined);
        stageOutputs.set(role, output);

        const businessTaskId = `TASK-${2000 + order * 111}`;
        const deadline = new Date(Date.now() + (order + 1) * 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const task: SwarmTask = {
          id: newId("tsk"), directiveId: directive.id, organizationId: org,
          taskId: businessTaskId, sender, recipient: agentDef.name, role,
          objective: roleObjective(role, directive.objective),
          dependencies: previousBusinessId ? [previousBusinessId] : [],
          priority, deadline, status: "completed", output, order, attempt, createdAt: new Date().toISOString(),
        };
        await this.repo.insertTask(task);
        await this.bus.publish(Subjects.cerebroswarm.taskCompleted, { directiveId: directive.id, taskId: task.taskId, role }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });

        previousBusinessId = businessTaskId;
        sender = agentDef.name;
        order++;
      }
    };

    await runFromStage(0);

    // Reviewer pass, with bounded revision loop.
    let verdictResult: { verdict: "approved" | "revise"; target?: SwarmAgentRole; reasoning: string } | null = null;
    for (let round = 0; round <= MAX_REVISIONS; round++) {
      const priorOutputs = ROLE_CHAIN.map(r => ({ role: r, title: CEREBROSWARM_ROSTER.find(a => a.role === r)!.title, output: stageOutputs.get(r) ?? "" }));
      const reviewerOutput = await this.runStage(ctx, "reviewer", directive.objective, priorOutputs);
      const parsed = parseVerdict(reviewerOutput);
      verdictResult = parsed;

      const reviewerDef = CEREBROSWARM_ROSTER.find(a => a.role === "reviewer")!;
      const lastRoleName = CEREBROSWARM_ROSTER.find(a => a.role === ROLE_CHAIN[ROLE_CHAIN.length - 1])!.name;
      const businessTaskId = `TASK-${2000 + order * 111}`;
      const deadline = new Date(Date.now() + (order + 1) * 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const task: SwarmTask = {
        id: newId("tsk"), directiveId: directive.id, organizationId: org,
        taskId: businessTaskId, sender: lastRoleName, recipient: reviewerDef.name, role: "reviewer",
        objective: roleObjective("reviewer", directive.objective),
        dependencies: previousBusinessId ? [previousBusinessId] : [],
        priority, deadline, status: "completed", output: reviewerOutput, order, attempt: round + 1, createdAt: new Date().toISOString(),
      };
      await this.repo.insertTask(task);
      await this.bus.publish(Subjects.cerebroswarm.taskCompleted, { directiveId: directive.id, taskId: task.taskId, role: "reviewer" }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
      order++;
      previousBusinessId = businessTaskId;

      if (parsed.verdict === "approved" || round === MAX_REVISIONS) break;

      directive.revisions++;
      await this.bus.publish(Subjects.cerebroswarm.revisionRequested, { directiveId: directive.id, targetRole: parsed.target, round: round + 1 }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
      attempt++;
      const targetIdx = ROLE_CHAIN.indexOf(parsed.target!);
      await runFromStage(targetIdx, parsed.reasoning);
    }

    directive.status = "completed";
    directive.verdict = verdictResult?.verdict === "approved" ? "approved" : "max_revisions_reached";
    directive.completedAt = new Date().toISOString();
    await this.repo.updateDirective(directive);
    const tasks = await this.repo.listTasks(directive.id);
    await this.bus.publish(Subjects.cerebroswarm.directiveCompleted, { directiveId: directive.id, tasks: tasks.length, verdict: directive.verdict }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });

    return { directive, tasks };
  }

  listDirectives(ctx: RequestContext): Promise<Directive[]> {
    this.policy.assert(ctx.principal, "cerebroswarm:read", { kind: "directive", organizationId: ctx.principal.organizationId });
    return this.repo.listDirectives(ctx.principal.organizationId);
  }

  async getDirective(ctx: RequestContext, id: string): Promise<{ directive: Directive; tasks: SwarmTask[] }> {
    this.policy.assert(ctx.principal, "cerebroswarm:read", { kind: "directive", organizationId: ctx.principal.organizationId });
    const directive = await this.repo.getDirective(ctx.principal.organizationId, id);
    if (!directive) throw PlatformError.notFound("directive", id);
    const tasks = await this.repo.listTasks(id);
    return { directive, tasks };
  }
}
