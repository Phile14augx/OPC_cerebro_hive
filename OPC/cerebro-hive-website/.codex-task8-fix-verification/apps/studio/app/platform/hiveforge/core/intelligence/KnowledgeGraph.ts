/**
 * Advanced Knowledge Graph Contracts
 */

export type KnowledgeNodeType = 
  | "Organization" | "Project" | "Environment" | "Deployment" 
  | "Blueprint" | "Capability" | "SecretMeta" | "Control" | "AuditRecord"
  | "Resource" | "Workflow" | "Policy" | "Provider" | "Cost" | "Team" | "Incident" | "Document" | "AIConversation";

export type KnowledgeEdgeType = 
  | "owns" | "deploys" | "violates" | "recommends" | "failed_with" | "monitored_by" | "depends_on";

export interface KnowledgeEdgeMetadata {
  timestamp: string;
  severity?: "info" | "warning" | "critical";
  contextId?: string; // e.g., an Event ID or Correlation ID
  [key: string]: any;
}

export interface KnowledgeEdge {
  id: string; // Edges are first-class entities
  sourceId: string;
  targetId: string;
  type: KnowledgeEdgeType;
  metadata: KnowledgeEdgeMetadata;
}

export interface KnowledgeNode {
  id: string;
  type: KnowledgeNodeType;
  metadata: any;
}

export class KnowledgeGraph {
  private nodes: Map<string, KnowledgeNode> = new Map();
  private edges: Map<string, KnowledgeEdge> = new Map();

  addNode(node: KnowledgeNode) {
    this.nodes.set(node.id, node);
  }

  addEdge(edge: KnowledgeEdge) {
    this.edges.set(edge.id, edge);
  }

  getEdgesByTarget(targetId: string, type?: KnowledgeEdgeType): KnowledgeEdge[] {
    return Array.from(this.edges.values()).filter(e => e.targetId === targetId && (!type || e.type === type));
  }
}

export const knowledgeGraph = new KnowledgeGraph();
