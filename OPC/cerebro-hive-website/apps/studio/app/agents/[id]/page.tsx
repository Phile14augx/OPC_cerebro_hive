'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useAgent } from '@/src/hooks/useAgent';
import { useLayoutStore } from '@/src/store/useLayoutStore';
import { useAgentStudioStore } from '@/src/store/useAgentStudioStore';

import { AgentExplorer } from '@/components/agent/AgentExplorer';
import { AgentConfiguration } from '@/components/agent/AgentConfiguration';
import { PlaygroundPanel, ExecutionContext } from '@/components/playground/PlaygroundPanel';

export default function AgentDesignerPage() {
  const { id } = useParams() as { id: string };
  const { data: config, isLoading } = useAgent(id);
  const { isSidebarOpen } = useLayoutStore();
  const { activeTab, setActiveTab } = useAgentStudioStore();

  const executionContext: ExecutionContext | undefined = useMemo(() => {
    if (!config) return undefined;
    return {
      selectedModel: config.modelConfig.model,
      provider: config.modelConfig.provider,
      temperature: config.modelConfig.temperature,
      topP: config.modelConfig.topP,
      maxTokens: config.modelConfig.maxTokens,
      useWorkingMemory: config.memoryStrategy.useWorkingMemory,
      useConversationMemory: config.memoryStrategy.useConversationMemory,
      useSemanticMemory: config.memoryStrategy.useSemanticMemory,
      systemPrompt: `[System Prompt loaded from template: ${config.promptReference.templateId}]`, // In reality, we'd fetch the actual prompt content
    };
  }, [config]);

  if (isLoading) {
    return <div className="p-8 text-muted-foreground">Loading Agent Designer...</div>;
  }

  if (!config) {
    return <div className="p-8 text-red-500">Agent not found.</div>;
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Sidebar: Explorer */}
      {isSidebarOpen && <AgentExplorer />}

      {/* Main IDE Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Editor Tabs */}
        <div className="h-10 border-b border-border bg-muted/10 flex items-end px-2 gap-1">
          {['configure', 'test', 'evaluate', 'deploy'].map((tab) => (
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
          {activeTab === 'configure' && (
            <AgentConfiguration config={config} />
          )}
          
          {activeTab === 'test' && (
            <PlaygroundPanel executionContext={executionContext} hideConfiguration />
          )}

          {activeTab === 'evaluate' && (
            <div className="p-8 flex items-center justify-center text-muted-foreground text-sm w-full h-full">
              Evaluation UI mapping to selected Evaluation Profile ({config.evaluationProfile.join(', ')}) goes here.
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
