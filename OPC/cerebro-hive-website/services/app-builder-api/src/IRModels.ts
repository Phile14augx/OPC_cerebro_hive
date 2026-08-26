
// Intermediate Representation (IR)
export interface IRNode {
  id: string;
  operation: string;
  inputs: Record<string, unknown>;
  dependencies: string[];
}

export interface IRGraph {
  nodes: IRNode[];
}
