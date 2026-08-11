
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
