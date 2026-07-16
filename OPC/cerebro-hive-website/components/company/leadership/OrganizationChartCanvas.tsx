"use client";

import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Node,
  Edge,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTheme } from 'next-themes';
import { toPng } from 'html-to-image';

import { OrganizationService, OrganizationNodeData } from '@/lib/services/organizationService';
import { useElkLayout } from './org-chart/useElkLayout';
import { CEOExecutiveNode } from './org-chart/CEOExecutiveNode';
import { DepartmentNode } from './org-chart/DepartmentNode';
import { TeamNode } from './org-chart/TeamNode';
import { AnimatedNeuralEdge } from './org-chart/AnimatedNeuralEdge';
import { InspectorPanel } from './org-chart/InspectorPanel';
import { OrgNavRail } from './org-chart/OrgNavRail';
import { OrgStatusBar } from './org-chart/OrgStatusBar';
import { OrganizationWorkspaceProvider, useOrganizationWorkspace } from './org-chart/OrganizationWorkspaceContext';

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
  const { getLayoutedElements } = useElkLayout();
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  
  const { expandedNodes, setExpandedNodes, setSelectedNode } = useOrganizationWorkspace();

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
    setSelectedNode(orgData);

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
        id: `e-${orgData.id}-${child.id}`,
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
  }, [nodes, edges, expandedNodes, getLayoutedElements, setNodes, setEdges, setCenter, setExpandedNodes, setSelectedNode]);

  // Deselect on canvas click
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  return (
    <div className="relative w-full h-[700px] bg-surface">
      
      <div 
        className="absolute inset-4 overflow-hidden" 
        style={{
          borderRadius: '32px',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 0 80px rgba(0,0,0,0.8), inset 0 0 40px rgba(0,0,0,0.5)',
          background: '#050a0f'
        }}
      >
        
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
          onPaneClick={onPaneClick}
          minZoom={0.1}
          maxZoom={1.5}
          className="z-10"
        >
          {/* Top Left Title (Floating inside canvas) */}
          <div className="absolute top-6 left-24 z-50 pointer-events-none">
            <h1 className="text-base font-space font-bold uppercase tracking-widest text-text-primary drop-shadow-md">Corporate Structure</h1>
          </div>

          <InspectorPanel />
        </ReactFlow>

        <OrgNavRail />
        <OrgStatusBar />

      </div>
    </div>
  );
};

export const OrganizationChartCanvas = () => {
  return (
    <OrganizationWorkspaceProvider>
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </OrganizationWorkspaceProvider>
  );
};
