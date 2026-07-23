'use client';

import { useAgents } from '@/src/hooks/useAgent';
import Link from 'next/link';

export function AgentExplorer() {
  const { data: agents, isLoading } = useAgents();

  return (
    <div className="flex flex-col h-full bg-muted/5 border-r border-border w-64">
      <div className="h-8 border-b border-border flex items-center px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Agents
      </div>
      <div className="flex-1 overflow-auto p-2">
        {isLoading && <div className="text-xs text-muted-foreground p-2">Loading...</div>}
        {agents?.map(agent => (
          <Link key={agent.id} href={`/agents/${agent.id}`}>
            <div className="px-3 py-2 text-sm hover:bg-muted/50 cursor-pointer rounded mb-1 border border-transparent hover:border-border transition-colors">
              <div className="font-medium truncate">{agent.name}</div>
              <div className="text-xs text-muted-foreground flex justify-between mt-1">
                <span>{agent.status}</span>
                <span>v{agent.version}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
