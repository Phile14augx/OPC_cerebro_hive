
export interface XYPosition { x: number; y: number; }

export interface StudioNode {
  id: string;
  type: string;
  position: XYPosition;
  configuration: Record<string, any>;
}

export interface StudioEdge {
  id: string;
  source: string;
  target: string;
  sourcePort?: string;
  targetPort?: string;
}

export interface StudioGraph {
  nodes: StudioNode[];
  edges: StudioEdge[];
}
