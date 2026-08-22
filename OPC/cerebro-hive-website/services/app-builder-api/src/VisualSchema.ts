
export interface VisualNode {
  id: string;
  type: string; // 'Prompt', 'Agent', 'Condition', 'Tool'
  data: Record<string, unknown>;
}

export interface VisualEdge {
  id: string;
  source: string;
  target: string;
}

export interface ApplicationGraph {
  graphVersion: string;
  nodes: VisualNode[];
  edges: VisualEdge[];
  metadata: Record<string, unknown>;
}
