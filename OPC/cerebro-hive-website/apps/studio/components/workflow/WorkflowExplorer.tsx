'use client';

import { useWorkflows } from '@/src/hooks/useWorkflow';
import Link from 'next/link';

export function WorkflowExplorer() {
  const { data: workflows, isLoading } = useWorkflows();

  return (
    <div className="flex flex-col h-full bg-muted/5 border-r border-border w-64">
      <div className="h-8 border-b border-border flex items-center px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Workflows
      </div>
      <div className="flex-1 overflow-auto p-2">
        {isLoading && <div className="text-xs text-muted-foreground p-2">Loading...</div>}
        {workflows?.map(workflow => (
          <Link key={workflow.id} href={`/workflows/${workflow.id}`}>
            <div className="px-3 py-2 text-sm hover:bg-muted/50 cursor-pointer rounded mb-1 border border-transparent hover:border-border transition-colors">
              <div className="font-medium truncate">{workflow.name}</div>
              <div className="text-xs text-muted-foreground flex justify-between mt-1">
                <span>{workflow.status}</span>
                <span>v{workflow.version}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
