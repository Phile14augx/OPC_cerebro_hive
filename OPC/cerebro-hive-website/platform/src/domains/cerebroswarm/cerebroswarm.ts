import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import { PlatformError } from "../../kernel/errors/errors.js";
import { seededRandom } from "../simulator/simulator.js";

/**
 * CerebroSwarm™ — Phase 1: the Executive Council + Architecture layer of the Enterprise
 * Cognitive Workforce vision. Rather than a flat pool of generic role-labeled workers (that's
 * the existing `swarm` domain's Planner/Coordinator/Specialists/Critics protocol), CerebroSwarm
 * models a small, fixed roster of five named domain-expert agents — CEO, Strategy, Enterprise
 * Architect, Planner, Reviewer — that coordinate (not implement) by passing a submitted
 * Directive through a sequential chain of structured task messages, each with a business taskId,
 * sender/recipient, objective, dependencies, priority, and deadline, exactly mirroring the
 * message-protocol shape from the CerebroSwarm design. Every stage's output is deterministic
 * (seeded on the directive + stage), matching this platform's governed-simulation convention —
 * no real model calls. This is intentionally scoped to planning/coordination only: none of these
 * five agents write code. Engineering/DevOps/Security/Business execution swarms are a later phase
 * once the underlying substrate (Knowledge Graph, Memory, Tool Registry) is further along.
 */

export type SwarmAgentRole = "ceo" | "strategy" | "architect" | "planner" | "reviewer";
export type TaskPriority = "Low" | "Medium" | "High";

export interface SwarmAgentDef {
  role: SwarmAgentRole;
  name: string;
  title: string;
  responsibility: string;
}

export const CEREBROSWARM_ROSTER: SwarmAgentDef[] = [
  { role: "ceo", name: "CEO Agent", title: "Chief Executive", responsibility: "Final strategic go / no-go decisions" },
  { role: "strategy", name: "Strategy Agent", title: "Chief Strategy Officer", responsibility: "Business strategy, market fit, prioritization" },
  { role: "architect", name: "Enterprise Architect", title: "Enterprise Architect", responsibility: "System design and platform fit, technical direction" },
  { role: "planner", name: "Project Planner", title: "Project Planner", responsibility: "Phased execution plan, milestones, resourcing" },
  { role: "reviewer", name: "Reviewer", title: "Governance Reviewer", responsibility: "Final review against security, cost, and architecture guardrails" },
];

const ROLE_CHAIN: SwarmAgentRole[] = ["ceo", "strategy", "architect", "planner", "reviewer"];

export interface SwarmTask {
  id: string; directiveId: string; organizationId: string;
  taskId: string; sender: string; recipient: string; role: SwarmAgentRole;
  objective: string; dependencies: string[]; priority: TaskPriority; deadline: string;
  status: "completed"; output: string; order: number; createdAt: string;
}

export interface Directive {
  id: string; organizationId: string; objective: string; priority: TaskPriority;
  status: "running" | "completed"; createdAt: string; completedAt?: string;
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
  async listTasks(directiveId: string) { return [...this.tasks.values()].filter(t => t.directiveId === directiveId).sort((a, b) => a.order - b.order); }
}

function roleObjective(role: SwarmAgentRole, objective: string): string {
  switch (role) {
    case "ceo": return `Approve or reject the initiative: "${objective}"`;
    case "strategy": return `Assess business strategy, market fit, and prioritization for: "${objective}"`;
    case "architect": return `Produce a system architecture outline for: "${objective}"`;
    case "planner": return `Produce a phased execution plan for: "${objective}"`;
    case "reviewer": return `Review the plan and architecture for "${objective}" against security, cost, and architecture guardrails`;
  }
}

const ROLE_OUTPUTS: Record<SwarmAgentRole, string[]> = {
  ceo: [
    "Approved: proceed with this initiative as a top strategic priority for the current quarter.",
    "Greenlit with conditions — prioritize security and cost efficiency before scaling beyond pilot.",
    "Approved for phased rollout; revisit scope after Phase 1 delivers measurable outcomes.",
  ],
  strategy: [
    "Market analysis indicates strong demand; recommend a phased go-to-market aligned with existing platform customers.",
    "Competitive positioning is favorable — differentiate on governed, auditable execution rather than raw agent count.",
    "Recommend targeting the highest-friction workflow first to prove value before broadening scope.",
  ],
  architect: [
    "Proposed architecture: a domain service behind the platform gateway, backed by the shared Knowledge Graph and Event Store, deployed via the existing container/routes pattern.",
    "Recommend a modular, event-driven design that reuses the platform's policy engine and snapshot persistence rather than introducing a parallel stack.",
    "System design should isolate orchestration state from execution state so coordination logic can evolve independently of downstream engineering swarms.",
  ],
  planner: [
    "Phase 1 (Weeks 1-2): discovery & architecture. Phase 2 (Weeks 3-6): core build. Phase 3 (Weeks 7-8): security review & hardening. Phase 4 (Week 9): launch.",
    "Recommend a milestone-based plan: design review gate, implementation gate, security gate, and a staged production rollout with rollback criteria at each gate.",
    "Sequencing proposal: land the coordination layer first, validate against one real workflow, then expand execution capacity incrementally.",
  ],
  reviewer: [
    "Reviewed plan against security, cost, and architecture guardrails. Approved for execution with standard governance checkpoints.",
    "No blocking issues found. Recommend adding an explicit rollback criterion to the plan before execution begins.",
    "Approved — architecture and plan are consistent with platform conventions; flagging cost monitoring as a follow-up item.",
  ],
};

export class CerebroSwarmService {
  constructor(
    private readonly repo: CerebroSwarmRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
  ) {}

  listAgents(ctx: RequestContext): SwarmAgentDef[] {
    this.policy.assert(ctx.principal, "cerebroswarm:read", { kind: "agent", organizationId: ctx.principal.organizationId });
    return CEREBROSWARM_ROSTER;
  }

  async submitDirective(ctx: RequestContext, input: { objective: string; priority?: TaskPriority }): Promise<{ directive: Directive; tasks: SwarmTask[] }> {
    this.policy.assert(ctx.principal, "cerebroswarm:write", { kind: "directive", organizationId: ctx.principal.organizationId });
    if (!input.objective.trim()) throw PlatformError.validation("objective is required");
    const org = ctx.principal.organizationId;
    const priority = input.priority ?? "High";
    const now = new Date().toISOString();

    const directive: Directive = { id: newId("dir"), organizationId: org, objective: input.objective, priority, status: "running", createdAt: now };
    await this.repo.insertDirective(directive);
    await this.bus.publish(Subjects.cerebroswarm.directiveSubmitted, { directiveId: directive.id, objective: directive.objective.slice(0, 200) }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });

    const rand = seededRandom(directive.id);
    const tasks: SwarmTask[] = [];
    let previousBusinessId: string | null = null;
    let previousSender = "User";

    for (let i = 0; i < ROLE_CHAIN.length; i++) {
      const role = ROLE_CHAIN[i]!;
      const agentDef = CEREBROSWARM_ROSTER.find(a => a.role === role)!;
      const businessTaskId = `TASK-${2000 + i * 111 + Math.floor(rand() * 100)}`;
      const outputs = ROLE_OUTPUTS[role];
      const output = outputs[Math.floor(rand() * outputs.length)]!;
      const deadline = new Date(Date.now() + (i + 1) * 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      const task: SwarmTask = {
        id: newId("tsk"), directiveId: directive.id, organizationId: org,
        taskId: businessTaskId, sender: previousSender, recipient: agentDef.name, role,
        objective: roleObjective(role, directive.objective),
        dependencies: previousBusinessId ? [previousBusinessId] : [],
        priority, deadline, status: "completed", output, order: i, createdAt: new Date().toISOString(),
      };
      await this.repo.insertTask(task);
      tasks.push(task);
      await this.bus.publish(Subjects.cerebroswarm.taskCompleted, { directiveId: directive.id, taskId: task.taskId, role }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });

      previousBusinessId = businessTaskId;
      previousSender = agentDef.name;
    }

    directive.status = "completed";
    directive.completedAt = new Date().toISOString();
    await this.repo.updateDirective(directive);
    await this.bus.publish(Subjects.cerebroswarm.directiveCompleted, { directiveId: directive.id, tasks: tasks.length }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });

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
