'use client';

import { useMemo, useState } from 'react';
import { AgentRegistryList } from '@/components/agent-registry/AgentRegistryList';
import { CreateAgentDialog } from '@/components/agent-registry/CreateAgentDialog';
import { useAgentRegistryList } from '@/src/hooks/useAgentRegistry';

export default function AgentsPage() {
  const registry = useAgentRegistryList();
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const agents = useMemo(() => {
    const value = query.trim().toLowerCase();
    return (registry.data?.data ?? []).filter(agent => !value || agent.name.toLowerCase().includes(value) || agent.description?.toLowerCase().includes(value));
  }, [registry.data, query]);

  return (
    <main className="mx-auto w-full max-w-7xl p-6 lg:p-10">
      <header className="mb-8 border-b border-border pb-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-300">Agent Academy / Registry</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">Governed agent identities</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Create mutable working drafts, publish immutable definitions, and move each agent through an explicit operating lifecycle.</p>
          </div>
          <button onClick={() => setCreating(true)} className="rounded-lg bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">Create agent</button>
        </div>
        <div className="mt-7 flex items-center gap-3">
          <input aria-label="Search agents" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search this workspace…" className="w-full max-w-md rounded-lg border border-border bg-muted/10 px-3.5 py-2.5 text-sm outline-none focus:border-cyan-400" />
          <span className="font-mono text-xs text-muted-foreground">{agents.length} identities</span>
        </div>
      </header>
      {registry.isLoading && <div className="rounded-2xl border border-border p-8 text-sm text-muted-foreground">Loading the registry…</div>}
      {registry.error && <div className="rounded-2xl border border-rose-400/30 bg-rose-400/5 p-6 text-sm text-rose-200">Registry unavailable: {registry.error.message}</div>}
      {!registry.isLoading && !registry.error && <AgentRegistryList agents={agents} />}
      <CreateAgentDialog open={creating} onOpenChange={setCreating} />
    </main>
  );
}
