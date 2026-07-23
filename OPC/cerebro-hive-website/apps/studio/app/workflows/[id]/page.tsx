'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useWorkflow } from '@/src/hooks/useWorkflow';
import { useLayoutStore } from '@/src/store/useLayoutStore';
import { useWorkflowStudioStore } from '@/src/store/useWorkflowStudioStore';

import { WorkflowExplorer } from '@/components/workflow/WorkflowExplorer';
import { WorkflowCanvas } from '@/components/workflow/WorkflowCanvas';
import { NodeInspector } from '@/components/workflow/NodeInspector';
import { TraceViewer } from '@/components/workflow/TraceViewer';

export default function WorkflowDesignerPage() {
  const { id } = useParams() as { id: string };
  const { data: config, isLoading } = useWorkflow(id);
  const { isSidebarOpen, isInspectorOpen } = useLayoutStore();
  const { activeTab, setActiveTab } = useWorkflowStudioStore();

  if (isLoading) {
    return <div className="p-8 text-muted-foreground">Loading Workflow Designer...</div>;
  }

  if (!config) {
    return <div className="p-8 text-red-500">Workflow not found.</div>;
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Sidebar: Explorer */}
      {isSidebarOpen && <WorkflowExplorer />}

      {/* Main IDE Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Editor Tabs */}
        <div className="h-10 border-b border-border bg-muted/10 flex items-end px-2 gap-1">
          {['canvas', 'simulate', 'trace', 'deploy'].map((tab) => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-xs font-medium cursor-pointer rounded-t-lg transition-colors
                ${activeTab === tab ? 'bg-background border-t border-l border-r border-border text-foreground' : 'text-muted-foreground hover:bg-muted/30'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </div>
          ))}
        </div>

        {/* Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'canvas' && (
            <div className="flex h-full w-full relative">
              <WorkflowCanvas config={config} />
              
              {isInspectorOpen && (
                <NodeInspector workflowId={config.id} />
              )}
            </div>
          )}
          
          {activeTab === 'simulate' && (
            <div className="flex-1 flex flex-col h-full w-full">
              <div className="p-8 flex items-center justify-center text-muted-foreground text-sm border-b border-border h-48">
                Simulation Controls (Run, Pause, Step-Through) go here.
              </div>
              <TraceViewer />
            </div>
          )}

          {activeTab === 'trace' && (
            <div className="flex-1 h-full w-full">
              <TraceViewer />
            </div>
          )}

          {activeTab === 'deploy' && (
            <div className="p-8 flex items-center justify-center text-muted-foreground text-sm w-full h-full">
              Deployment configuration goes here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
