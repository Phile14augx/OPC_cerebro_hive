
import React from 'react';

export const DashboardHeader: React.FC<{ reviewId: string }> = ({ reviewId }) => {
  // Use API /reviews/:reviewId for statistics
  return (
    <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50 backdrop-blur-md">
      <div>
        <h1 className="text-xl font-bold">Engineering Review</h1>
        <span className="text-xs text-slate-400 font-mono">{reviewId}</span>
      </div>
      <div className="flex space-x-4">
        <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30 text-sm font-medium">
          PASS
        </div>
        <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30 text-sm font-medium">
          Confidence: 98%
        </div>
        <div className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm font-medium">
          Freshness: CURRENT
        </div>
      </div>
    </header>
  );
};
