'use client';

import { usePrompts } from '@/src/hooks/usePrompt';
import Link from 'next/link';

export function PromptExplorer() {
  const { data: prompts, isLoading } = usePrompts();

  return (
    <div className="flex flex-col h-full bg-muted/5 border-r border-border w-64">
      <div className="h-8 border-b border-border flex items-center px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Prompts
      </div>
      <div className="flex-1 overflow-auto p-2">
        {isLoading && <div className="text-xs text-muted-foreground p-2">Loading...</div>}
        {prompts?.map(prompt => (
          <Link key={prompt.id} href={`/prompts/${prompt.id}`}>
            <div className="px-3 py-2 text-sm hover:bg-muted/50 cursor-pointer rounded mb-1 border border-transparent hover:border-border transition-colors">
              <div className="font-medium truncate">{prompt.name}</div>
              <div className="text-xs text-muted-foreground flex justify-between mt-1">
                <span>{prompt.status}</span>
                <span>{prompt.tags[0]}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
