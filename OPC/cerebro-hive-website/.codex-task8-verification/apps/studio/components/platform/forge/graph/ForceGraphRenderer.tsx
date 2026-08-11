"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { GraphRenderer, GraphRendererProps } from "./GraphRenderer";
import { useTheme } from "next-themes";

// We dynamically import the force graphs to prevent SSR issues (window is not defined)
const ForceGraph2D: any = dynamic(() => import("react-force-graph-2d").then(m => m.default) as any, { ssr: false });
const ForceGraph3D: any = dynamic(() => import("react-force-graph-3d").then(m => m.default) as any, { ssr: false });

export const ForceGraphRendererComponent: React.FC<GraphRendererProps> = ({ data, onNodeClick, width, height, mode = "3d" }) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const fgRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNodeClick = useCallback((node: any) => {
    if (mode === "3d" && fgRef.current) {
      // Aim at node from outside it
      const distance = 40;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
      fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
        node, // lookAt ({ x, y, z })
        3000  // ms transition duration
      );
    }
    if (onNodeClick) onNodeClick(node);
  }, [mode, onNodeClick]);

  if (!mounted) return <div style={{ width: width || "100%", height: height || 400 }} className="bg-slate-900/20 animate-pulse rounded-lg" />;

  const isDark = theme === "dark";
  const bgColor = isDark ? "#00000000" : "#ffffff00"; // transparent
  const textColor = isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)";
  const linkColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)";

  if (mode === "2d") {
    return (
      <ForceGraph2D
        ref={fgRef}
        width={width}
        height={height}
        graphData={data}
        nodeLabel="label"
        nodeColor={(n: any) => n.color || (isDark ? "#3b82f6" : "#2563eb")}
        nodeRelSize={6}
        linkColor={() => linkColor}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={(d: any) => 0.005}
        onNodeClick={handleNodeClick}
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
      nodeColor={(n: any) => n.color || (isDark ? "#3b82f6" : "#2563eb")}
      nodeRelSize={6}
      linkColor={() => linkColor}
      linkDirectionalParticles={2}
      linkDirectionalParticleSpeed={(d: any) => 0.005}
      onNodeClick={handleNodeClick}
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
