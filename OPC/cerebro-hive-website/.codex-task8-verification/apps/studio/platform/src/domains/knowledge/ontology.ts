import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import { PlatformError } from "../../kernel/errors/errors.js";

/**
 * Cerebro Ontology™ — the enterprise ontology + typed knowledge graph from
 * the AI Governance & Ethics Handbook §4-6: entity types, relationship
 * types, and immutable/versioned nodes+edges carrying confidence,
 * provenance, and temporal validity. This sits alongside KnowledgeFabric's
 * document-mention graph as the platform's canonical semantic layer.
 */
export const ONTOLOGY_ENTITY_TYPES = [
  "person", "organization", "team", "project", "repository", "service", "api",
  "dataset", "model", "prompt", "agent", "workflow", "policy", "incident", "risk", "deployment",
] as const;
export type OntologyEntityType = typeof ONTOLOGY_ENTITY_TYPES[number];

export const ONTOLOGY_RELATIONSHIP_TYPES = [
  "WORKS_FOR", "MEMBER_OF", "IMPLEMENTS", "DEPENDS_ON", "USES", "GOVERNS", "OWNS", "CALLS",
] as const;
export type OntologyRelationshipType = typeof ONTOLOGY_RELATIONSHIP_TYPES[number];

export interface OntologyNode {
  id: string;
  organizationId: string;
  type: OntologyEntityType;
  name: string;
  properties: Record<string, unknown>;
  lifecycleState: "draft" | "active" | "deprecated" | "archived";
  confidence: number;
  provenance: string;
  version: number;
  validFrom: string;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OntologyEdge {
  id: string;
  organizationId: string;
  fromNodeId: string;
  toNodeId: string;
  relationship: OntologyRelationshipType;
  weight: number;
  confidence: number;
  validFrom: string;
  validUntil?: string;
  source: string;
  reason?: string;
  createdAt: string;
}

export interface OntologyRepository {
  upsertNode(n: OntologyNode): Promise<OntologyNode>;
  getNode(organizationId: string, id: string): Promise<OntologyNode | undefined>;
  listNodes(organizationId: string, type?: OntologyEntityType): Promise<OntologyNode[]>;
  insertEdge(e: OntologyEdge): Promise<OntologyEdge>;
  edgesForNode(organizationId: string, nodeId: string): Promise<OntologyEdge[]>;
  listEdges(organizationId: string): Promise<OntologyEdge[]>;
}

export class InMemoryOntologyRepository implements OntologyRepository {
  nodes = new Map<string, OntologyNode>();
  edges: OntologyEdge[] = [];

  async upsertNode(n: OntologyNode): Promise<OntologyNode> {
    const key = `${n.organizationId}:${n.type}:${n.name.toLowerCase()}`;
    const existing = [...this.nodes.values()].find(x => `${x.organizationId}:${x.type}:${x.name.toLowerCase()}` === key);
    if (existing) {
      existing.properties = { ...existing.properties, ...n.properties };
      existing.confidence = Math.max(existing.confidence, n.confidence);
      existing.version += 1;
      existing.updatedAt = n.updatedAt;
      this.nodes.set(existing.id, existing);
      return structuredClone(existing);
    }
    this.nodes.set(n.id, n);
    return structuredClone(n);
  }
  async getNode(org: string, id: string) { const n = this.nodes.get(id); return n?.organizationId === org ? structuredClone(n) : undefined; }
  async listNodes(org: string, type?: OntologyEntityType) {
    return [...this.nodes.values()].filter(n => n.organizationId === org && (!type || n.type === type)).map(n => structuredClone(n));
  }
  async insertEdge(e: OntologyEdge) { this.edges.push(e); return structuredClone(e); }
  async edgesForNode(org: string, nodeId: string) {
    return this.edges.filter(e => e.organizationId === org && (e.fromNodeId === nodeId || e.toNodeId === nodeId)).map(e => structuredClone(e));
  }
  async listEdges(org: string) { return this.edges.filter(e => e.organizationId === org).map(e => structuredClone(e)); }
}

export class OntologyService {
  constructor(
    private readonly repo: OntologyRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
  ) {}

  async upsertNode(ctx: RequestContext, input: {
    type: OntologyEntityType; name: string; properties?: Record<string, unknown>;
    confidence?: number; provenance?: string; validFrom?: string; validUntil?: string;
  }): Promise<OntologyNode> {
    this.policy.assert(ctx.principal, "knowledge:write", { kind: "ontology_node", organizationId: ctx.principal.organizationId });
    if (!ONTOLOGY_ENTITY_TYPES.includes(input.type)) throw PlatformError.validation(`unknown ontology entity type: ${input.type}`);
    const now = new Date().toISOString();
    const node: OntologyNode = {
      id: newId("onode"), organizationId: ctx.principal.organizationId, type: input.type, name: input.name,
      properties: input.properties ?? {}, lifecycleState: "active", confidence: input.confidence ?? 0.75,
      provenance: input.provenance ?? `manual:${ctx.principal.userId}`, version: 1,
      validFrom: input.validFrom ?? now, validUntil: input.validUntil, createdAt: now, updatedAt: now,
    };
    const stored = await this.repo.upsertNode(node);
    await this.bus.publish(Subjects.ontology.nodeUpserted, { nodeId: stored.id, type: stored.type, name: stored.name },
      { organizationId: stored.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return stored;
  }

  async link(ctx: RequestContext, input: {
    fromNodeId: string; toNodeId: string; relationship: OntologyRelationshipType;
    weight?: number; confidence?: number; source?: string; reason?: string;
  }): Promise<OntologyEdge> {
    this.policy.assert(ctx.principal, "knowledge:write", { kind: "ontology_edge", organizationId: ctx.principal.organizationId });
    if (!ONTOLOGY_RELATIONSHIP_TYPES.includes(input.relationship)) throw PlatformError.validation(`unknown ontology relationship: ${input.relationship}`);
    const [from, to] = await Promise.all([
      this.repo.getNode(ctx.principal.organizationId, input.fromNodeId),
      this.repo.getNode(ctx.principal.organizationId, input.toNodeId),
    ]);
    if (!from) throw PlatformError.notFound("ontology_node", input.fromNodeId);
    if (!to) throw PlatformError.notFound("ontology_node", input.toNodeId);
    const edge: OntologyEdge = {
      id: newId("oedge"), organizationId: ctx.principal.organizationId, fromNodeId: input.fromNodeId, toNodeId: input.toNodeId,
      relationship: input.relationship, weight: input.weight ?? 1, confidence: input.confidence ?? 0.75,
      validFrom: new Date().toISOString(), source: input.source ?? `manual:${ctx.principal.userId}`, reason: input.reason,
      createdAt: new Date().toISOString(),
    };
    const stored = await this.repo.insertEdge(edge);
    await this.bus.publish(Subjects.ontology.edgeCreated, { edgeId: stored.id, relationship: stored.relationship, from: from.name, to: to.name },
      { organizationId: stored.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return stored;
  }

  async node(ctx: RequestContext, id: string): Promise<OntologyNode> {
    this.policy.assert(ctx.principal, "knowledge:read", { kind: "ontology_node", organizationId: ctx.principal.organizationId });
    const n = await this.repo.getNode(ctx.principal.organizationId, id);
    if (!n) throw PlatformError.notFound("ontology_node", id);
    return n;
  }

  async nodes(ctx: RequestContext, type?: OntologyEntityType): Promise<OntologyNode[]> {
    this.policy.assert(ctx.principal, "knowledge:read", { kind: "ontology_node", organizationId: ctx.principal.organizationId });
    return this.repo.listNodes(ctx.principal.organizationId, type);
  }

  /** BFS graph expansion from a node up to `depth` hops — the "Graph Expansion" step of the GraphRAG pipeline. */
  async expand(ctx: RequestContext, nodeId: string, depth = 2): Promise<{ nodes: OntologyNode[]; edges: OntologyEdge[] }> {
    this.policy.assert(ctx.principal, "knowledge:read", { kind: "ontology_node", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const visitedNodes = new Map<string, OntologyNode>();
    const visitedEdges = new Map<string, OntologyEdge>();
    let frontier = [nodeId];
    for (let hop = 0; hop <= depth && frontier.length; hop++) {
      const next: string[] = [];
      for (const id of frontier) {
        const n = await this.repo.getNode(org, id);
        if (!n || visitedNodes.has(n.id)) continue;
        visitedNodes.set(n.id, n);
        const edges = await this.repo.edgesForNode(org, id);
        for (const e of edges) {
          if (!visitedEdges.has(e.id)) visitedEdges.set(e.id, e);
          const neighbor = e.fromNodeId === id ? e.toNodeId : e.fromNodeId;
          if (!visitedNodes.has(neighbor)) next.push(neighbor);
        }
      }
      frontier = next;
    }
    return { nodes: [...visitedNodes.values()], edges: [...visitedEdges.values()] };
  }

  async graph(ctx: RequestContext): Promise<{ nodes: OntologyNode[]; edges: OntologyEdge[]; entityTypes: readonly string[]; relationshipTypes: readonly string[] }> {
    this.policy.assert(ctx.principal, "knowledge:read", { kind: "ontology_node", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const [nodes, edges] = await Promise.all([this.repo.listNodes(org), this.repo.listEdges(org)]);
    return { nodes, edges, entityTypes: ONTOLOGY_ENTITY_TYPES, relationshipTypes: ONTOLOGY_RELATIONSHIP_TYPES };
  }
}
