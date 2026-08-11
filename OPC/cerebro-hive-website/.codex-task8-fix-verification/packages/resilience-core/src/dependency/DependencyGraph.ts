export type DependencyType = 'Application' | 'Database' | 'Infrastructure' | 'Vendor' | 'IdentityProvider';

export interface OperationalNode {
  nodeId: string;
  name: string;
  type: DependencyType | 'BusinessService'; // root nodes are BusinessService
  statedRtoHours: number; // Native recovery capability of this specific node
}

export interface OperationalDependency {
  sourceId: string; // The parent that depends on the target
  targetId: string;
  type: DependencyType;
}

export class DependencyGraph {
  private nodes = new Map<string, OperationalNode>();
  private dependencies: OperationalDependency[] = [];

  addNode(node: OperationalNode) {
    this.nodes.set(node.nodeId, node);
  }

  getNode(id: string): OperationalNode | undefined {
    return this.nodes.get(id);
  }

  addDependency(sourceId: string, targetId: string, type: DependencyType) {
    this.dependencies.push({ sourceId, targetId, type });
  }

  getDependencies(sourceId: string): OperationalDependency[] {
    return this.dependencies.filter(d => d.sourceId === sourceId);
  }

  getParents(targetId: string): OperationalDependency[] {
    return this.dependencies.filter(d => d.targetId === targetId);
  }
}
