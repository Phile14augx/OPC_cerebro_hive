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
  const setSystemPrompt = usePlaygroundStore((state) => state.setSystemPrompt);
  const setModelConfig = usePlaygroundStore((state) => state.setModelConfig);
  const setMemoryToggle = usePlaygroundStore((state) => state.setMemoryToggle);

  // Sync execution context into playground store
  useEffect(() => {
    if (executionContext) {
      if (executionContext.systemPrompt !== undefined) setSystemPrompt(executionContext.systemPrompt);
      if (executionContext.selectedModel !== undefined) setModelConfig({ selectedModel: executionContext.selectedModel });
      if (executionContext.provider !== undefined) setModelConfig({ provider: executionContext.provider });
      if (executionContext.temperature !== undefined) setModelConfig({ temperature: executionContext.temperature });
      if (executionContext.topP !== undefined) setModelConfig({ topP: executionContext.topP });
      if (executionContext.maxTokens !== undefined) setModelConfig({ maxTokens: executionContext.maxTokens });
      if (executionContext.useWorkingMemory !== undefined) setMemoryToggle('useWorkingMemory', executionContext.useWorkingMemory);
      if (executionContext.useConversationMemory !== undefined) setMemoryToggle('useConversationMemory', executionContext.useConversationMemory);
      if (executionContext.useSemanticMemory !== undefined) setMemoryToggle('useSemanticMemory', executionContext.useSemanticMemory);
    }
  }, [executionContext, setMemoryToggle, setModelConfig, setSystemPrompt]);

  return (
    <div className="flex h-full w-full overflow-hidden">
      <ChatWindow />
      
      {isInspectorOpen && !hideConfiguration && (
        <ConfigurationPanel />
      )}
    </div>
  );
}
