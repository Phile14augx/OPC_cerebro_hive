"use client";

import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Node,
  Edge,
  Handle,
  Position,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { toPng } from 'html-to-image';
import { Download, Users, Code, Lightbulb, TrendingUp, Settings, Briefcase, Activity } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

// --- Node Icon Mapping ---
const iconMap: Record<string, React.ReactNode> = {
  executive: <Briefcase size={16} />,
  engineering: <Code size={16} />,
  research: <Lightbulb size={16} />,
  product: <Activity size={16} />,
  operations: <Settings size={16} />,
  business: <TrendingUp size={16} />,
  default: <Users size={16} />
};

// --- Custom Node Component ---
const OrganizationNode = ({ data }: { data: any }) => {
  const type = data.type || 'default';

  return (
    <div className="relative group min-w-[200px] bg-background border border-border shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary-accent/50">
      
      {/* Notion-style header bar */}
      <div className="h-1 w-full bg-border group-hover:bg-primary-accent/70 transition-colors" />
      
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-text-secondary border border-border">
            {iconMap[type] || iconMap.default}
          </div>
          <div>
            <h4 className="text-sm font-space font-bold text-text-primary whitespace-nowrap">{data.label}</h4>
            {data.subtitle && (
              <p className="text-[10px] text-text-muted font-inter uppercase tracking-wide">{data.subtitle}</p>
            )}
          </div>
        </div>
        
        {data.description && (
          <p className="text-xs text-text-secondary font-inter leading-relaxed line-clamp-2">
            {data.description}
          </p>
        )}

        {/* View Teams expander (Mock UX for now) */}
        {data.hasTeams && (
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-primary-accent font-space font-medium cursor-pointer hover:text-text-primary transition-colors">
            View Teams <span>→</span>
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 !bg-surface !border-border" />
      <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 !bg-surface !border-border" />
    </div>
  );
};

const nodeTypes = {
  orgNode: OrganizationNode,
};

// --- DAGRE Layout Engine ---
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction, ranksep: 60, nodesep: 40 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 220, height: 120 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = { ...node };
    newNode.targetPosition = Position.Top;
    newNode.sourcePosition = Position.Bottom;
    newNode.position = {
      x: nodeWithPosition.x - 220 / 2,
      y: nodeWithPosition.y - 120 / 2,
    };
    return newNode;
  });

  return { nodes: layoutedNodes, edges };
};

// --- Canvas Component ---
interface OrgChartProps {
  initialNodes: any[];
  initialEdges: any[];
  className?: string;
}

const Flow = ({ initialNodes, initialEdges }: OrgChartProps) => {
  const { theme } = useTheme();
  
  // Format nodes for our specific org Node
  const processedNodes = useMemo(() => {
    return initialNodes.map(node => ({
      ...node,
      type: 'orgNode'
    }));
  }, [initialNodes]);

  // Clean, thin edges for org chart (no animation or neon glow)
  const processedEdges = useMemo(() => {
    return initialEdges.map(edge => ({
      ...edge,
      style: { stroke: 'var(--border)', strokeWidth: 1.5 },
      type: 'default' // Built-in xyflow edge, nice and clean
    }));
  }, [initialEdges]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(processedNodes, processedEdges, 'TB'),
    [processedNodes, processedEdges]
  );

  const [nodes, setNodes] = useNodesState(layoutedNodes);
  const [edges, setEdges] = useEdgesState(layoutedEdges);
  const flowRef = useRef<HTMLDivElement>(null);

  const onDownloadPng = useCallback(() => {
    if (flowRef.current === null) return;
    toPng(flowRef.current, { backgroundColor: theme === 'light' ? '#FFFFFF' : '#050A0F' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'cerebrohive-org-chart.png';
        link.href = dataUrl;
        link.click();
      });
  }, [theme]);

  return (
    <div className="relative w-full h-[600px] border border-border rounded-3xl overflow-hidden bg-surface-elevated" ref={flowRef}>
      
      {/* Top Bar for Org Chart */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
        <div className="px-4 py-2 bg-background/80 backdrop-blur border border-border rounded-lg shadow-sm">
          <p className="text-xs font-space font-bold uppercase tracking-widest text-text-primary">Corporate Structure</p>
        </div>
        <button 
          onClick={onDownloadPng}
          className="pointer-events-auto px-4 py-2 bg-background/80 backdrop-blur border border-border rounded-lg shadow-sm text-text-primary hover:text-primary-accent hover:border-primary-accent transition-colors flex items-center gap-2 text-xs font-space font-bold uppercase"
        >
          <Download size={14} /> Export PNG
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.5}
        className="react-flow-org-theme"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={1.5} 
          color={theme === 'dark' ? '#333' : '#E5E7EB'} 
        />
        <Controls className="!bg-background !border-border !shadow-sm !rounded-lg overflow-hidden [&>button]:!border-b-border [&>button]:!text-text-primary hover:[&>button]:!bg-surface" />
        <MiniMap 
          nodeColor={theme === 'dark' ? '#1F2937' : '#F3F4F6'}
          maskColor={theme === 'dark' ? 'rgba(5, 10, 15, 0.7)' : 'rgba(255, 255, 255, 0.7)'}
          className="!bg-background !border-border !shadow-sm !rounded-xl overflow-hidden" 
        />
      </ReactFlow>
    </div>
  );
};

export const OrganizationChartCanvas = (props: OrgChartProps) => {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
};
