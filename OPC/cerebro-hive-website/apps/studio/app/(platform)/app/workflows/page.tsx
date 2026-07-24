'use client';

import { useWorkflows } from '@/src/hooks/useWorkflow';
import Link from 'next/link';

export default function WorkflowsPage() {
  const { data: workflows, isLoading } = useWorkflows();

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Workflow Designer</h1>
          <p className="text-muted-foreground mt-1">Visually orchestrate agents, tools, and logic into durable execution graphs.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded font-medium hover:bg-primary/90">
          Create Workflow
        </button>
      </div>
      
      {isLoading ? (
        <div className="text-muted-foreground">Loading workflows...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows?.map(workflow => (
            <Link key={workflow.id} href={`/workflows/${workflow.id}`}>
              <div className="border border-border bg-muted/5 rounded-xl p-5 hover:bg-muted/10 transition-colors cursor-pointer flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{workflow.name}</h3>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 bg-secondary/20 text-secondary rounded-full">v{workflow.version}</span>
                    <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">{workflow.status}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground flex-1 mb-4">{workflow.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
