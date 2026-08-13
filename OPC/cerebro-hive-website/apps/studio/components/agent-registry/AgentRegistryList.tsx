import type { AgentLifecycleStatus, AgentRegistryRecordDto } from '@cerebro/agent-registry-contracts';
import Link from 'next/link';
import { LifecycleBadge } from './LifecycleBadge';

export function AgentRegistryList({ agents }: { agents: AgentRegistryRecordDto[] }) {
  if (!agents.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/5 px-6 py-16 text-center">
        <p className="text-lg font-medium text-foreground">No agents in this workspace</p>
        <p className="mt-2 text-sm text-muted-foreground">Create a draft identity, then publish and govern it through the lifecycle.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background/60">
      <div className="hidden grid-cols-[minmax(0,1.7fr)_140px_130px_150px] gap-4 border-b border-border px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground md:grid">
        <span>Agent identity</span><span>Lifecycle</span><span>Version</span><span>Working draft</span>
      </div>
      {agents.map(agent => {
        const status = (agent.lifecycleStatus ?? 'DRAFT') as AgentLifecycleStatus;
        return (
          <Link key={agent.id} href={`/app/agents/${agent.id}`} className="group grid gap-4 border-b border-border/70 px-5 py-5 transition-colors last:border-b-0 hover:bg-muted/10 md:grid-cols-[minmax(0,1.7fr)_140px_130px_150px] md:items-center">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,.55)]" />
                <h2 className="truncate font-semibold text-foreground group-hover:text-cyan-100">{agent.name}</h2>
              </div>
              <p className="mt-1.5 line-clamp-2 pl-5 text-sm text-muted-foreground">{agent.description || 'No description yet.'}</p>
              <p className="mt-2 pl-5 font-mono text-[10px] text-muted-foreground/70">{agent.id}</p>
            </div>
            <div><LifecycleBadge status={status} /></div>
            <div className="font-mono text-sm text-foreground">{agent.activeVersion ? `v${agent.activeVersion.version}` : 'Unpublished'}</div>
            <div className="text-sm text-muted-foreground">
              {agent.draft ? <><span className="text-foreground">r{agent.draft.revision}</span><br /><span className="text-xs">{agent.draft.validationStatus.toLowerCase()}</span></> : 'No draft'}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
