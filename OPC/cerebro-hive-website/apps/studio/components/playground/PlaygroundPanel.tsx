'use client';

import { useEffect } from 'react';
import { useLayoutStore } from '@/src/store/useLayoutStore';
import { usePlaygroundStore } from '@/src/store/usePlaygroundStore';
import { ConfigurationPanel } from './ConfigurationPanel';
import { ChatWindow } from './ChatWindow';

export interface ExecutionContext {
  systemPrompt?: string;
  selectedModel?: string;
  provider?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  useWorkingMemory?: boolean;
  useConversationMemory?: boolean;
  useSemanticMemory?: boolean;
}

export interface PlaygroundPanelProps {
  executionContext?: ExecutionContext;
  hideConfiguration?: boolean;
}

export function PlaygroundPanel({ executionContext, hideConfiguration }: PlaygroundPanelProps) {
  const { isInspectorOpen } = useLayoutStore();
  const store = usePlaygroundStore();

  // Sync execution context into playground store
  useEffect(() => {
    if (executionContext) {
      if (executionContext.systemPrompt !== undefined) store.setSystemPrompt(executionContext.systemPrompt);
      if (executionContext.selectedModel !== undefined) store.setModelConfig({ selectedModel: executionContext.selectedModel });
      if (executionContext.provider !== undefined) store.setModelConfig({ provider: executionContext.provider });
      if (executionContext.temperature !== undefined) store.setModelConfig({ temperature: executionContext.temperature });
      if (executionContext.topP !== undefined) store.setModelConfig({ topP: executionContext.topP });
      if (executionContext.maxTokens !== undefined) store.setModelConfig({ maxTokens: executionContext.maxTokens });
      if (executionContext.useWorkingMemory !== undefined) store.setMemoryToggle('useWorkingMemory', executionContext.useWorkingMemory);
      if (executionContext.useConversationMemory !== undefined) store.setMemoryToggle('useConversationMemory', executionContext.useConversationMemory);
      if (executionContext.useSemanticMemory !== undefined) store.setMemoryToggle('useSemanticMemory', executionContext.useSemanticMemory);
    }
  }, [executionContext]);

  return (
    <div className="flex h-full w-full overflow-hidden">
      <ChatWindow />
      
      {isInspectorOpen && !hideConfiguration && (
        <ConfigurationPanel />
      )}
    </div>
  );
}
