import React from 'react';

export default function KnowledgeExplorerPage() {
  return (
    <div className="flex flex-col h-screen bg-neutral-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">
          Knowledge Intelligence Workspace
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow">
        {/* Retrieval Pipeline Explorer */}
        <section className="lg:col-span-1 bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden flex flex-col p-4">
          <h2 className="text-xl font-semibold mb-4">Retrieval Stages</h2>
          <ul className="space-y-3 text-sm font-mono text-neutral-300">
            <li className="flex justify-between"><span className="text-green-400">Query Parsing</span> <span>12ms</span></li>
            <li className="flex justify-between"><span className="text-green-400">Embedding</span> <span>45ms</span></li>
            <li className="flex justify-between"><span className="text-yellow-400">Graph Traversal</span> <span>112ms</span></li>
            <li className="flex justify-between"><span className="text-green-400">Vector Search</span> <span>23ms</span></li>
            <li className="flex justify-between"><span className="text-blue-400">RRF Fusion</span> <span>5ms</span></li>
          </ul>
        </section>

        {/* Semantic Search UI */}
        <section className="lg:col-span-3 bg-neutral-800 rounded-xl border border-neutral-700 p-4">
          <h2 className="text-xl font-semibold mb-4">Knowledge Explorer</h2>
          <div className="flex space-x-2 mb-4">
            <input type="text" className="flex-grow bg-neutral-900 border border-neutral-700 rounded p-2 text-white" placeholder="Search the Enterprise World Model..." />
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Retrieve</button>
          </div>
          <div className="h-64 border-dashed border-2 border-neutral-700 rounded-lg flex items-center justify-center text-neutral-500">
            [Graph & Document Lineage Visualization Here]
          </div>
        </section>
      </div>
    </div>
  );
}
