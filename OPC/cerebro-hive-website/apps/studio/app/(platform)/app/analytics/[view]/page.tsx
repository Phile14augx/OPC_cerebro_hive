'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLayoutStore } from '@/src/store/useLayoutStore';
import { useAnalyticsStore, AnalyticsView } from '@/src/store/useAnalyticsStore';

import { AnalyticsSidebar } from '@/components/analytics/AnalyticsSidebar';
import { OverviewDashboard } from '@/components/analytics/OverviewDashboard';
import { TraceExplorer } from '@/components/analytics/TraceExplorer';
import { TraceDetails } from '@/components/analytics/TraceDetails';

export default function AnalyticsPage() {
  const { view } = useParams() as { view: string };
  const router = useRouter();
  const { isSidebarOpen } = useLayoutStore();
  const { activeView, setActiveView } = useAnalyticsStore();

  useEffect(() => {
    if (view && view !== activeView) {
      const validViews = ['overview', 'metrics', 'traces', 'logs', 'costs', 'models', 'providers', 'agents', 'workflows', 'alerts'];
      if (validViews.includes(view)) {
        setActiveView(view as AnalyticsView);
      }
    }
  }, [view, activeView, setActiveView]);

  useEffect(() => {
    if (activeView !== view) {
      router.push(`/analytics/${activeView}`);
    }
  }, [activeView, view, router]);

  const renderMainContent = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewDashboard />;
      case 'traces':
        return (
          <div className="flex-1 flex h-full relative overflow-hidden">
            <TraceExplorer />
            <TraceDetails />
          </div>
        );
      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-background h-full">
            <h2 className="text-xl font-semibold mb-2">{activeView.charAt(0).toUpperCase() + activeView.slice(1)} Dashboard</h2>
            <p className="text-sm">This module connects to the underlying OpenTelemetry data source.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {isSidebarOpen && <AnalyticsSidebar />}

      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-background">
        {renderMainContent()}
      </div>
    </div>
  );
}
