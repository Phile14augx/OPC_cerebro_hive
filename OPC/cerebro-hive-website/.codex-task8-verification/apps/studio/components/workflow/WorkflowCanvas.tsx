'use client';

import React, { useMemo } from 'react';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, BackgroundVariant, NodeProps, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { WorkflowConfiguration } from '@cerebro/sdk';
import { useWorkflowStudioStore } from '@/src/store/useWorkflowStudioStore';

// --- Custom Nodes ---

const StartNode = ({ data }: NodeProps) => (
  <div className="px-4 py-2 bg-green-500/20 border-2 border-green-500 rounded-full text-sm font-bold text-green-700 dark:text-green-400">
    {data.label as string}
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-500" />
  </div>
);

const EndNode = ({ data }: NodeProps) => (
  <div className="px-4 py-2 bg-red-500/20 border-2 border-red-500 rounded-full text-sm font-bold text-red-700 dark:text-red-400">
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-red-500" />
    {data.label as string}
  </div>
);

const AgentNode = ({ data }: NodeProps) => (
  <div className="px-4 py-3 bg-background border-2 border-blue-500 rounded-lg shadow-sm min-w-[150px]">
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
    <div className="text-xs text-blue-500 font-semibold mb-1 uppercase tracking-wider">Agent</div>
    <div className="text-sm font-medium">{data.label as string}</div>
    <div className="text-xs text-muted-foreground mt-1">{data.agentId as string}</div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
  </div>
);

const ToolNode = ({ data }: NodeProps) => (
  <div className="px-4 py-3 bg-background border-2 border-orange-500 rounded-lg shadow-sm min-w-[150px]">
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-orange-500" />
    <div className="text-xs text-orange-500 font-semibold mb-1 uppercase tracking-wider">Tool</div>
    <div className="text-sm font-medium">{data.label as string}</div>
    <div className="text-xs text-muted-foreground mt-1">{data.toolId as string}</div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-orange-500" />
  </div>
);

const ConditionNode = ({ data }: NodeProps) => (
  <div className="px-4 py-3 bg-background border-2 border-purple-500 rounded-lg shadow-sm min-w-[150px] rotate-45 flex items-center justify-center translate-y-4">
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-500 -rotate-45" />
    <div className="text-sm font-medium -rotate-45">{data.label as string}</div>
    <Handle type="source" position={Position.Left} id="true" className="w-3 h-3 bg-green-500 -rotate-45" />
    <Handle type="source" position={Position.Right} id="false" className="w-3 h-3 bg-red-500 -rotate-45" />
  </div>
);

const nodeTypes = {
  start: StartNode,
  end: EndNode,
  agent: AgentNode,
  tool: ToolNode,
  condition: ConditionNode,
};

// --- Main Canvas ---

export function WorkflowCanvas({ config }: { config: WorkflowConfiguration }) {
  const { setSelectedNodeId, setSelectedEdgeId } = useWorkflowStudioStore();

  const initialNodes = useMemo(() => config.nodes.map(n => ({
    ...n,
    draggable: true,
  })), [config]);

  const initialEdges = useMemo(() => config.edges.map(e => ({
    ...e,
    animated: true,
  })), [config]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="flex-1 h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => { setSelectedNodeId(null); setSelectedEdgeId(null); }}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap zoomable pannable className="bg-background border border-border rounded-lg shadow-sm" />
      </ReactFlow>
    </div>
  );
}
