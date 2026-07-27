
export interface DependencyNode {
  nodeId: string;
  upstreamIds: string[];
  downstreamIds: string[];
}

export class DependencyGraph {
  private nodes: Map<string, DependencyNode> = new Map();

  public buildFromEdges(edges: { source: string; target: string }[]) {
    this.nodes.clear();
    edges.forEach(edge => {
      if (!this.nodes.has(edge.source)) this.nodes.set(edge.source, { nodeId: edge.source, upstreamIds: [], downstreamIds: [] });
      if (!this.nodes.has(edge.target)) this.nodes.set(edge.target, { nodeId: edge.target, upstreamIds: [], downstreamIds: [] });
      
      this.nodes.get(edge.source)!.downstreamIds.push(edge.target);
      this.nodes.get(edge.target)!.upstreamIds.push(edge.source);
    });
  }

  public getDownstreamRecursive(nodeId: string): string[] {
    const affected = new Set<string>();
    const visit = (id: string) => {
      if (affected.has(id)) return;
      affected.add(id);
      this.nodes.get(id)?.downstreamIds.forEach(visit);
    };
    visit(nodeId);
    return Array.from(affected);
  }
}
