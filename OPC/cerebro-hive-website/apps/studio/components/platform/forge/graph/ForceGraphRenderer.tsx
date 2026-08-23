"use client";

import React, { useCallback, useRef, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import type { ForceGraphMethods as ForceGraph3DMethods, NodeObject as ForceGraph3DNode } from "react-force-graph-3d";
import { GraphNode, GraphRenderer, GraphRendererProps } from "./GraphRenderer";
import { useTheme } from "next-themes";

// We dynamically import the force graphs to prevent SSR issues (window is not defined)
const ForceGraph2D = dynamic(() => import("react-force-graph-2d").then((module) => module.default), { ssr: false });
const ForceGraph3D = dynamic(() => import("react-force-graph-3d").then((module) => module.default), { ssr: false });

const isGraphNode = (node: object): node is GraphNode =>
  typeof Reflect.get(node, "id") === "string"
  && typeof Reflect.get(node, "label") === "string"
  && typeof Reflect.get(node, "group") === "string"
  && typeof Reflect.get(node, "val") === "number";

const isFiniteCoordinate = (coordinate: number | undefined): coordinate is number =>
  typeof coordinate === "number" && Number.isFinite(coordinate);

export const ForceGraphRendererComponent: React.FC<GraphRendererProps> = ({ data, onNodeClick, width, height, mode = "3d" }) => {
  const { theme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const fgRef = useRef<ForceGraph3DMethods<ForceGraph3DNode> | undefined>(undefined);

  const handleNodeClick = useCallback((node: GraphNode) => {
    if (mode === "3d" && fgRef.current) {
      // Aim at node from outside it
      const distance = 40;
      if (isFiniteCoordinate(node.x) && isFiniteCoordinate(node.y) && isFiniteCoordinate(node.z)) {
        const { x, y, z } = node;
        const distanceFromOrigin = Math.hypot(x, y, z);
        const distanceRatio = distanceFromOrigin === 0 ? 1 : 1 + distance / distanceFromOrigin;
        const cameraPosition = distanceFromOrigin === 0
          ? { x: distance, y: 0, z: 0 }
          : { x: x * distanceRatio, y: y * distanceRatio, z: z * distanceRatio };

        if (Object.values(cameraPosition).every(Number.isFinite)) {
          fgRef.current.cameraPosition(
            cameraPosition,
            { x, y, z },
            3000,
          );
        }
      }
    }
    if (onNodeClick) onNodeClick(node);
  }, [mode, onNodeClick]);

  if (!mounted) return <div style={{ width: width || "100%", height: height || 400 }} className="bg-slate-900/20 animate-pulse rounded-lg" />;

  const isDark = theme === "dark";
  const bgColor = isDark ? "#00000000" : "#ffffff00"; // transparent
  const linkColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)";

  if (mode === "2d") {
    return (
      <ForceGraph2D
        width={width}
        height={height}
        graphData={data}
        nodeLabel="label"
        nodeColor={(node) => typeof node.color === "string" ? node.color : isDark ? "#3b82f6" : "#2563eb"}
        nodeRelSize={6}
        linkColor={() => linkColor}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={() => 0.005}
        onNodeClick={(node) => {
          if (isGraphNode(node)) handleNodeClick(node);
        }}
        backgroundColor={bgColor}
      />
    );
  }

  return (
    <ForceGraph3D
      ref={fgRef}
      width={width}
      height={height}
      graphData={data}
      nodeLabel="label"
      nodeColor={(node) => typeof node.color === "string" ? node.color : isDark ? "#3b82f6" : "#2563eb"}
      nodeRelSize={6}
      linkColor={() => linkColor}
      linkDirectionalParticles={2}
      linkDirectionalParticleSpeed={() => 0.005}
      onNodeClick={(node) => {
        if (isGraphNode(node)) handleNodeClick(node);
      }}
      backgroundColor={bgColor}
      enableNodeDrag={false}
    />
  );
};

export class ForceGraphRendererProvider implements GraphRenderer {
  render(props: GraphRendererProps): React.ReactElement {
    return <ForceGraphRendererComponent {...props} />;
  }
}
