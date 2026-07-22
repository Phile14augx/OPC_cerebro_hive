import { EntityType, ResolvedEntity, globalEntityResolver } from "./entity-resolution.js";
import { seededRandom } from "../simulator/simulator.js";
import { newId } from "../../kernel/ids/id.js";

// ---------------------------------------------------------------------------------------------
// Temporal Knowledge Graph
// ---------------------------------------------------------------------------------------------

export interface KnowledgeEntity {
  id: string; // The canonical ID from EntityResolver
  version: number;
  type: EntityType;
  canonicalName: string;
  created: string;
  updated: string;
  valid_from: string;
  valid_to: string | null;
  deprecated: boolean;
  confidence: number; // 0-100
  metadata: Record<string, any>;
  embedding: number[];
  
  // Provenance
  source: string;
  extractionMethod: string;
  extractorVersion: string;
  createdBy: string;
  verificationStatus: "Unverified" | "Verified" | "Rejected";
  license?: string;
  timestamp: string;
  checksum: string;
}

// ---------------------------------------------------------------------------------------------
// Ontology Validator
// ---------------------------------------------------------------------------------------------

type OntologyRule = { source: EntityType; target: EntityType; relationship: RelationshipType; };

const ONTOLOGY_RULES: OntologyRule[] = [
  { source: "Paper", target: "Model", relationship: "implements" },
  { source: "Paper", target: "Architecture", relationship: "proposes" } as any, // using 'proposes' or sticking to existing edges
  { source: "Model", target: "Architecture", relationship: "implements" },
  { source: "Model", target: "Model", relationship: "extends" },
  { source: "Model", target: "Model", relationship: "outperforms" },
  { source: "Model", target: "Model", relationship: "derived_from" },
  { source: "Model", target: "Framework", relationship: "depends_on" },
  { source: "Framework", target: "Language", relationship: "depends_on" },
  { source: "Hardware", target: "Hardware", relationship: "outperforms" },
  { source: "Product", target: "Model", relationship: "uses" } as any,
  { source: "Enterprise Product", target: "Model", relationship: "uses" } as any,
  { source: "Model", target: "Dataset", relationship: "trained_on" },
  { source: "Company", target: "Model", relationship: "commercialized_as" },
  // fallback wildcard for simplicity, in a real system we'd list all
];

export class OntologyValidator {
  validate(source: EntityType, target: EntityType, relationship: RelationshipType): boolean {
    // If strict rules are defined for this relationship, enforce them.
    // For now, return true (allow all) unless we explicitly want to reject.
    if (source === "Paper" && target === "GPU" && relationship === "implements") return false;
    
    const rule = ONTOLOGY_RULES.find(r => r.source === source && r.relationship === relationship);
    if (rule && rule.target !== target) {
      // If a specific rule exists for this source+rel but target mismatches
      // return false; 
    }
    return true;
  }
}

export const globalOntologyValidator = new OntologyValidator();

export type RelationshipType = 
  | "uses" | "extends" | "implements" | "improves" | "outperforms" 
  | "derived_from" | "competes_with" | "replaces" | "references" 
  | "combines" | "integrates" | "benchmarked_on" | "deployed_on" 
  | "optimized_for" | "commercialized_as" | "depends_on" | "licensed_under" 
  | "supersedes" | "coexists_with" | "trained_on";

export interface KnowledgeRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  weight: number; // 0-1
  valid_from: string;
  valid_to: string | null;
  provenance: string[]; // e.g. signal IDs
}

// ---------------------------------------------------------------------------------------------
// Embeddings
// ---------------------------------------------------------------------------------------------

export interface EmbeddingService {
  embed(text: string): number[];
  similarity(a: number[], b: number[]): number;
  nearestNeighbors(embedding: number[], topK: number): KnowledgeEntity[];
  semanticSearch(query: string, topK: number): KnowledgeEntity[];
}

export class MockEmbeddingProvider implements EmbeddingService {
  private graph: KnowledgeGraphService;

  constructor(graph: KnowledgeGraphService) {
    this.graph = graph;
  }

  embed(text: string): number[] {
    const seed = text.toLowerCase().replace(/[^a-z0-9]/g, '');
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
    let s = h;
    const rand = () => { s = Math.imul(1664525, s) + 1013904223 | 0; return (s >>> 0) / 4294967296; };
    
    // Simulate a 128-dimensional embedding
    return Array.from({ length: 128 }, () => rand() * 2 - 1);
  }

  similarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i]! * b[i]!;
      normA += a[i]! * a[i]!;
      normB += b[i]! * b[i]!;
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
  }

  nearestNeighbors(embedding: number[], topK: number): KnowledgeEntity[] {
    const all = this.graph.getAllEntities();
    return all
      .map(e => ({ entity: e, score: this.similarity(embedding, e.embedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(r => r.entity);
  }

  semanticSearch(query: string, topK: number): KnowledgeEntity[] {
    const queryEmb = this.embed(query);
    return this.nearestNeighbors(queryEmb, topK);
  }
}

// ---------------------------------------------------------------------------------------------
// Graph Algorithms & Service
// ---------------------------------------------------------------------------------------------

export class KnowledgeGraphService {
  private entities = new Map<string, KnowledgeEntity[]>(); // id -> version history
  private edges = new Map<string, KnowledgeRelationship>();
  
  public embeddings: MockEmbeddingProvider;

  constructor() {
    this.embeddings = new MockEmbeddingProvider(this);
  }

  upsertEntity(rawName: string, type: EntityType, metadata: Record<string, any> = {}): KnowledgeEntity {
    const resolved = globalEntityResolver.resolve(rawName, type);
    const now = new Date().toISOString();
    
    const history = this.entities.get(resolved.id) || [];
    const prev = history[history.length - 1];
    
    if (prev) {
      prev.valid_to = now;
    }
    
    const newEntity: KnowledgeEntity = {
      id: resolved.id,
      version: prev ? prev.version + 1 : 1,
      type,
      canonicalName: resolved.canonicalName,
      created: prev ? prev.created : now,
      updated: now,
      valid_from: now,
      valid_to: null,
      deprecated: false,
      confidence: prev ? Math.min(100, prev.confidence + 5) : 80,
      metadata: { ...(prev?.metadata || {}), ...metadata },
      embedding: this.embeddings.embed(resolved.canonicalName + JSON.stringify(metadata)),
      source: metadata.source || "system",
      extractionMethod: metadata.extractionMethod || "deterministic-simulator",
      extractorVersion: metadata.extractorVersion || "v1",
      createdBy: metadata.createdBy || "system",
      verificationStatus: metadata.verificationStatus || "Unverified",
      license: metadata.license,
      timestamp: now,
      checksum: `sha256_${resolved.id}_${now}`
    };
    
    history.push(newEntity);
    this.entities.set(resolved.id, history);
    return newEntity;
  }

  getEntity(id: string, asOf?: string): KnowledgeEntity | undefined {
    const history = this.entities.get(id);
    if (!history) return undefined;
    if (!asOf) return history[history.length - 1];
    return history.find(e => e.valid_from <= asOf && (!e.valid_to || e.valid_to > asOf));
  }
  
  getAllEntities(): KnowledgeEntity[] {
    return Array.from(this.entities.values()).map(h => h[h.length - 1]!).filter(e => !e.deprecated);
  }

  addEdge(sourceId: string, targetId: string, type: RelationshipType, weight: number = 1.0, provenance: string = "system"): KnowledgeRelationship {
    const source = this.getEntity(sourceId);
    const target = this.getEntity(targetId);
    if (!source || !target) throw new Error("Source or target entity not found");

    if (!globalOntologyValidator.validate(source.type, target.type, type)) {
      throw new Error(`Ontology validation failed: ${source.type} cannot have '${type}' to ${target.type}`);
    }

    const edgeId = `${sourceId}_${type}_${targetId}`;
    const now = new Date().toISOString();
    
    let edge = this.edges.get(edgeId);
    if (edge) {
      if (!edge.provenance.includes(provenance)) edge.provenance.push(provenance);
      edge.weight = Math.min(1.0, edge.weight + (1.0 - edge.weight) * 0.2); // asymptote to 1
    } else {
      edge = {
        id: edgeId,
        sourceId,
        targetId,
        type,
        weight,
        valid_from: now,
        valid_to: null,
        provenance: [provenance]
      };
      this.edges.set(edgeId, edge);
    }
    return edge;
  }

  getEdgesFor(entityId: string, direction: "out" | "in" | "both" = "both"): KnowledgeRelationship[] {
    return Array.from(this.edges.values()).filter(e => 
      (!e.valid_to) && // active edges only
      (
        (direction === "out" && e.sourceId === entityId) ||
        (direction === "in" && e.targetId === entityId) ||
        (direction === "both" && (e.sourceId === entityId || e.targetId === entityId))
      )
    );
  }

  // --- Graph Algorithms ---

  /** Returns shortest path between source and target, treating all edges uniformly. */
  shortestPath(sourceId: string, targetId: string, maxDepth: number = 5): KnowledgeRelationship[] | null {
    if (sourceId === targetId) return [];
    
    const queue: { id: string; path: KnowledgeRelationship[] }[] = [{ id: sourceId, path: [] }];
    const visited = new Set<string>([sourceId]);
    
    while (queue.length > 0) {
      const { id, path } = queue.shift()!;
      if (path.length >= maxDepth) continue;
      
      const edges = this.getEdgesFor(id, "out");
      for (const edge of edges) {
        if (!visited.has(edge.targetId)) {
          const newPath = [...path, edge];
          if (edge.targetId === targetId) return newPath;
          visited.add(edge.targetId);
          queue.push({ id: edge.targetId, path: newPath });
        }
      }
    }
    
    return null; // Not found within maxDepth
  }

  /** Centrality measure based on incoming edge weight sum. */
  centrality(entityId: string): number {
    const incoming = this.getEdgesFor(entityId, "in");
    return incoming.reduce((sum, edge) => sum + edge.weight, 0);
  }

  // --- Lineage & Clusters ---

  /** Returns ancestors (e.g. derived_from) or descendants of a technology. */
  getLineage(entityId: string, direction: "ancestors" | "descendants" = "ancestors", maxDepth: number = 5) {
    const lineage: { entity: KnowledgeEntity; depth: number }[] = [];
    const visited = new Set<string>([entityId]);
    const queue = [{ id: entityId, depth: 0 }];

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      if (depth >= maxDepth) continue;

      const edges = this.getEdgesFor(id, direction === "ancestors" ? "out" : "in");
      for (const edge of edges) {
        // Lineage typically follows these relationships
        if (!["derived_from", "extends", "improves", "supersedes"].includes(edge.type)) continue;

        const nextId = direction === "ancestors" ? edge.targetId : edge.sourceId;
        if (!visited.has(nextId)) {
          visited.add(nextId);
          const entity = this.getEntity(nextId);
          if (entity) {
            lineage.push({ entity, depth: depth + 1 });
            queue.push({ id: nextId, depth: depth + 1 });
          }
        }
      }
    }
    return lineage;
  }

  /** Simulated community detection. */
  discoverClusters() {
    // In a real system, use Louvain or Label Propagation.
    // Here we deterministically group by shared targets.
    const clusters = new Map<string, { id: string, label: string, description: string, centerNode: KnowledgeEntity, confidence: number, trendScore: number, members: KnowledgeEntity[] }>();
    
    // Quick and dirty deterministic cluster mock
    const entities = this.getAllEntities();
    const agents = entities.filter(e => e.canonicalName.toLowerCase().includes("agent") || e.canonicalName.toLowerCase().includes("reasoning"));
    if (agents.length > 0) {
      clusters.set("agentic", {
        id: "cluster_agentic",
        label: "Agentic AI Cluster",
        description: "Autonomous reasoning and tool use",
        centerNode: agents[0]!,
        confidence: 0.85,
        trendScore: 82,
        members: agents
      });
    }

    const moe = entities.filter(e => e.canonicalName.toLowerCase().includes("moe") || e.canonicalName.toLowerCase().includes("mixture"));
    if (moe.length > 0) {
      clusters.set("moe", {
        id: "cluster_moe",
        label: "Efficient Inference Cluster",
        description: "Sparse attention and Mixture of Experts",
        centerNode: moe[0]!,
        confidence: 0.92,
        trendScore: 88,
        members: moe
      });
    }

    return Array.from(clusters.values());
  }
}

export const globalKnowledgeGraph = new KnowledgeGraphService();
