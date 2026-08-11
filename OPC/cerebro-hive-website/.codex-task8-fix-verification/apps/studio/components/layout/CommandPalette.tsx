'use client';

import { useEffect, useState } from 'react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-[20vh]">
      <div className="w-full max-w-lg bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center px-4 py-3 border-b border-border">
          <span className="text-muted-foreground mr-2">🔍</span>
          <input 
            type="text" 
            placeholder="Search commands..." 
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
            autoFocus
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          <div className="text-xs font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wider mb-1">
            Agents
          </div>
          <div className="px-2 py-2 text-sm hover:bg-muted rounded cursor-pointer flex items-center">
            <span className="mr-2">🤖</span> Create new Agent
          </div>
          <div className="px-2 py-2 text-sm hover:bg-muted rounded cursor-pointer flex items-center">
            <span className="mr-2">⚡</span> Open Workflow Designer
          </div>
          <div className="px-2 py-2 text-sm hover:bg-muted rounded cursor-pointer flex items-center">
            <span className="mr-2">📝</span> Edit Prompt Template
          </div>
        </div>
      </div>
    </div>
  );
}
