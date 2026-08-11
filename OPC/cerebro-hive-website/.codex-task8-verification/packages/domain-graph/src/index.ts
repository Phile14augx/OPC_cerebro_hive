export interface Node {
  id: string;
  type: string;
  properties: Record<string, any>;
}

export interface Edge {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: string;
  properties?: Record<string, any>;
}

export interface TraversalQuery {
  startNodeId: string;
  relationshipFilters?: string[];
  targetNodeType?: string;
  maxDepth?: number;
}

export class DomainGraph {
  private nodes: Map<string, Node> = new Map();
  private edges: Map<string, Edge> = new Map();
  private adjacencyList: Map<string, string[]> = new Map(); // sourceId -> edgeIds

  addNode(node: Node) {
    this.nodes.set(node.id, node);
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, []);
    }
  }

  addEdge(edge: Edge) {
    this.edges.set(edge.id, edge);
    const edgesFromSource = this.adjacencyList.get(edge.sourceId) || [];
    edgesFromSource.push(edge.id);
    this.adjacencyList.set(edge.sourceId, edgesFromSource);
  }

  traverse(query: TraversalQuery): Node[] {
    const visited = new Set<string>();
    const result: Node[] = [];
    const queue: { nodeId: string, depth: number }[] = [{ nodeId: query.startNodeId, depth: 0 }];

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (visited.has(current.nodeId)) continue;
      visited.add(current.nodeId);

      const node = this.nodes.get(current.nodeId);
      if (node && query.targetNodeType && node.type === query.targetNodeType) {
        result.push(node);
      } else if (node && !query.targetNodeType) {
        result.push(node);
      }

      if (query.maxDepth !== undefined && current.depth >= query.maxDepth) continue;

      const outgoingEdgeIds = this.adjacencyList.get(current.nodeId) || [];
      for (const edgeId of outgoingEdgeIds) {
        const edge = this.edges.get(edgeId)!;
        if (query.relationshipFilters && !query.relationshipFilters.includes(edge.relationship)) continue;
        queue.push({ nodeId: edge.targetId, depth: current.depth + 1 });
      }
    }

    return result;
  }
}
