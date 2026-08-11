
import React from 'react';

export const DashboardNavigation: React.FC = () => {
  return (
    <nav className="flex space-x-6 px-4 py-2 border-b border-slate-800 bg-slate-900">
      <button className="text-emerald-400 border-b-2 border-emerald-400 pb-1 font-medium text-sm">Findings</button>
      <button className="text-slate-400 hover:text-slate-200 pb-1 font-medium text-sm transition-colors">Recommendations</button>
      <button className="text-slate-400 hover:text-slate-200 pb-1 font-medium text-sm transition-colors">Execution Metrics</button>
      <button className="text-slate-400 hover:text-slate-200 pb-1 font-medium text-sm transition-colors">History & Comparison</button>
    </nav>
  );
};
