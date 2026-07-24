import { KnowledgeGraphPort, SemanticNode, SemanticEdge, GraphQuery } from '../../../knowledge-graph-core/src/index';

export class DigitalTwinEngine implements KnowledgeGraphPort {
  // Overlays
  private overlayNodes = new Map<string, SemanticNode | null>(); // null means deleted in overlay
  private overlayEdges = new Map<string, SemanticEdge | null>();
  private overlayOutgoing = new Map<string, SemanticEdge[]>();
  private overlayIncoming = new Map<string, SemanticEdge[]>();

  constructor(private readonly canonicalGraph: KnowledgeGraphPort) {}

  async addNode(node: SemanticNode): Promise<void> {
    this.overlayNodes.set(node.id, node);
  }

  async updateNode(id: string, properties: Record<string, any>): Promise<void> {
    let node = this.overlayNodes.get(id);
    if (!node) {
      const canonical = await this.canonicalGraph.getNode(id);
      if (!canonical) throw new Error(`Node ${id} not found`);
      node = { ...canonical, properties: { ...canonical.properties } };
    }
    node.properties = { ...node.properties, ...properties };
    this.overlayNodes.set(id, node);
  }

  async removeNode(id: string): Promise<void> {
    this.overlayNodes.set(id, null); // Tombstone
  }

  async getNode(id: string): Promise<SemanticNode | undefined> {
    const overlay = this.overlayNodes.get(id);
    if (overlay === null) return undefined;
    if (overlay) return overlay;
    return this.canonicalGraph.getNode(id);
  }

  async addEdge(edge: SemanticEdge): Promise<void> {
    this.overlayEdges.set(edge.id, edge);
    
    // Manage adjacency in overlay
    const outEdges = this.overlayOutgoing.get(edge.sourceId) || [];
    outEdges.push(edge);
    this.overlayOutgoing.set(edge.sourceId, outEdges);

    const inEdges = this.overlayIncoming.get(edge.targetId) || [];
    inEdges.push(edge);
    this.overlayIncoming.set(edge.targetId, inEdges);
  }

  async removeEdge(id: string): Promise<void> {
    this.overlayEdges.set(id, null);
  }

  async getEdge(id: string): Promise<SemanticEdge | undefined> {
    const overlay = this.overlayEdges.get(id);
    if (overlay === null) return undefined;
    if (overlay) return overlay;
    return this.canonicalGraph.getEdge(id);
  }

  async findNodes(query: GraphQuery): Promise<SemanticNode[]> {
    // Note: A full implementation would merge canonical findNodes() with overlay differences.
    // For this simulation implementation, we assume canonical GraphQuery support and then filter tombstones.
    const canonicalNodes = await this.canonicalGraph.findNodes(query);
    const validNodes = canonicalNodes.filter(n => this.overlayNodes.get(n.id) !== null);
    
    // Add overlay nodes that match the query
    for (const [id, node] of this.overlayNodes.entries()) {
      if (node !== null && this.matchesQuery(node, query)) {
        if (!validNodes.find(n => n.id === id)) {
          validNodes.push(node);
        }
      }
    }
    return validNodes;
  }

  private matchesQuery(node: SemanticNode, query: GraphQuery): boolean {
    if (query.matchNodeKind && node.kind !== query.matchNodeKind) return false;
    if (query.matchLabels && !query.matchLabels.every(l => node.labels.includes(l))) return false;
    if (query.matchProperties) {
      for (const [k, v] of Object.entries(query.matchProperties)) {
        if (node.properties[k] !== v) return false;
      }
    }
    return true;
  }

  async getOutgoingEdges(nodeId: string, type?: string): Promise<SemanticEdge[]> {
    if (this.overlayNodes.get(nodeId) === null) return []; // Node is deleted
    const canonicalEdges = await this.canonicalGraph.getOutgoingEdges(nodeId, type);
    const overlayEdges = this.overlayOutgoing.get(nodeId) || [];
    
    // Merge: Filter out tombstones, add overlay edges
    const validCanonical = canonicalEdges.filter(e => this.overlayEdges.get(e.id) !== null);
    const combined = [...validCanonical];
    for (const oe of overlayEdges) {
      if ((!type || oe.relationshipType === type) && !combined.find(e => e.id === oe.id)) {
        combined.push(oe);
      }
    }
    return combined;
  }

  async getIncomingEdges(nodeId: string, type?: string): Promise<SemanticEdge[]> {
    if (this.overlayNodes.get(nodeId) === null) return []; // Node is deleted
    const canonicalEdges = await this.canonicalGraph.getIncomingEdges(nodeId, type);
    const overlayEdges = this.overlayIncoming.get(nodeId) || [];
    
    // Merge
    const validCanonical = canonicalEdges.filter(e => this.overlayEdges.get(e.id) !== null);
    const combined = [...validCanonical];
    for (const oe of overlayEdges) {
      if ((!type || oe.relationshipType === type) && !combined.find(e => e.id === oe.id)) {
        combined.push(oe);
      }
    }
    return combined;
  }
}
