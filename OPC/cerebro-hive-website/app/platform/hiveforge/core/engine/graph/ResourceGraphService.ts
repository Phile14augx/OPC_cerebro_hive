/**
 * Resource Graph Service & Topology API
 */

import { InventoryResource } from "../../contracts/inventory";

export type GraphNodeType = "Organization" | "Workspace" | "Project" | "Deployment" | "Resource" | "Policy";
export type GraphEdgeType = "depends_on" | "owned_by" | "deployed_to" | "secured_by" | "monitored_by";

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  metadata: any; // Could be InventoryResource for 'Resource' types
}

export interface GraphEdge {
  sourceId: string;
  targetId: string;
  type: GraphEdgeType;
}

export interface TopologyData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export class ResourceGraphService {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdge[] = [];

  addNode(node: GraphNode) {
    this.nodes.set(node.id, node);
  }

  addEdge(edge: GraphEdge) {
    this.edges.push(edge);
  }

  // Topology API (UI Agnostic)
  getTopology(rootId?: string): TopologyData {
    if (!rootId) {
      return { nodes: Array.from(this.nodes.values()), edges: this.edges };
    }
    // Simple traversal logic could go here
    return { nodes: Array.from(this.nodes.values()), edges: this.edges };
  }

  getDependents(resourceId: string): GraphNode[] {
    const dependentEdges = this.edges.filter(e => e.targetId === resourceId && e.type === "depends_on");
    return dependentEdges.map(e => this.nodes.get(e.sourceId)).filter(Boolean) as GraphNode[];
  }
  
  getDependencies(resourceId: string): GraphNode[] {
    const dependencyEdges = this.edges.filter(e => e.sourceId === resourceId && e.type === "depends_on");
    return dependencyEdges.map(e => this.nodes.get(e.targetId)).filter(Boolean) as GraphNode[];
  }
}

export const resourceGraphService = new ResourceGraphService();
