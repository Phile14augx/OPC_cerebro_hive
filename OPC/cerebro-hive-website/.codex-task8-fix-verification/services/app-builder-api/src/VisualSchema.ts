
export interface VisualNode {
  id: string;
  type: string; // 'Prompt', 'Agent', 'Condition', 'Tool'
  data: Record<string, any>;
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
  metadata: Record<string, any>;
}
