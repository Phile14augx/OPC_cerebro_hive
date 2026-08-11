'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import type { AgentLifecycleStatus } from '@cerebro/agent-registry-contracts';
import { AgentDraftEditor } from '@/components/agent-registry/AgentDraftEditor';
import { AgentGovernanceSummary } from '@/components/agent-registry/AgentGovernanceSummary';
import { AgentLifecycleActions } from '@/components/agent-registry/AgentLifecycleActions';
import { AgentVersionHistory } from '@/components/agent-registry/AgentVersionHistory';
import { LifecycleBadge } from '@/components/agent-registry/LifecycleBadge';
import { useAgentDraft, useAgentRegistryDetail, useAgentVersions, usePublishAgentDraft } from '@/src/hooks/useAgentRegistry';

const tabs = ['overview', 'draft', 'versions', 'governance', 'lifecycle'] as const;
type Tab = typeof tabs[number];

export default function AgentRegistryDetailPage() {
  const { id } = useParams() as { id: string };
  const [tab, setTab] = useState<Tab>('overview');
  const [notice, setNotice] = useState<string | null>(null);
  const detail = useAgentRegistryDetail(id);
  const draft = useAgentDraft(id);
  const versions = useAgentVersions(id);
  const publish = usePublishAgentDraft(id);
  const agent = detail.data;

  if (detail.isLoading) return <div className="p-10 text-sm text-muted-foreground">Loading agent identity…</div>;
  if (!agent || detail.error) return <div className="p-10"><p className="text-rose-300">Agent not found in this workspace.</p><Link href="/app/agents" className="mt-4 inline-block text-sm text-cyan-300">Return to registry</Link></div>;

  const status = (agent.lifecycleStatus ?? 'DRAFT') as AgentLifecycleStatus;
  const canPublish = Boolean(draft.data?.definition) && !['PRODUCTION', 'SUSPENDED'].includes(status);

  async function publishDraft() {
    if (!draft.data) return;
    setNotice(null);
    await publish.mutateAsync({ expectedDraftRevision: draft.data.revision });
    setNotice('Published a new immutable version and rebased the working draft.');
    setTab('versions');
  }

  return (
    <main className="mx-auto w-full max-w-7xl p-6 lg:p-10">
      <Link href="/app/agents" className="font-mono text-xs text-muted-foreground hover:text-cyan-200">← Agent Registry</Link>
      <header className="mt-5 flex flex-col justify-between gap-6 border-b border-border pb-7 lg:flex-row lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-3"><h1 className="text-3xl font-semibold tracking-tight">{agent.name}</h1><LifecycleBadge status={status} /></div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{agent.description || 'No description yet.'}</p>
          <p className="mt-3 font-mono text-[10px] text-muted-foreground/70">{agent.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-xs text-muted-foreground"><p>{agent.activeVersion ? `Active v${agent.activeVersion.version}` : 'No published version'}</p><p>Draft r{draft.data?.revision ?? '—'}</p></div>
          <button disabled={!canPublish || publish.isPending} onClick={publishDraft} className="rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">{publish.isPending ? 'Publishing…' : 'Publish version'}</button>
        </div>
      </header>

      {notice && <div className="mt-5 rounded-lg border border-emerald-400/30 bg-emerald-400/5 p-3 text-sm text-emerald-200">{notice}</div>}
      {publish.error && <div className="mt-5 rounded-lg border border-rose-400/30 bg-rose-400/5 p-3 text-sm text-rose-200">{publish.error.message}</div>}
      {status === 'PRODUCTION' && <div className="mt-5 rounded-lg border border-amber-400/30 bg-amber-400/5 p-3 text-sm text-amber-100">Production definitions cannot be published in place. Suspend the agent before opening a governed editing cycle.</div>}

      <nav className="my-7 flex gap-1 overflow-x-auto border-b border-border" aria-label="Agent registry sections">
        {tabs.map(value => <button key={value} onClick={() => setTab(value)} className={`border-b-2 px-4 py-3 text-sm capitalize ${tab === value ? 'border-cyan-300 text-cyan-100' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{value}</button>)}
      </nav>

      {tab === 'overview' && (
        <div className="grid gap-4 md:grid-cols-3">
          <section className="rounded-xl border border-border bg-muted/5 p-5"><p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Stable identity</p><p className="mt-3 text-sm">Workspace scoped</p><p className="mt-1 text-xs text-muted-foreground">Owner {agent.ownerId || 'unassigned'}</p></section>
          <section className="rounded-xl border border-border bg-muted/5 p-5"><p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Executable snapshot</p><p className="mt-3 text-sm">{agent.activeVersion ? `Version ${agent.activeVersion.version}` : 'Not published'}</p><p className="mt-1 text-xs text-muted-foreground">Published versions are immutable.</p></section>
          <section className="rounded-xl border border-border bg-muted/5 p-5"><p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Working state</p><p className="mt-3 text-sm">Revision {draft.data?.revision ?? '—'}</p><p className="mt-1 text-xs text-muted-foreground">{draft.data?.validationStatus ?? 'No draft metadata'}</p></section>
        </div>
      )}
      {tab === 'draft' && (draft.isLoading ? <p className="text-sm text-muted-foreground">Loading draft…</p> : draft.data?.definition ? <AgentDraftEditor key={`${draft.data.id}:${draft.data.revision}`} agentId={id} draft={draft.data} /> : <div className="rounded-xl border border-border p-8 text-sm text-muted-foreground">Your role can inspect draft metadata but cannot view unpublished instructions.</div>)}
      {tab === 'versions' && <AgentVersionHistory versions={versions.data ?? []} activeVersionId={agent.activeVersionId} />}
      {tab === 'governance' && <AgentGovernanceSummary definition={agent.activeVersion?.definition} />}
      {tab === 'lifecycle' && <AgentLifecycleActions agentId={id} status={status} hasActiveVersion={Boolean(agent.activeVersionId)} />}
    </main>
  );
}
