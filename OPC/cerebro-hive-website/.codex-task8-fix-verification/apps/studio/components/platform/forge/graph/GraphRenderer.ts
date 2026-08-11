import React from "react";

export interface GraphNode {
  id: string;
  label: string;
  group: string;
  val: number; // size
  color?: string;
  x?: number;
  y?: number;
  z?: number;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  label: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface GraphRendererProps {
  data: GraphData;
  onNodeClick?: (node: GraphNode) => void;
  width?: number;
  height?: number;
  mode?: "2d" | "3d";
}

export interface GraphRenderer {
  render(props: GraphRendererProps): React.ReactElement;
}
