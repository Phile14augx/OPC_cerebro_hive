export interface DAGNode {
  id: string;
  type: string;
  dependencies: string[];
}

export interface WorkflowGraph {
  nodes: DAGNode[];
  edges: { from: string; to: string }[];
}
