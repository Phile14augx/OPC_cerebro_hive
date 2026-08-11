
import React from 'react';
import { FindingCard } from './FindingCard';

export const FindingsTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Review Findings</h2>
        <select className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 outline-none">
          <option>Group by Severity</option>
          <option>Group by Category</option>
          <option>Group by Contributor</option>
        </select>
      </div>
      <div className="space-y-3">
        <FindingCard severity="Critical" title="Unencrypted Data Transfer" contributor="SecurityContributor v4.0" />
        <FindingCard severity="Warning" title="Cache TTL Exceeds Policy" contributor="ArchitectureContributor v2.1" />
      </div>
    </div>
  );
};
