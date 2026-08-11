import type { AgentLifecycleStatus } from '@cerebro/agent-registry-contracts';

const tones: Record<AgentLifecycleStatus, string> = {
  DRAFT: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  SANDBOX: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200',
  CERTIFIED: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
  PRODUCTION: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  SUSPENDED: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
};

export function LifecycleBadge({ status }: { status: AgentLifecycleStatus }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.12em] ${tones[status]}`}>{status}</span>;
}
