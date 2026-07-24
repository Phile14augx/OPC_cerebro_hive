'use client';

import { PlaygroundPanel } from '@/components/playground/PlaygroundPanel';

export default function PlaygroundPage() {
  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden relative">
      <div className="h-12 border-b border-border bg-muted/10 flex items-center px-4 shrink-0">
        <h1 className="font-semibold text-lg">Execution Sandbox</h1>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <PlaygroundPanel />
      </div>
    </div>
  );
}
