'use client';

import type { AgentLifecycleAction, AgentLifecycleStatus } from '@cerebro/agent-registry-contracts';
import { useTransitionAgentLifecycle } from '@/src/hooks/useAgentRegistry';

const states: AgentLifecycleStatus[] = ['DRAFT', 'SANDBOX', 'CERTIFIED', 'PRODUCTION'];
const next: Partial<Record<AgentLifecycleStatus, { action: AgentLifecycleAction; label: string; requirement: string }>> = {
  DRAFT: { action: 'enter_sandbox', label: 'Move to sandbox', requirement: 'Admin · active version required' },
  SANDBOX: { action: 'certify', label: 'Certify agent', requirement: 'Admin' },
  CERTIFIED: { action: 'promote_to_production', label: 'Promote to production', requirement: 'Owner only' },
  PRODUCTION: { action: 'suspend', label: 'Suspend production', requirement: 'Owner only' },
  SUSPENDED: { action: 'reactivate', label: 'Reactivate production', requirement: 'Owner only' },
};

export function AgentLifecycleActions({ agentId, status, hasActiveVersion }: { agentId: string; status: AgentLifecycleStatus; hasActiveVersion: boolean }) {
  const transition = useTransitionAgentLifecycle(agentId);
  const command = next[status];
  const disabled = transition.isPending || (!hasActiveVersion && status !== 'PRODUCTION');
  return (
    <div>
      <div className="grid grid-cols-4 gap-2 rounded-2xl border border-border bg-muted/5 p-3">
        {states.map((state, index) => {
          const activeIndex = states.indexOf(status === 'SUSPENDED' ? 'PRODUCTION' : status);
          const reached = index <= activeIndex;
          return <div key={state} className="relative px-2 py-4 text-center"><div className={`mx-auto mb-2 h-2.5 w-2.5 rounded-full ${reached ? 'bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,.6)]' : 'bg-muted'}`} /><p className={`font-mono text-[10px] ${state === status ? 'text-cyan-200' : 'text-muted-foreground'}`}>{state}</p></div>;
        })}
      </div>
      {status === 'SUSPENDED' && <div className="mt-3 rounded-lg border border-rose-400/30 bg-rose-400/5 p-3 text-sm text-rose-200">Execution is suspended. The last production version remains addressable for audit.</div>}
      <div className="mt-5 flex items-center gap-4">
        {command && <button disabled={disabled} onClick={() => transition.mutate({ action: command.action })} className="rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-40">{transition.isPending ? 'Applying…' : command.label}</button>}
        <p className="text-xs text-muted-foreground">{command?.requirement}</p>
      </div>
      {transition.error && <p className="mt-3 text-sm text-rose-300">{transition.error.message}</p>}
    </div>
  );
}
