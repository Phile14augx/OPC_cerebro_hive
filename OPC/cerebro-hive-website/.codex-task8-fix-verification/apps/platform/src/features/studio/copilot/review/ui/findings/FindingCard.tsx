
import React, { useState } from 'react';
import { HierarchicalEvidenceExplorer } from '../evidence/HierarchicalEvidenceExplorer';

export const FindingCard: React.FC<{ severity: string, title: string, contributor: string }> = ({ severity, title, contributor }) => {
  const [expanded, setExpanded] = useState(false);
  const color = severity === 'Critical' ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-amber-500/50 bg-amber-500/10 text-amber-400';
  
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden transition-all duration-200">
      <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-700/50" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center space-x-4">
          <div className={`px-2 py-0.5 rounded text-xs font-bold border ${color}`}>
            {severity.toUpperCase()}
          </div>
          <h4 className="font-medium">{title}</h4>
        </div>
        <div className="flex items-center space-x-4 text-sm text-slate-400">
          <span className="font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-700">{contributor}</span>
          <button className="text-slate-300 hover:text-white transition-colors">
            {expanded ? 'Hide Evidence' : 'Explore Evidence'}
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="border-t border-slate-700 p-4 bg-slate-900/50">
          <HierarchicalEvidenceExplorer findingId="find-123" />
        </div>
      )}
    </div>
  );
};
