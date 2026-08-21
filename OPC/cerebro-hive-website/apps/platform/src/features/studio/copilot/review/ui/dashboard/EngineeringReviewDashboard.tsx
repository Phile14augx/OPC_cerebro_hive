
import React from 'react';
import { DashboardHeader } from './DashboardHeader';
import { DashboardNavigation } from './DashboardNavigation';
import { FindingsTab } from '../findings/FindingsTab';

export const EngineeringReviewDashboard: React.FC<{ reviewId: string }> = ({ reviewId }) => {
  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      <DashboardHeader reviewId={reviewId} />
      <DashboardNavigation />
      <div className="flex-1 overflow-auto p-4">
        {/* Render active tab based on state */}
        <FindingsTab />
      </div>
    </div>
  );
};
