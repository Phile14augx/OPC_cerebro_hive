export interface WorkflowNode {
  readonly id: string;
}

export interface WorkflowEdge {
  readonly sourceNodeId: string;
  readonly targetNodeId: string;
}

export class ValidDagSpecification {
  isSatisfiedBy(nodes: readonly WorkflowNode[], edges: readonly WorkflowEdge[]): boolean {
    // Basic validation: ensure all edge sources and targets exist in nodes
    const nodeIds = new Set(nodes.map(n => n.id));
    return edges.every(e => nodeIds.has(e.sourceNodeId) && nodeIds.has(e.targetNodeId));
  }
}
