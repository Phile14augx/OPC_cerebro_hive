'use client';

import { usePrompts } from '@/src/hooks/usePrompt';
import Link from 'next/link';

export default function PromptsPage() {
  const { data: prompts, isLoading } = usePrompts();

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Prompt Studio</h1>
          <p className="text-muted-foreground mt-1">Design, version, and evaluate prompts.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded font-medium hover:bg-primary/90">
          Create Prompt
        </button>
      </div>
      
      {isLoading ? (
        <div className="text-muted-foreground">Loading prompts...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts?.map(prompt => (
            <Link key={prompt.id} href={`/prompts/${prompt.id}`}>
              <div className="border border-border bg-muted/5 rounded-xl p-5 hover:bg-muted/10 transition-colors cursor-pointer flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{prompt.name}</h3>
                  <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">{prompt.status}</span>
                </div>
                <p className="text-sm text-muted-foreground flex-1 mb-4">{prompt.description}</p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  {prompt.tags.map(tag => (
                    <span key={tag} className="border border-border px-2 py-1 rounded">#{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
