import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RepresentationModel } from "../representation/representation.js";
import { cosine } from "../x/mock-provider.js";

export type WorldEntityKind =
  | "organization" | "user" | "project" | "workflow" | "document" | "agent"
  | "infrastructure" | "process" | "skill" | "policy" | "execution"
  | "department" | "application" | "customer" | "vendor" | "risk" | "asset";

export type WorldRelationship =
  | "owns" | "depends_on" | "employs" | "reports_to" | "belongs_to" | "runs_on"
  | "supplies_to" | "affects" | "governed_by" | "mitigated_by";

export interface WorldEdge { id: string; organizationId: string; from: string; to: string; relationship: WorldRelationship; createdAt: string }

export interface WorldEntity {
  id: string; organizationId: string; kind: WorldEntityKind; refId: string;
  name: string; state: Record<string, unknown>; embedding?: number[]; updatedAt: string;
}

export interface WorldRepository {
  upsert(entity: Omit<WorldEntity, "id" | "updatedAt">): Promise<WorldEntity>;
  find(organizationId: string, kind: WorldEntityKind, refId: string): Promise<WorldEntity | undefined>;
  query(organizationId: string, opts?: { kind?: WorldEntityKind; limit?: number }): Promise<WorldEntity[]>;
}

export class InMemoryWorldRepository implements WorldRepository {
  entities = new Map<string, WorldEntity>();
  private k(org: string, kind: string, ref: string) { return `${org}:${kind}:${ref}`; }
  async upsert(input: Omit<WorldEntity, "id" | "updatedAt">): Promise<WorldEntity> {
    const key = this.k(input.organizationId, input.kind, input.refId);
    const existing = this.entities.get(key);
    const entity: WorldEntity = {
      id: existing?.id ?? newId("wld"), ...input,
      state: { ...existing?.state, ...input.state },
      updatedAt: new Date().toISOString(),
    };
    this.entities.set(key, entity);
    return entity;
  }
  async find(org: string, kind: WorldEntityKind, refId: string) { return this.entities.get(this.k(org, kind, refId)); }
  async query(org: string, opts?: { kind?: WorldEntityKind; limit?: number }): Promise<WorldEntity[]> {
    let out = [...this.entities.values()].filter(e => e.organizationId === org);
    if (opts?.kind) out = out.filter(e => e.kind === opts.kind);
    out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return out.slice(0, opts?.limit ?? 200);
  }
}

/**
 * The enterprise World Model: a continuously-projected representation of the
 * organization that agents reason OVER, not just react to. Domain events are
 * projected into entity state; embeddings enable semantic queries over world state.
 */
export class WorldModel {
  private edges: WorldEdge[] = [];

  constructor(
    private readonly repo: WorldRepository,
    private readonly representation: RepresentationModel,
  ) {}

  async project(organizationId: string, kind: WorldEntityKind, refId: string, name: string, state: Record<string, unknown>): Promise<WorldEntity> {
    const embedding = this.representation.encode(`${kind} ${name} ${JSON.stringify(state).slice(0, 500)}`);
    return this.repo.upsert({ organizationId, kind, refId, name, state, embedding });
  }

  /** Relate two already-projected entities — this is what makes the World Model "one graph" rather than a flat entity table. */
  link(organizationId: string, from: string, to: string, relationship: WorldRelationship): WorldEdge {
    const edge: WorldEdge = { id: newId("wedge"), organizationId, from, to, relationship, createdAt: new Date().toISOString() };
    this.edges.push(edge);
    return edge;
  }

  /** Every edge touching an entity, in either direction — the neighborhood used for "reason over the enterprise graph" queries. */
  neighborhood(organizationId: string, entityId: string): WorldEdge[] {
    return this.edges.filter(e => e.organizationId === organizationId && (e.from === entityId || e.to === entityId));
  }

  graph(organizationId: string): { edges: WorldEdge[] } {
    return { edges: this.edges.filter(e => e.organizationId === organizationId) };
  }

  async semanticQuery(organizationId: string, query: string, opts?: { kind?: WorldEntityKind; limit?: number }): Promise<(WorldEntity & { score: number })[]> {
    const qv = this.representation.encode(query);
    const all = await this.repo.query(organizationId, { kind: opts?.kind, limit: 1000 });
    return all
      .map(e => ({ ...e, score: e.embedding ? cosine(qv, e.embedding) : 0 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, opts?.limit ?? 10);
  }

  async snapshot(organizationId: string): Promise<Record<string, number>> {
    const all = await this.repo.query(organizationId, { limit: 10_000 });
    const counts: Record<string, number> = {};
    for (const e of all) counts[e.kind] = (counts[e.kind] ?? 0) + 1;
    return counts;
  }

  /** Subscribe world projections to the event stream. */
  attach(bus: EventBus): void {
    void bus.subscribe("runtime.execution.>", async e => {
      const execId = String(e.data.executionId ?? "");
      if (!execId) return;
      await this.project(e.organizationId, "execution", execId, String(e.data.goal ?? execId).slice(0, 120), {
        status: e.subject.split(".").pop(), lastEvent: e.subject, at: e.occurredAt,
      });
    });
    void bus.subscribe(Subjects.knowledge.documentParsed, async e => {
      const docId = String(e.data.documentId ?? "");
      if (docId) await this.project(e.organizationId, "document", docId, String(e.data.title ?? docId), { status: "parsed", chunks: e.data.chunks ?? 0 });
    });
    void bus.subscribe("mesh.agent.>", async e => {
      const agentId = String(e.data.agentId ?? "");
      if (agentId) await this.project(e.organizationId, "agent", agentId, String(e.data.name ?? agentId), { status: e.subject.endsWith("joined") ? "online" : "offline" });
    });
    void bus.subscribe("flow.workflow.>", async e => {
      const wfId = String(e.data.workflowId ?? "");
      if (wfId) await this.project(e.organizationId, "workflow", wfId, String(e.data.name ?? wfId), { lastEvent: e.subject });
    });
  }
}
