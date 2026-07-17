"use client";

import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
  ReactFlowProvider,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { toPng, toSvg } from 'html-to-image';
import { ArchitectureNode } from './ArchitectureNode';
import { SolutionFlowNode } from './SolutionFlowNode';
import { AnimatedEdge } from './AnimatedEdge';
import { Download, Maximize, Search, Image as ImageIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

const nodeTypes = {
  architectureNode: ArchitectureNode,
  solutionFlowNode: SolutionFlowNode,
};

const edgeTypes = {
  animatedEdge: AnimatedEdge,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getNodeDimensions = (node: Node) => {
  if (node.type === 'solutionFlowNode') return { width: 280, height: 170 };
  return { width: 200, height: 80 };
};

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, ranksep: 80, nodesep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, getNodeDimensions(node));
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const { width, height } = getNodeDimensions(node);
    const newNode = { ...node };
    newNode.targetPosition = isHorizontal ? 'left' : 'top' as any;
    newNode.sourcePosition = isHorizontal ? 'right' : 'bottom' as any;
    newNode.position = {
      x: nodeWithPosition.x - width / 2,
      y: nodeWithPosition.y - height / 2,
    };
    return newNode;
  });

  return { nodes: layoutedNodes, edges };
};

interface ArchitectureCanvasProps {
  initialNodes: any[];
  initialEdges: any[];
  direction?: 'TB' | 'LR';
  className?: string;
}

const Flow = ({ initialNodes, initialEdges, direction = 'LR' }: ArchitectureCanvasProps) => {
  const { theme } = useTheme();
  
  // Convert standard nodes to our custom node type, honoring an explicit per-node type if provided
  const processedNodes = useMemo(() => {
    return initialNodes.map(node => ({
      ...node,
      type: node.type || 'architectureNode'
    }));
  }, [initialNodes]);

  // Convert standard edges to our custom edge type
  const processedEdges = useMemo(() => {
    return initialEdges.map(edge => ({
      ...edge,
      type: 'animatedEdge',
      data: { ...edge.data, animated: edge.animated || false }
    }));
  }, [initialEdges]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(processedNodes, processedEdges, direction),
    [processedNodes, processedEdges, direction]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  const flowRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle Search
  useEffect(() => {
    if (!searchTerm) {
      setNodes((nds) => nds.map(n => ({ ...n, style: { opacity: 1 } })));
      return;
    }
    setNodes((nds) => nds.map((n) => {
      const isMatch = n.data?.label?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      return {
        ...n,
        style: { ...n.style, opacity: isMatch ? 1 : 0.2 }
      };
    }));
  }, [searchTerm, setNodes]);

  const onDownloadPng = useCallback(() => {
    if (flowRef.current === null) return;
    toPng(flowRef.current, { backgroundColor: theme === 'light' ? '#F7F9FC' : '#050A0F' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'architecture.png';
        link.href = dataUrl;
        link.click();
      });
  }, [theme]);

  const onDownloadSvg = useCallback(() => {
    if (flowRef.current === null) return;
    toSvg(flowRef.current, { backgroundColor: theme === 'light' ? '#F7F9FC' : '#050A0F' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'architecture.svg';
        link.href = dataUrl;
        link.click();
      });
  }, [theme]);

  return (
    <div className="w-full h-full relative" ref={flowRef}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-background rounded-xl"
        proOptions={{ hideAttribution: true }}
      >
        <Background color={theme === 'light' ? '#E5E7EB' : '#1A2332'} gap={16} size={1} />
        <Controls className="bg-surface border-border !fill-text-primary" />
        <MiniMap 
          nodeColor={theme === 'light' ? '#E5E7EB' : '#1A2332'} 
          maskColor={theme === 'light' ? 'rgba(247, 249, 252, 0.7)' : 'rgba(5, 10, 15, 0.7)'}
          className="bg-surface border border-border rounded-lg overflow-hidden" 
        />
        
        <Panel position="top-right" className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Find node..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-surface border border-border rounded-md text-xs text-text-primary focus:outline-none focus:border-primary-accent"
            />
          </div>
          <button onClick={onDownloadPng} className="p-1.5 bg-surface border border-border rounded-md text-text-muted hover:text-text-primary hover:border-primary-accent transition-colors" title="Download PNG">
            <ImageIcon size={16} />
          </button>
          <button onClick={onDownloadSvg} className="p-1.5 bg-surface border border-border rounded-md text-text-muted hover:text-text-primary hover:border-primary-accent transition-colors" title="Download SVG">
            <Download size={16} />
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export const ArchitectureCanvas = (props: ArchitectureCanvasProps) => {
  return (
    <ReactFlowProvider>
      <div className={cn("w-full h-[600px] border border-border rounded-xl overflow-hidden bg-background", props.className)}>
        <Flow {...props} />
      </div>
    </ReactFlowProvider>
  );
};
