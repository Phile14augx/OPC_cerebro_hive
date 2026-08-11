
/**
 * Platform-wide provenance model.
 * 
 * Every platform subsystem that participates in a review adds its outputs
 * as nodes. Edges represent derivation relationships, enabling any conclusion
 * to be traced back through the artifact chain that produced it.
 * 
 * Node types: WorkflowVersion | SemanticChangeset | SimulationRun |
 *             ExecutionTrace | PlannerTrace | PolicyEvaluation |
 *             ReadinessReport | EngineeringReviewReport
 */

export interface EvidenceNode {
  id: string;
  type: 'WorkflowVersion' | 'SemanticChangeset' | 'SimulationRun' | 'ExecutionTrace' | 'PlannerTrace' | 'PolicyEvaluation' | 'ReadinessReport' | 'EngineeringReviewReport';
  label: string;
  data: unknown;
  addedAt?: Date;
}

export interface EvidenceEdge {
  from: string;
  to: string;
  relation: 'derivedFrom' | 'validates' | 'contradicts' | 'supersedes' | 'references';
}

export class EvidenceGraph {
  private nodes = new Map<string, EvidenceNode>();
  private edges: EvidenceEdge[] = [];

  addNode(node: EvidenceNode) { this.nodes.set(node.id, { ...node, addedAt: new Date() }); }
  addEdge(edge: EvidenceEdge) { this.edges.push(edge); }

  getNode(id: string) { return this.nodes.get(id); }
  getNodesOfType(type: EvidenceNode['type']) { return [...this.nodes.values()].filter(n => n.type === type); }

  /** Traces all ancestors of a node — enables "how was this conclusion reached?" */
  traceProvenance(nodeId: string): EvidenceNode[] {
    const visited = new Set<string>();
    const result: EvidenceNode[] = [];
    const queue = [nodeId];
    while (queue.length) {
      const id = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      const node = this.nodes.get(id);
      if (node) result.push(node);
      this.edges.filter(e => e.to === id).forEach(e => queue.push(e.from));
    }
    return result;
  }

  export() { return { nodes: [...this.nodes.values()], edges: this.edges }; }
}
