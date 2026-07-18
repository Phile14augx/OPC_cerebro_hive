import { EngineeringHealthMetrics } from "@/lib/metrics/types";

export default function EngineeringHealthWidget({ metrics }: { metrics: EngineeringHealthMetrics }) {
  return (
    <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
      <h2 className="text-xl font-semibold mb-4 text-white">Engineering Health</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black/40 p-4 rounded-lg border border-white/5">
          <p className="text-sm text-gray-400">Open Issues</p>
          <p className="text-3xl font-bold mt-1 text-blue-400">{metrics.openIssues}</p>
        </div>
        
        <div className="bg-black/40 p-4 rounded-lg border border-white/5">
          <p className="text-sm text-gray-400">Pull Requests</p>
          <p className="text-3xl font-bold mt-1 text-purple-400">{metrics.openPullRequests}</p>
        </div>
        
        <div className="bg-black/40 p-4 rounded-lg border border-white/5">
          <p className="text-sm text-gray-400">Critical Bugs</p>
          <p className="text-3xl font-bold mt-1 text-red-400">{metrics.criticalBugs}</p>
        </div>
        
        <div className="bg-black/40 p-4 rounded-lg border border-white/5">
          <p className="text-sm text-gray-400">Pipeline</p>
          <p className={`text-xl font-bold mt-2 ${metrics.deploymentStatus === 'healthy' ? 'text-green-400' : 'text-yellow-400'}`}>
            {metrics.deploymentStatus.toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
}
