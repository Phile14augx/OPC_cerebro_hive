import { KnowledgeGraphPort } from '../ports/KnowledgeGraphPort';
import { SemanticNode } from '../domain/SemanticNode';

export class GraphAlgorithms {
  constructor(private readonly graph: KnowledgeGraphPort) {}

  // BFS to find all downstream impacted nodes (Blast Radius)
  async getBlastRadius(startNodeId: string, maxDepth: number = 3): Promise<SemanticNode[]> {
    const visited = new Set<string>();
    const queue: { id: string, depth: number }[] = [{ id: startNodeId, depth: 0 }];
    const impactedNodes: SemanticNode[] = [];

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      
      if (!visited.has(id)) {
        visited.add(id);
        
        if (id !== startNodeId) {
          const node = await this.graph.getNode(id);
          if (node) impactedNodes.push(node);
        }

        if (depth < maxDepth) {
          // 'AFFECTS' or 'DEPENDS_ON' (incoming, since we depend on them, if they break, we are impacted)
          // Actually, if startNode is broken, who depends on startNode?
          // If X DEPENDS_ON Y, and Y breaks, X is impacted.
          // So we look for INCOMING 'DEPENDS_ON' edges to find who depends on us.
          const incoming = await this.graph.getIncomingEdges(id, 'DEPENDS_ON');
          for (const edge of incoming) {
            queue.push({ id: edge.sourceId, depth: depth + 1 });
          }
          
          // If startNode AFFECTS something (e.g., Risk AFFECTS Asset), go outgoing.
          const outgoing = await this.graph.getOutgoingEdges(id, 'AFFECTS');
          for (const edge of outgoing) {
            queue.push({ id: edge.targetId, depth: depth + 1 });
          }
        }
      }
    }

    return impactedNodes;
  }

  // BFS to find all upstream dependencies (What does this node depend on?)
  async getDependencies(startNodeId: string, maxDepth: number = 5): Promise<SemanticNode[]> {
    const visited = new Set<string>();
    const queue: { id: string, depth: number }[] = [{ id: startNodeId, depth: 0 }];
    const dependencies: SemanticNode[] = [];

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      
      if (!visited.has(id)) {
        visited.add(id);
        
        if (id !== startNodeId) {
          const node = await this.graph.getNode(id);
          if (node) dependencies.push(node);
        }

        if (depth < maxDepth) {
          // X DEPENDS_ON Y (outgoing)
          const outgoing = await this.graph.getOutgoingEdges(id, 'DEPENDS_ON');
          for (const edge of outgoing) {
            queue.push({ id: edge.targetId, depth: depth + 1 });
          }
        }
      }
    }

    return dependencies;
  }
}
