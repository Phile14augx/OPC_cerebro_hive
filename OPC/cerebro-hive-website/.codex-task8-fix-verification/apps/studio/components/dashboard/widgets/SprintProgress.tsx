import { SprintProgress } from "@/lib/metrics/types";

export default function SprintProgressWidget({ metrics }: { metrics: SprintProgress }) {
  return (
    <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-semibold mb-1 text-white">Current Sprint</h2>
        <p className="text-sm text-gray-400 mb-6">{metrics.daysRemaining} days remaining</p>
      </div>

      <div>
        <div className="flex justify-between items-end mb-2">
          <p className="text-sm text-gray-400">Completion</p>
          <p className="text-2xl font-bold text-white">{metrics.completionPercentage}%</p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-black/50 h-3 rounded-full overflow-hidden border border-white/5">
          <div 
            className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${metrics.completionPercentage}%` }}
          />
        </div>
        
        <div className="flex justify-between mt-3 text-xs text-gray-500">
          <span>{metrics.completedStoryPoints} pts completed</span>
          <span>{metrics.totalStoryPoints} pts total</span>
        </div>
      </div>
    </div>
  );
}
