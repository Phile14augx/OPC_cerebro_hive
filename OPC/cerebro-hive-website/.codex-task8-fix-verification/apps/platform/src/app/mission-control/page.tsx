
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
