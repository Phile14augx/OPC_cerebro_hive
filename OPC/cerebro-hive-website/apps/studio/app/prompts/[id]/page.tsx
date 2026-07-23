'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { usePrompt } from '@/src/hooks/usePrompt';
import { useLayoutStore } from '@/src/store/useLayoutStore';
import { usePromptStudioStore } from '@/src/store/usePromptStudioStore';

import { PromptEditor } from '@/components/editor/PromptEditor';
import { PromptExplorer } from '@/components/editor/PromptExplorer';
import { VariableInspector } from '@/components/editor/VariableInspector';
import { TestConsole } from '@/components/editor/TestConsole';
import { EvaluationPanel } from '@/components/editor/EvaluationPanel';

export default function PromptStudioPage() {
  const { id } = useParams() as { id: string };
  const { data, isLoading } = usePrompt(id);
  const { isSidebarOpen, isInspectorOpen, isBottomPanelOpen } = useLayoutStore();
  const { activeTab, setActiveTab } = usePromptStudioStore();

  const [promptContent, setPromptContent] = useState('');

  // Sync loaded data to local state
  useEffect(() => {
    if (data?.history?.[0]) {
      setPromptContent(data.history[0].content);
    }
  }, [data]);

  if (isLoading) {
    return <div className="p-8 text-muted-foreground">Loading IDE...</div>;
  }

  if (!data) {
    return <div className="p-8 text-red-500">Prompt not found.</div>;
  }

  const latestVersion = data.history[0];

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Sidebar: Explorer */}
      {isSidebarOpen && <PromptExplorer />}

      {/* Main IDE Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Editor Tabs */}
        <div className="h-10 border-b border-border bg-muted/10 flex items-end px-2 gap-1">
          {['edit', 'test', 'evaluate'].map((tab) => (
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

        {/* Editor Content Workspace */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col h-full bg-background relative">
            {activeTab === 'edit' && (
              <PromptEditor 
                value={promptContent} 
                onChange={(v) => setPromptContent(v || '')} 
              />
            )}
            
            {activeTab === 'test' && (
              <div className="p-4 overflow-auto">
                <h3 className="font-semibold mb-4">Prompt Preview</h3>
                <pre className="bg-muted/10 p-4 rounded whitespace-pre-wrap font-mono text-sm border border-border">
                  {promptContent}
                </pre>
              </div>
            )}

            {activeTab === 'evaluate' && (
              <EvaluationPanel evaluations={latestVersion?.evaluations} />
            )}
            
            {/* Bottom Panel */}
            {isBottomPanelOpen && activeTab === 'test' && (
              <TestConsole />
            )}
          </div>
          
          {/* Inspector */}
          {isInspectorOpen && activeTab === 'edit' && (
            <VariableInspector promptContent={promptContent} />
          )}
        </div>
      </div>
    </div>
  );
}
