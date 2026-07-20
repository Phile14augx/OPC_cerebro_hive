import React from 'react';
import { StudioShell } from '../components/StudioShell';
import { WorkspaceCard } from '../components/WorkspaceCard';
import { MetricCard } from '../components/MetricCard';

export default function GovernancePage() {
  return (
    <StudioShell activeWorkspace="Governance">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard label="Total Items" value="1,234" trend="+5.2%" colorClass="text-blue-400" />
        <MetricCard label="Active Status" value="Online" colorClass="text-green-400" />
        <MetricCard label="Warnings" value="0" colorClass="text-yellow-400" />
        <MetricCard label="System Load" value="45%" colorClass="text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WorkspaceCard title="Governance Overview" className="lg:col-span-2 min-h-[400px]">
          <div className="flex items-center justify-center h-full text-neutral-500 border-2 border-dashed border-neutral-800 rounded-xl">
            [ Premium Governance UI Widget ]
          </div>
        </WorkspaceCard>
        <WorkspaceCard title="Recent Activity" className="min-h-[400px]">
          <div className="flex flex-col space-y-4">
            <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-lg text-sm text-neutral-400">Activity logged at 10:42 AM</div>
            <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-lg text-sm text-neutral-400">System updated at 11:15 AM</div>
            <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-lg text-sm text-neutral-400">Workflow executed at 02:30 PM</div>
          </div>
        </WorkspaceCard>
      </div>
    </StudioShell>
  );
}
