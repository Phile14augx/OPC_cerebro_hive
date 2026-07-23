'use client';

import { usePlaygroundStore } from '@/src/store/usePlaygroundStore';
import { PromptEditor } from '../editor/PromptEditor';

export function ConfigurationPanel() {
  const { 
    systemPrompt, setSystemPrompt,
    selectedModel, setModelConfig,
    temperature,
    useWorkingMemory, useConversationMemory, useSemanticMemory,
    setMemoryToggle
  } = usePlaygroundStore();

  return (
    <div className="flex flex-col h-full bg-muted/5 border-l border-border w-80 overflow-auto">
      <div className="h-8 border-b border-border flex items-center px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground shrink-0">
        Configuration
      </div>
      
      <div className="p-4 space-y-6">
        
        {/* Model Settings */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Model</h3>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Provider & Model</label>
            <select 
              className="w-full bg-background border border-border rounded px-2 py-1 text-sm outline-none"
              value={selectedModel}
              onChange={(e) => setModelConfig({ selectedModel: e.target.value })}
            >
              <option value="gpt-4o">OpenAI GPT-4o</option>
              <option value="claude-3.5-sonnet">Anthropic Claude 3.5 Sonnet</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 flex justify-between">
              <span>Temperature</span>
              <span>{temperature}</span>
            </label>
            <input 
              type="range" 
              min="0" max="2" step="0.1" 
              value={temperature}
              onChange={(e) => setModelConfig({ temperature: parseFloat(e.target.value) })}
              className="w-full accent-primary"
            />
          </div>
        </div>

        {/* System Prompt */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">System Prompt</h3>
          <div className="h-32 border border-border rounded overflow-hidden">
            <PromptEditor value={systemPrompt} onChange={(v) => setSystemPrompt(v || '')} />
          </div>
        </div>

        {/* Memory Settings */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Memory Context</h3>
          <label className="flex items-center space-x-2 text-sm cursor-pointer">
            <input 
              type="checkbox" 
              checked={useWorkingMemory} 
              onChange={(e) => setMemoryToggle('useWorkingMemory', e.target.checked)} 
              className="rounded accent-primary"
            />
            <span>Working Memory</span>
          </label>
          <label className="flex items-center space-x-2 text-sm cursor-pointer">
            <input 
              type="checkbox" 
              checked={useConversationMemory} 
              onChange={(e) => setMemoryToggle('useConversationMemory', e.target.checked)} 
              className="rounded accent-primary"
            />
            <span>Conversation Memory</span>
          </label>
          <label className="flex items-center space-x-2 text-sm cursor-pointer">
            <input 
              type="checkbox" 
              checked={useSemanticMemory} 
              onChange={(e) => setMemoryToggle('useSemanticMemory', e.target.checked)} 
              className="rounded accent-primary"
            />
            <span>Semantic Memory</span>
          </label>
        </div>

      </div>
    </div>
  );
}
