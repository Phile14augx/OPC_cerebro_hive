
import React from 'react';

export const RecommendationsTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Actionable Recommendations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* RecommendationCard mapping */}
        <div className="bg-slate-800 border border-emerald-500/30 rounded-lg p-4">
          <h3 className="font-medium text-emerald-400 mb-2">Enable TLS on Data Source</h3>
          <p className="text-sm text-slate-300 mb-4">Update the connection profile for Node &apos;DB-Primary&apos; to require TLS 1.3 to satisfy compliance policy.</p>
          <div className="text-xs text-slate-400 border-t border-slate-700 pt-2 flex justify-between">
            <span>Resolves: Critical Finding</span>
            <span className="text-emerald-400 cursor-pointer hover:underline">View Affected Node →</span>
          </div>
        </div>
      </div>
    </div>
  );
};
