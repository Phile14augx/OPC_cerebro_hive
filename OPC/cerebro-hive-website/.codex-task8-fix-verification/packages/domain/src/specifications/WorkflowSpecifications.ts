export class ValidDagSpecification {
  isSatisfiedBy(nodes: any[], edges: any[]): boolean {
    // Basic validation: ensure all edge sources and targets exist in nodes
    const nodeIds = new Set(nodes.map(n => n.id));
    return edges.every(e => nodeIds.has(e.sourceNodeId) && nodeIds.has(e.targetNodeId));
  }
}
