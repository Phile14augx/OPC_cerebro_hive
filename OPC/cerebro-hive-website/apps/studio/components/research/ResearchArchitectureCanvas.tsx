"use client";

import React, { useMemo } from 'react';
import { 
  ReactFlow,
  Background, 
  Controls, 
  MiniMap, 
  Panel,
  NodeProps
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Download, Maximize, FileJson } from 'lucide-react';
import { ResearchArchitectureData } from '@/lib/content/research/types';

// Academic Node Component
const AcademicNode = ({ data }: NodeProps) => {
  return (
    <div className="px-4 py-2 bg-surface border border-gray-300 shadow-sm rounded-sm flex flex-col items-center justify-center min-w-[120px]">
      <span className="text-xs font-mono font-bold text-gray-800 text-center">{String(data.label)}</span>
    </div>
  );
};

// Map node types
const nodeTypes = {
  default: AcademicNode,
  input: AcademicNode,
  output: AcademicNode,
};

interface ResearchArchitectureCanvasProps {
  data: ResearchArchitectureData;
}

export const ResearchArchitectureCanvas = ({ data }: ResearchArchitectureCanvasProps) => {
  
  // We apply the custom node type to the incoming nodes
  const formattedNodes = useMemo(() => {
    return data.nodes.map(n => ({
      ...n,
      type: 'default',
    }));
  }, [data.nodes]);

  // Edges get a minimal, technical style
  const formattedEdges = useMemo(() => {
    return data.edges.map(e => ({
      ...e,
      style: { stroke: '#4b5563', strokeWidth: 1.5 },
      animated: e.animated || false,
    }));
  }, [data.edges]);

  return (
    <div className="w-full h-[600px] bg-[#f8fafc] border border-gray-200 rounded-sm relative overflow-hidden flex flex-col">
      <ReactFlow
        nodes={formattedNodes}
        edges={formattedEdges}
        nodeTypes={nodeTypes}
        fitView
        className="academic-flow-theme"
      >
        {/* Blueprint Grid Background */}
        <Background color="#cbd5e1" gap={20} size={1} />
        
        {/* Controls */}
        <Controls showInteractive={false} className="border border-gray-200 shadow-sm rounded-sm overflow-hidden" />
        
        <MiniMap 
          nodeColor="#e2e8f0" 
          maskColor="rgba(248, 250, 252, 0.7)" 
          className="border border-gray-200 rounded-sm shadow-sm"
        />

        {/* Academic Metadata Panel (Top Left) */}
        <Panel position="top-left" className="bg-surface-elevated backdrop-blur-sm border border-gray-200 p-3 rounded-sm shadow-sm max-w-xs">
           <div className="flex flex-col gap-1">
             <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{data.figureNumber}</span>
             <h4 className="text-sm font-space font-bold text-gray-800">Reference Architecture</h4>
             <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-text-muted">
                <span>v{data.version}</span>
                <span>•</span>
                <span>CerebroHive Labs</span>
             </div>
           </div>
        </Panel>

        {/* Export Panel (Bottom Right) */}
        <Panel position="bottom-right" className="flex gap-2">
           <button className="p-2 bg-surface border border-gray-200 rounded-sm shadow-sm text-text-muted hover:text-text-primary transition-colors" title="Download SVG">
             <Download size={14} />
           </button>
           <button className="p-2 bg-surface border border-gray-200 rounded-sm shadow-sm text-text-muted hover:text-text-primary transition-colors" title="Export JSON">
             <FileJson size={14} />
           </button>
           <button className="p-2 bg-surface border border-gray-200 rounded-sm shadow-sm text-text-muted hover:text-text-primary transition-colors" title="Fullscreen">
             <Maximize size={14} />
           </button>
        </Panel>

      </ReactFlow>
    </div>
  );
};
