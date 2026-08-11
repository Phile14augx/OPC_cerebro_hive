
'use client';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes = [
  { id: '1', position: { x: 250, y: 100 }, data: { label: 'Data Ingestion (S3)' }, className: 'bg-zinc-800 text-white border-zinc-700 rounded-lg p-4' },
  { id: '2', position: { x: 100, y: 250 }, data: { label: 'Extract Text' }, className: 'bg-zinc-800 text-white border-zinc-700 rounded-lg p-4' },
  { id: '3', position: { x: 400, y: 250 }, data: { label: 'Reasoning Engine' }, className: 'bg-indigo-900/50 text-indigo-100 border-indigo-500/50 rounded-lg p-4' },
];
const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#6366f1' } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#6366f1' } }
];

export default function CerebroStudio() {
  return (
    <div className="h-full w-full flex flex-col bg-zinc-950">
      {/* Studio Toolbar */}
      <div className="h-12 border-b border-zinc-800 bg-zinc-900 flex items-center px-4 justify-between">
        <h2 className="font-medium text-zinc-300">New Onboarding Workflow (v1.0-draft)</h2>
        <div className="flex space-x-3">
          <button className="px-4 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors">Simulate</button>
          <button className="px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors text-white font-medium shadow-md shadow-indigo-500/20">Deploy</button>
        </div>
      </div>
      
      {/* Canvas Area */}
      <div className="flex-1 relative">
        <ReactFlow nodes={initialNodes} edges={initialEdges} fitView className="bg-zinc-950">
          <Background color="#27272a" gap={20} size={1} />
          <Controls className="bg-zinc-800 fill-white border-none" />
          <MiniMap nodeColor="#3f3f46" maskColor="rgba(0, 0, 0, 0.5)" className="bg-zinc-900" />
        </ReactFlow>
      </div>
    </div>
  );
}
