import { SemanticNode } from '../domain/SemanticNode';
import { SemanticEdge } from '../domain/SemanticEdge';

export interface GraphQuery {
  matchNodeKind?: string;
  matchLabels?: string[];
  matchProperties?: Record<string, unknown>;
}

export interface KnowledgeGraphPort {
  addNode(node: SemanticNode): Promise<void>;
  updateNode(id: string, properties: Record<string, unknown>): Promise<void>;
  getNode(id: string): Promise<SemanticNode | undefined>;
  
  addEdge(edge: SemanticEdge): Promise<void>;
  getEdge(id: string): Promise<SemanticEdge | undefined>;
  
  // Semantic Index / Lookups
  findNodes(query: GraphQuery): Promise<SemanticNode[]>;
  
  // Graph Traversal Primitives
  getOutgoingEdges(nodeId: string, type?: string): Promise<SemanticEdge[]>;
  getIncomingEdges(nodeId: string, type?: string): Promise<SemanticEdge[]>;
}
