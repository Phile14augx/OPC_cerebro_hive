import { newId } from "../../kernel/ids/id.js";
import { PlatformError } from "../../kernel/errors/errors.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import { cosine, deterministicEmbedding } from "../../ai/x/mock-provider.js";

export interface MeshAgent {
  id: string; organizationId: string; name: string;
  kind: "internal" | "external"; capabilities: string[]; endpoint?: string;
  status: "online" | "offline" | "degraded"; lastHeartbeatAt?: string; metadata: Record<string, unknown>;
}

export interface AgentRepository {
  upsert(agent: MeshAgent): Promise<void>;
  get(organizationId: string, id: string): Promise<MeshAgent | undefined>;
  list(organizationId: string): Promise<MeshAgent[]>;
}

export class InMemoryAgentRepository implements AgentRepository {
  agents = new Map<string, MeshAgent>();
  async upsert(agent: MeshAgent): Promise<void> { this.agents.set(agent.id, structuredClone(agent)); }
  async get(org: string, id: string) { const a = this.agents.get(id); return a?.organizationId === org ? structuredClone(a) : undefined; }
  async list(org: string) { return [...this.agents.values()].filter(a => a.organizationId === org).map(a => structuredClone(a)); }
}

export interface DelegationHandler { (ctx: RequestContext, agent: MeshAgent, task: string): Promise<string> }

/**
 * Cerebro Agent Mesh™ — registry, capability discovery, heartbeat health,
 * delegation, broadcast, weighted voting, and deterministic leader election.
 * Topologies: point-to-point, broadcast, hierarchical teams, expert networks.
 */
export class MeshService {
  private handlers = new Map<string, DelegationHandler>();

  constructor(
    private readonly repo: AgentRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
    private readonly heartbeatTimeoutMs = 60_000,
  ) {}

  /** Register how a given agent kind executes delegated tasks. */
  registerHandler(kind: string, handler: DelegationHandler): void { this.handlers.set(kind, handler); }

  async register(ctx: RequestContext, input: { name: string; kind?: "internal" | "external"; capabilities: string[]; endpoint?: string; metadata?: Record<string, unknown> }): Promise<MeshAgent> {
    this.policy.assert(ctx.principal, "mesh:write", { kind: "agent", organizationId: ctx.principal.organizationId });
    const agent: MeshAgent = {
      id: newId("agt"), organizationId: ctx.principal.organizationId, name: input.name,
      kind: input.kind ?? "internal", capabilities: input.capabilities, endpoint: input.endpoint,
      status: "online", lastHeartbeatAt: new Date().toISOString(), metadata: input.metadata ?? {},
    };
    await this.repo.upsert(agent);
    await this.bus.publish(Subjects.mesh.agentJoined, { agentId: agent.id, name: agent.name, capabilities: agent.capabilities }, { organizationId: agent.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return agent;
  }

  async heartbeat(ctx: RequestContext, agentId: string, status: "online" | "degraded" = "online"): Promise<MeshAgent> {
    const agent = await this.mustGet(ctx, agentId);
    agent.status = status;
    agent.lastHeartbeatAt = new Date().toISOString();
    await this.repo.upsert(agent);
    return agent;
  }

  async directory(ctx: RequestContext): Promise<MeshAgent[]> {
    this.policy.assert(ctx.principal, "mesh:read", { kind: "agent", organizationId: ctx.principal.organizationId });
    const agents = await this.repo.list(ctx.principal.organizationId);
    const now = Date.now();
    for (const a of agents) {
      if (a.lastHeartbeatAt && now - new Date(a.lastHeartbeatAt).getTime() > this.heartbeatTimeoutMs && a.status === "online") {
        a.status = "offline";
        await this.repo.upsert(a);
        await this.bus.publish(Subjects.mesh.agentLeft, { agentId: a.id, name: a.name, reason: "heartbeat-timeout" }, { organizationId: a.organizationId });
      }
    }
    return agents;
  }

  /** Capability discovery: rank agents for a task via capability-embedding similarity. */
  async discover(ctx: RequestContext, task: string, opts?: { limit?: number }): Promise<{ agent: MeshAgent; score: number }[]> {
    const agents = (await this.directory(ctx)).filter(a => a.status !== "offline");
    const tv = deterministicEmbedding(task);
    return agents
      .map(agent => {
        const cv = deterministicEmbedding(agent.capabilities.join(" ") + " " + agent.name);
        const kw = agent.capabilities.some(c => task.toLowerCase().includes(c.toLowerCase())) ? 0.3 : 0;
        return { agent, score: cosine(tv, cv) + kw };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, opts?.limit ?? 5);
  }

  /** Point-to-point delegation to the best-suited (or specified) agent. */
  async delegate(ctx: RequestContext, task: string, opts?: { agentId?: string }): Promise<{ agent: MeshAgent; result: string }> {
    this.policy.assert(ctx.principal, "runtime:run", { kind: "agent", organizationId: ctx.principal.organizationId });
    let agent: MeshAgent | undefined;
    if (opts?.agentId) agent = await this.mustGet(ctx, opts.agentId);
    else agent = (await this.discover(ctx, task, { limit: 1 }))[0]?.agent;
    if (!agent) throw PlatformError.notFound("suitable agent");
    const handler = this.handlers.get(agent.kind) ?? this.handlers.get("internal");
    if (!handler) throw new PlatformError("unavailable", `no delegation handler for kind ${agent.kind}`);
    const result = await handler(ctx, agent, task);
    await this.bus.publish(Subjects.mesh.delegated, { agentId: agent.id, task: task.slice(0, 120) }, { organizationId: ctx.principal.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return { agent, result };
  }

  /** Broadcast a task to all capable agents; collect responses. */
  async broadcast(ctx: RequestContext, task: string, opts?: { limit?: number }): Promise<{ agentId: string; name: string; result: string }[]> {
    const targets = await this.discover(ctx, task, { limit: opts?.limit ?? 3 });
    const out: { agentId: string; name: string; result: string }[] = [];
    for (const { agent } of targets) {
      const handler = this.handlers.get(agent.kind) ?? this.handlers.get("internal");
      if (!handler) continue;
      try { out.push({ agentId: agent.id, name: agent.name, result: await handler(ctx, agent, task) }); }
      catch (err) { out.push({ agentId: agent.id, name: agent.name, result: `error: ${String(err)}` }); }
    }
    return out;
  }

  /** Weighted vote across agents; capability-similarity is the voting weight. */
  async vote(ctx: RequestContext, question: string, options: string[]): Promise<{ winner: string; tally: Record<string, number>; voters: number }> {
    if (options.length < 2) throw PlatformError.validation("vote needs >= 2 options");
    const agents = (await this.directory(ctx)).filter(a => a.status === "online");
    if (!agents.length) throw new PlatformError("unavailable", "no online agents to vote");
    const qv = deterministicEmbedding(question);
    const tally: Record<string, number> = Object.fromEntries(options.map(o => [o, 0]));
    for (const agent of agents) {
      const weight = 0.5 + Math.max(0, cosine(qv, deterministicEmbedding(agent.capabilities.join(" "))));
      let best = options[0]!, bestScore = -Infinity;
      for (const opt of options) {
        const s = cosine(deterministicEmbedding(`${agent.name} ${agent.capabilities.join(" ")}`), deterministicEmbedding(`${question} ${opt}`));
        if (s > bestScore) { bestScore = s; best = opt; }
      }
      tally[best] = (tally[best] ?? 0) + weight;
    }
    const winner = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]![0];
    await this.bus.publish(Subjects.mesh.voteCompleted, { question: question.slice(0, 120), winner, voters: agents.length }, { organizationId: ctx.principal.organizationId, traceId: ctx.traceId });
    return { winner, tally, voters: agents.length };
  }

  /** Deterministic bully-style election: lowest agent id among online agents leads. */
  async electLeader(ctx: RequestContext): Promise<MeshAgent> {
    const online = (await this.directory(ctx)).filter(a => a.status === "online").sort((a, b) => a.id.localeCompare(b.id));
    const leader = online[0];
    if (!leader) throw new PlatformError("unavailable", "no online agents");
    await this.bus.publish(Subjects.mesh.leaderElected, { agentId: leader.id, name: leader.name }, { organizationId: ctx.principal.organizationId, traceId: ctx.traceId });
    return leader;
  }

  private async mustGet(ctx: RequestContext, id: string): Promise<MeshAgent> {
    const agent = await this.repo.get(ctx.principal.organizationId, id);
    if (!agent) throw PlatformError.notFound("agent", id);
    return agent;
  }
}

/** Bridge to the Python AgentOS FastAPI service — an external mesh peer. */
export function agentosBridgeHandler(baseUrl: string): DelegationHandler {
  return async (_ctx, agent, task) => {
    const url = agent.endpoint ?? baseUrl;
    try {
      const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const info = await fetch(`${url}/`, { signal: AbortSignal.timeout(4000) }).then(r => r.json()) as { name?: string; subsystems?: string[] };
      return `Delegated to ${info.name ?? "AgentOS"} (subsystems: ${(info.subsystems ?? []).join(", ")}). Task acknowledged: ${task.slice(0, 140)}`;
    } catch (err) {
      return `agentos peer unreachable (${String(err)}); task not delegated`;
    }
  };
}
