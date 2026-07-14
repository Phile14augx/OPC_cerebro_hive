"use client";

import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Node,
  Edge,
  useReactFlow,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Download, Maximize2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { toPng } from 'html-to-image';

import { OrganizationService, OrganizationNodeData } from '@/lib/services/organizationService';
import { useElkLayout } from './org-chart/useElkLayout';
import { CEOExecutiveNode } from './org-chart/CEOExecutiveNode';
import { DepartmentNode } from './org-chart/DepartmentNode';
import { TeamNode } from './org-chart/TeamNode';
import { AnimatedNeuralEdge } from './org-chart/AnimatedNeuralEdge';
import { InspectorPanel } from './org-chart/InspectorPanel';

const nodeTypes = {
  executive: CEOExecutiveNode,
  department: DepartmentNode,
  team: TeamNode
};

const edgeTypes = {
  neural: AnimatedNeuralEdge
};

const Flow = () => {
  const { theme } = useTheme();
  const { fitView, setCenter } = useReactFlow();
  const { getLayoutedElements, isLayouting } = useElkLayout();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedOrgNode, setSelectedOrgNode] = useState<OrganizationNodeData | null>(null);

  const flowRef = useRef<HTMLDivElement>(null);

  // Initial Load
  useEffect(() => {
    const loadRoot = async () => {
      const rootData = await OrganizationService.getRootNode();
      const initialNode: Node = {
        id: rootData.id,
        type: 'executive',
        position: { x: 0, y: 0 },
        data: rootData
      };
      
      const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements([initialNode], []);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      window.setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 50);
    };
    loadRoot();
  }, [getLayoutedElements, setNodes, setEdges, fitView]);

  // Handle Node Click (Selection + Lazy Expansion)
  const onNodeClick = useCallback(async (_: React.MouseEvent, node: Node) => {
    const orgData = node.data as unknown as OrganizationNodeData;
    setSelectedOrgNode(orgData);

    // If it has children and isn't expanded yet, lazy load them
    if (orgData.hasChildren && !expandedNodes.has(orgData.id)) {
      const childrenData = await OrganizationService.getChildren(orgData.id);
      
      const newNodes: Node[] = childrenData.map(child => ({
        id: child.id,
        type: child.type,
        position: { x: node.position.x, y: node.position.y }, // spawn at parent
        data: child
      }));

      const newEdges: Edge[] = childrenData.map(child => ({
        id: \e-\-\\,
        source: orgData.id,
        target: child.id,
        type: 'neural',
        data: { theme: child.theme },
        animated: true
      }));

      const allNodes = [...nodes, ...newNodes];
      const allEdges = [...edges, ...newEdges];

      const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(allNodes, allEdges);
      
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setExpandedNodes(prev => new Set(prev).add(orgData.id));
      
      // Center on the expanded node
      const centerNode = layoutedNodes.find(n => n.id === orgData.id);
      if (centerNode) {
        window.setTimeout(() => {
          setCenter(centerNode.position.x + 100, centerNode.position.y + 100, { zoom: 0.8, duration: 800 });
        }, 50);
      }
    }
  }, [nodes, edges, expandedNodes, getLayoutedElements, setNodes, setEdges, setCenter]);

  // Download
  const onDownloadPng = useCallback(() => {
    if (flowRef.current === null) return;
    toPng(flowRef.current, { backgroundColor: theme === 'light' ? '#FFFFFF' : '#050A0F' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'cerebrohive-org.png';
        link.href = dataUrl;
        link.click();
      });
  }, [theme]);

  return (
    <div className="relative w-full h-[700px] border border-border rounded-3xl overflow-hidden bg-[#050a0f]" ref={flowRef}>
      
      {/* Premium Ambient Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-accent/10 rounded-full blur-[120px]" />
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        minZoom={0.1}
        maxZoom={1.5}
        className="z-10"
      >
        <Panel position="top-left" className="m-4 pointer-events-none">
          <div className="px-4 py-2 bg-background/80 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl pointer-events-auto">
            <h1 className="text-sm font-space font-bold uppercase tracking-widest text-white">Organization Intelligence Map</h1>
            <p className="text-[10px] text-text-muted font-inter">Interactive Operating System</p>
          </div>
        </Panel>

        <Panel position="top-right" className="m-4 flex gap-2">
          <button onClick={() => fitView({ padding: 0.2, duration: 800 })} className="px-3 py-2 bg-background/80 backdrop-blur border border-white/10 rounded-lg text-white hover:bg-white/5 transition-colors">
            <Maximize2 size={16} />
          </button>
          <button onClick={onDownloadPng} className="px-4 py-2 bg-background/80 backdrop-blur border border-white/10 rounded-lg text-white hover:bg-white/5 transition-colors flex items-center gap-2 text-xs font-space font-bold uppercase">
            <Download size={14} /> Export PNG
          </button>
        </Panel>

        <Controls className="!bg-background/80 !backdrop-blur !border-white/10 !shadow-2xl !rounded-lg overflow-hidden [&>button]:!border-b-white/10 [&>button]:!text-white hover:[&>button]:!bg-white/5" />
        
        <MiniMap 
          nodeColor={n => n.type === 'executive' ? '#F59E0B' : n.type === 'team' ? '#6B7280' : '#3B82F6'}
          maskColor="rgba(0, 0, 0, 0.8)"
          className="!bg-background/90 !backdrop-blur-xl !border-white/10 !shadow-2xl !rounded-xl overflow-hidden" 
        />
      </ReactFlow>

      {/* Slide-in Inspector Panel */}
      <InspectorPanel node={selectedOrgNode} onClose={() => setSelectedOrgNode(null)} />
    </div>
  );
};

export const OrganizationChartCanvas = () => {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
};
