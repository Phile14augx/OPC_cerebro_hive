'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLayoutStore } from '@/src/store/useLayoutStore';
import { useEvaluationStudioStore, EvaluationView } from '@/src/store/useEvaluationStudioStore';

import { EvaluationSidebar } from '@/components/evaluation/EvaluationSidebar';
import { OverviewDashboard } from '@/components/evaluation/OverviewDashboard';
import { DatasetViewer } from '@/components/evaluation/DatasetViewer';
import { RunResults } from '@/components/evaluation/RunResults';

export default function EvaluationStudioPage() {
  const { view } = useParams() as { view: string };
  const router = useRouter();
  const { isSidebarOpen } = useLayoutStore();
  const { activeView, setActiveView } = useEvaluationStudioStore();

  // Sync route param with store state, or update route when store changes
  useEffect(() => {
    if (view && view !== activeView) {
      const validViews = ['overview', 'profiles', 'datasets', 'evaluators', 'runs', 'experiments', 'reports'];
      if (validViews.includes(view)) {
        setActiveView(view as EvaluationView);
      }
    }
  }, [view, activeView, setActiveView]);

  useEffect(() => {
    if (activeView !== view) {
      router.push(`/evaluations/${activeView}`);
    }
  }, [activeView, view, router]);


  const renderMainContent = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewDashboard />;
      case 'datasets':
        return <DatasetViewer />;
      case 'runs':
        return <RunResults />;
      default:
        return (
          <div className="flex-1 flex items-center justify-center text-muted-foreground bg-background">
            {activeView.charAt(0).toUpperCase() + activeView.slice(1)} Module - Coming Soon
          </div>
        );
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Sidebar Navigation */}
      {isSidebarOpen && <EvaluationSidebar />}

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-background">
        {renderMainContent()}
      </div>
    </div>
  );
}
