import { KnowledgeGraphPort, GraphQuery } from '../ports/KnowledgeGraphPort';
import { SemanticNode } from '../domain/SemanticNode';
import { SemanticEdge } from '../domain/SemanticEdge';

export class InMemoryKnowledgeGraph implements KnowledgeGraphPort {
  private nodes = new Map<string, SemanticNode>();
  private edges = new Map<string, SemanticEdge>();
  
  // Adjacency lists for fast traversal
  private outgoing = new Map<string, SemanticEdge[]>();
  private incoming = new Map<string, SemanticEdge[]>();

  async addNode(node: SemanticNode): Promise<void> {
    this.nodes.set(node.id, node);
    if (!this.outgoing.has(node.id)) this.outgoing.set(node.id, []);
    if (!this.incoming.has(node.id)) this.incoming.set(node.id, []);
  }

  async updateNode(id: string, properties: Record<string, unknown>): Promise<void> {
    const node = this.nodes.get(id);
    if (!node) throw new Error(`Node ${id} not found`);
    node.properties = { ...node.properties, ...properties };
    node.version += 1;
    node.provenance.updatedAt = new Date();
  }

  async getNode(id: string): Promise<SemanticNode | undefined> {
    return this.nodes.get(id);
  }

  async addEdge(edge: SemanticEdge): Promise<void> {
    this.edges.set(edge.id, edge);
    this.outgoing.get(edge.sourceId)?.push(edge);
    this.incoming.get(edge.targetId)?.push(edge);
  }

  async getEdge(id: string): Promise<SemanticEdge | undefined> {
    return this.edges.get(id);
  }

  async findNodes(query: GraphQuery): Promise<SemanticNode[]> {
    return Array.from(this.nodes.values()).filter(node => {
      if (query.matchNodeKind && node.kind !== query.matchNodeKind) return false;
      
      if (query.matchLabels) {
        const hasAllLabels = query.matchLabels.every(l => node.labels.includes(l));
        if (!hasAllLabels) return false;
      }
      
      if (query.matchProperties) {
        for (const [k, v] of Object.entries(query.matchProperties)) {
          if (node.properties[k] !== v) return false;
        }
      }
      
      return true;
    });
  }

  async getOutgoingEdges(nodeId: string, type?: string): Promise<SemanticEdge[]> {
    const edges = this.outgoing.get(nodeId) || [];
    if (type) return edges.filter(e => e.relationshipType === type);
    return edges;
  }

  async getIncomingEdges(nodeId: string, type?: string): Promise<SemanticEdge[]> {
    const edges = this.incoming.get(nodeId) || [];
    if (type) return edges.filter(e => e.relationshipType === type);
    return edges;
  }
}
