
import React from 'react';

export const ReviewComparisonView: React.FC<{ baseReviewId: string, targetReviewId: string }> = ({ baseReviewId, targetReviewId }) => {
  // Uses GET /api/v1/workflows/:workflowId/reviews/compare
  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex justify-between items-center">
        <div>
          <span className="text-slate-400 text-sm">Comparing</span>
          <div className="font-mono text-sm">{baseReviewId}</div>
        </div>
        <div className="text-slate-500">→</div>
        <div>
          <span className="text-slate-400 text-sm">To</span>
          <div className="font-mono text-sm">{targetReviewId}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
          <h3 className="text-emerald-400 font-medium mb-2">Resolved Findings</h3>
          <ul className="text-sm text-slate-300 list-disc list-inside">
            <li>Cache TTL Exceeds Policy</li>
          </ul>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <h3 className="text-red-400 font-medium mb-2">New Findings</h3>
          <ul className="text-sm text-slate-300 list-disc list-inside">
            <li>Unencrypted Data Transfer</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
