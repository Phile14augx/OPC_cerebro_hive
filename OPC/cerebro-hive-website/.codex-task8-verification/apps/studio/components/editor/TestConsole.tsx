'use client';

import { usePromptStudioStore } from '@/src/store/usePromptStudioStore';

export function TestConsole() {
  const { testVariables } = usePromptStudioStore();

  return (
    <div className="h-64 border-t border-border bg-muted/10 flex flex-col">
      <div className="h-8 border-b border-border flex items-center justify-between px-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Test Console</div>
        <button className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded hover:bg-primary/90 transition-colors">
          Run Test
        </button>
      </div>
      <div className="flex-1 p-4 overflow-auto font-mono text-sm">
        <div className="text-muted-foreground mb-4">
          // Output will stream here.
        </div>
        <div className="text-xs text-muted-foreground mt-4 border-t border-border pt-2">
          Current variables injected:
          <pre className="mt-1">{JSON.stringify(testVariables, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
