const fs = require('fs');
const path = require('path');

const platformSrc = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'apps', 'platform', 'src');
const appDir = path.join(platformSrc, 'app');
const componentsDir = path.join(platformSrc, 'components');
const libDir = path.join(platformSrc, 'lib');

[componentsDir, libDir].forEach(d => fs.mkdirSync(d, { recursive: true }));

// ----------------------------------------------------
// LAYOUT (WORKSPACE SHELL)
// ----------------------------------------------------
fs.writeFileSync(path.join(appDir, 'layout.tsx'), `
import './globals.css';
import Link from 'next/link';
import { Search, Bell, Sparkles, LayoutDashboard, BrainCircuit, Network, GitPullRequest } from 'lucide-react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-slate-50 flex h-screen overflow-hidden font-sans">
        
        {/* Navigation Sidebar */}
        <aside className="w-16 flex flex-col items-center py-4 bg-zinc-900 border-r border-zinc-800 space-y-8">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(99,102,241,0.5)] cursor-pointer">
            CH
          </div>
          <nav className="flex flex-col space-y-6 text-zinc-400">
            <Link href="/" className="hover:text-indigo-400 transition-colors" title="Workspace"><LayoutDashboard size={24} /></Link>
            <Link href="/studio" className="hover:text-indigo-400 transition-colors text-indigo-400" title="CerebroStudio"><GitPullRequest size={24} /></Link>
            <Link href="/mission-control" className="hover:text-indigo-400 transition-colors" title="Mission Control"><BrainCircuit size={24} /></Link>
            <Link href="/knowledge-graph" className="hover:text-indigo-400 transition-colors" title="Knowledge Graph"><Network size={24} /></Link>
          </nav>
        </aside>

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          
          {/* Top Bar / Global Search */}
          <header className="h-14 border-b border-zinc-800 flex items-center px-6 justify-between bg-zinc-950/50 backdrop-blur-md z-10">
            <div className="flex items-center bg-zinc-900 rounded-lg px-3 py-1.5 border border-zinc-700 w-96 group focus-within:border-indigo-500 transition-colors">
              <Search size={16} className="text-zinc-500 group-focus-within:text-indigo-400" />
              <input type="text" placeholder="Search commands, agents, workflows (Cmd+K)" className="bg-transparent border-none outline-none ml-2 text-sm w-full text-zinc-300 placeholder-zinc-600" />
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="text-zinc-400 hover:text-white transition-colors relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 cursor-pointer"></div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
          
          {/* AI Copilot Floating Action */}
          <button className="absolute bottom-6 right-6 w-12 h-12 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all hover:scale-105 z-50">
            <Sparkles size={20} className="text-white" />
          </button>
        </div>

      </body>
    </html>
  );
}
`);

// ----------------------------------------------------
// HOME PAGE
// ----------------------------------------------------
fs.writeFileSync(path.join(appDir, 'page.tsx'), `
export default function Home() {
  return (
    <div className="p-8 h-full overflow-y-auto">
      <h1 className="text-3xl font-light tracking-tight mb-8">Enterprise Workspace</h1>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-indigo-500/50 transition-colors cursor-pointer group">
          <h2 className="text-xl font-medium text-white mb-2 group-hover:text-indigo-400">CerebroStudio</h2>
          <p className="text-sm text-zinc-400">Design and orchestrate AI multi-agent workflows.</p>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-purple-500/50 transition-colors cursor-pointer group">
          <h2 className="text-xl font-medium text-white mb-2 group-hover:text-purple-400">Mission Control</h2>
          <p className="text-sm text-zinc-400">Monitor system health, costs, and executing agents.</p>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-blue-500/50 transition-colors cursor-pointer group">
          <h2 className="text-xl font-medium text-white mb-2 group-hover:text-blue-400">Knowledge Explorer</h2>
          <p className="text-sm text-zinc-400">Query and traverse the enterprise semantic graph.</p>
        </div>
      </div>
    </div>
  );
}
`);

// ----------------------------------------------------
// CEREBRO STUDIO (React Flow)
// ----------------------------------------------------
const studioDir = path.join(appDir, 'studio');
fs.mkdirSync(studioDir, { recursive: true });
fs.writeFileSync(path.join(studioDir, 'page.tsx'), `
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
`);

// ----------------------------------------------------
// MISSION CONTROL (AG Grid placeholder)
// ----------------------------------------------------
const missionControlDir = path.join(appDir, 'mission-control');
fs.mkdirSync(missionControlDir, { recursive: true });
fs.writeFileSync(path.join(missionControlDir, 'page.tsx'), `
'use client';

export default function MissionControl() {
  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-white mb-2">Mission Control</h1>
          <p className="text-zinc-400">System Health, Fleet Observability, and FinOps</p>
        </div>
        <div className="flex space-x-4">
          <div className="px-4 py-2 bg-emerald-950/30 border border-emerald-900/50 rounded-lg">
            <span className="text-emerald-500 text-sm font-medium mr-2">● HiveSwarm Status:</span>
            <span className="text-white text-sm">Operational (99.99%)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Active Agents', value: '1,204', trend: '+12%' },
          { label: 'Inferences / min', value: '45.2k', trend: '+5%' },
          { label: 'Cost Burn Rate', value: '$14.20/hr', trend: '-2%' },
          { label: 'Avg Latency', value: '240ms', trend: 'Stable' },
        ].map(metric => (
          <div key={metric.label} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
            <h3 className="text-zinc-400 text-sm mb-1">{metric.label}</h3>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-semibold text-white">{metric.value}</span>
              <span className="text-xs text-indigo-400">{metric.trend}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl h-96 flex items-center justify-center">
        <p className="text-zinc-500">AG Grid Execution Telemetry Table will mount here</p>
      </div>
    </div>
  );
}
`);

// ----------------------------------------------------
// KNOWLEDGE GRAPH (Cytoscape placeholder)
// ----------------------------------------------------
const kgDir = path.join(appDir, 'knowledge-graph');
fs.mkdirSync(kgDir, { recursive: true });
fs.writeFileSync(path.join(kgDir, 'page.tsx'), `
'use client';

export default function KnowledgeGraphExplorer() {
  return (
    <div className="h-full w-full flex flex-col bg-zinc-950">
      <div className="h-16 border-b border-zinc-800 bg-zinc-900 flex items-center px-6 justify-between">
        <div>
          <h2 className="font-medium text-white text-lg">Knowledge Graph Explorer</h2>
          <p className="text-xs text-zinc-400">Querying semantic relationships across the Enterprise Ontology.</p>
        </div>
        <div className="w-64">
          <input type="text" placeholder="e.g. Find agents accessing HR data" className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-300 focus:border-indigo-500 outline-none transition-colors" />
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-zinc-950">
        <p className="text-zinc-500 z-10">Cytoscape.js Ontology Visualizer will mount here</p>
        
        {/* Decorative faint grid/nodes */}
        <div className="absolute w-2 h-2 bg-indigo-500/20 rounded-full top-1/4 left-1/3 shadow-[0_0_30px_rgba(99,102,241,0.5)]"></div>
        <div className="absolute w-3 h-3 bg-purple-500/20 rounded-full bottom-1/3 right-1/4 shadow-[0_0_40px_rgba(168,85,247,0.5)]"></div>
      </div>
    </div>
  );
}
`);

console.log('Frontend Workspace Shell Scaffolded Successfully');
