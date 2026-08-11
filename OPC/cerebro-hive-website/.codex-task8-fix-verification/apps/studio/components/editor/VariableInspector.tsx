'use client';

import { usePromptStudioStore } from '@/src/store/usePromptStudioStore';

interface VariableInspectorProps {
  promptContent: string;
}

export function VariableInspector({ promptContent }: VariableInspectorProps) {
  const { testVariables, setTestVariable } = usePromptStudioStore();

  // Simple extraction of {{varName}}
  const extracted = Array.from(promptContent.matchAll(/\{\{(.*?)\}\}/g)).map(m => m[1].trim());
  const variables = Array.from(new Set(extracted)); // Unique

  return (
    <div className="flex flex-col h-full bg-muted/5 border-l border-border w-80">
      <div className="h-8 border-b border-border flex items-center px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Variables
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {variables.length === 0 && (
          <div className="text-sm text-muted-foreground">No variables detected.</div>
        )}
        {variables.map(v => (
          <div key={v} className="space-y-1">
            <label className="text-xs font-medium">{v}</label>
            <input
              type="text"
              className="w-full bg-background border border-border rounded px-2 py-1 text-sm outline-none focus:border-primary transition-colors"
              placeholder={`Value for ${v}...`}
              value={testVariables[v] || ''}
              onChange={e => setTestVariable(v, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
