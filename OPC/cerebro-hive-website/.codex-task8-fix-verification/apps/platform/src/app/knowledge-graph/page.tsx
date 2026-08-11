
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
