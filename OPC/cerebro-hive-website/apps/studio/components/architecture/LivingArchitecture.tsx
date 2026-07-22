"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  Edge, 
  Node,
  useNodesState,
  useEdgesState,
  ConnectionMode
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Node Components
import { ClientNode } from './nodes/ClientNode';
import { GatewayNode } from './nodes/GatewayNode';
import { AgentOSNode } from './nodes/AgentOSNode';
import { NatsNode } from './nodes/NatsNode';
import { IntegrationNode } from './nodes/IntegrationNode';

// Edge Component
import { AnimatedPacketEdge } from './edges/AnimatedPacketEdge';

// Overlays
import { LiveMetricsPanel } from './overlays/LiveMetricsPanel';
import { BackgroundGrid } from './overlays/BackgroundGrid';

import { Play, Activity, Settings2 } from 'lucide-react';

const nodeTypes = {
  client: ClientNode,
  gateway: GatewayNode,
  agentos: AgentOSNode,
  nats: NatsNode,
  integration: IntegrationNode,
};

const edgeTypes = {
  animatedPacket: AnimatedPacketEdge,
};

const initialNodes: Node[] = [
  { id: 'client', type: 'client', position: { x: 250, y: 50 }, data: {} },
  { id: 'gateway', type: 'gateway', position: { x: 230, y: 200 }, data: {} },
  { id: 'agentos', type: 'agentos', position: { x: 150, y: 350 }, data: {} },
  { id: 'nats', type: 'nats', position: { x: 230, y: 550 }, data: {} },
  { id: 'integration', type: 'integration', position: { x: 170, y: 700 }, data: {} },
];

const initialEdges: Edge[] = [
  { 
    id: 'e1-2', source: 'client', target: 'gateway', 
    type: 'animatedPacket', 
    data: { packetColor: '#a855f7', duration: '1.5s', delay: '0s' } 
  },
  { 
    id: 'e2-3', source: 'gateway', target: 'agentos', 
    type: 'animatedPacket', 
    data: { packetColor: '#00F57A', duration: '2s', delay: '0.5s' } 
  },
  { 
    id: 'e3-4', source: 'agentos', target: 'nats', 
    type: 'animatedPacket', 
    data: { packetColor: '#0ea5e9', duration: '1.8s', delay: '1s' } 
  },
  { 
    id: 'e4-5', source: 'nats', target: 'integration', 
    type: 'animatedPacket', 
    data: { packetColor: '#f97316', duration: '2.5s', delay: '0.2s' } 
  },
];

export function LivingArchitecture() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  const [mode, setMode] = useState<'topology' | 'live' | 'brain'>('live');

  // Toggle mode effect
  useEffect(() => {
    setNodes((nds) => 
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isBrainMode: mode === 'brain',
        }
      }))
    );
    
    setEdges((eds) => 
      eds.map((edge) => ({
        ...edge,
        data: {
          ...edge.data,
          isBrainMode: mode === 'brain',
          hidePacket: mode === 'topology',
          duration: mode === 'live' ? (parseFloat((edge.data?.duration ?? '1') as string) * 0.7) + 's' : edge.data?.duration
        }
      }))
    );
  }, [mode, setNodes, setEdges]);

  return (
    <div className="relative w-full h-[800px] bg-background border border-border rounded-2xl overflow-hidden shadow-2xl">
      <BackgroundGrid />
      <LiveMetricsPanel />

      {/* Mode Controls */}
      <div className="absolute top-6 left-6 z-50 flex flex-col gap-2 bg-surface/80 backdrop-blur-md p-2 rounded-xl border border-border shadow-elevated">
        <button 
          onClick={() => setMode('topology')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors \${mode === 'topology' ? 'bg-background text-text-primary border border-border' : 'text-text-muted hover:text-text-primary'}`}
        >
          <Settings2 size={14} /> Topology View
        </button>
        <button 
          onClick={() => setMode('live')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors \${mode === 'live' ? 'bg-primary-accent/10 text-primary-accent border border-primary-accent/30' : 'text-text-muted hover:text-text-primary'}`}
        >
          <Play size={14} /> Live Traffic Mode
        </button>
        <button 
          onClick={() => setMode('brain')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors \${mode === 'brain' ? 'bg-secondary-accent/10 text-secondary-accent border border-secondary-accent/30' : 'text-text-muted hover:text-text-primary'}`}
        >
          <Activity size={14} /> AI Brain Mode
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={40} size={1} color="rgba(255,255,255,0.05)" />
        <Controls className="fill-text-primary bg-surface border-border" />
      </ReactFlow>
    </div>
  );
}
