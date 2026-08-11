
import React, { useState } from 'react';

export const HierarchicalEvidenceExplorer: React.FC<{ findingId: string }> = ({ findingId }) => {
  const [depth, setDepth] = useState<'summary' | 'graph' | 'raw'>('summary');
  
  // Implementation of lazy fetching from GET /api/v1/reviews/:reviewId/evidence/:findingId
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-400">Evidence Lineage (finding: {findingId})</span>
        <div className="space-x-2">
          <button onClick={() => setDepth('summary')} className={`px-2 py-1 rounded ${depth === 'summary' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Summary</button>
          <button onClick={() => setDepth('graph')} className={`px-2 py-1 rounded ${depth === 'graph' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Execution Graph</button>
          <button onClick={() => setDepth('raw')} className={`px-2 py-1 rounded ${depth === 'raw' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Raw Trace</button>
        </div>
      </div>
      
      <div className="bg-slate-950 rounded p-4 border border-slate-800 font-mono text-sm text-slate-300 overflow-x-auto">
        {depth === 'summary' && <div>Summary: Evaluated Policy 'data-encryption-v2' against Edge 'E-45'. Node resolved to unencrypted transport.</div>}
        {depth === 'graph' && <div className="animate-pulse">Loading visual graph projection...</div>}
        {depth === 'raw' && <div className="animate-pulse text-xs text-slate-500">Fetching raw JSON trace payloads...</div>}
      </div>
    </div>
  );
};
