
// Intermediate Representation (IR)
export interface IRNode {
  id: string;
  operation: string;
  inputs: Record<string, any>;
  dependencies: string[];
}

export interface IRGraph {
  nodes: IRNode[];
}
