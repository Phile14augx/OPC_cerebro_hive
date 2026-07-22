"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, GitBranch, Plug, ClipboardCheck } from "lucide-react";
import {
  api, checkOnline, KEY,
  type Workflow, type WorkflowRun, singleTaskDefinition, approvalGatedDefinition,
  type ConnectorDescriptor, type ConnectorInstance,
  type Approval, type ApprovalStatus,
} from "./lib";

type Tab = "workflows" | "integrations" | "approvals";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-text-secondary">
      <span className="font-semibold uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "rounded-md border border-border bg-surface-elevated/40 px-2.5 py-1.5 text-sm text-text-primary";

function WorkflowsPanel({ online }: { online: boolean | null }) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [form, setForm] = useState({ name: "", taskName: "", withApproval: false, approverRole: "admin" });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setWorkflows(await api<Workflow[]>("/v1/flow/workflows")); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const id = setInterval(() => void refresh(), 8000); return () => clearInterval(id); }, [refresh]);

  const create = async () => {
    if (!form.name.trim() || !form.taskName.trim()) return;
    setBusy(true);
    try {
      const definition = form.withApproval ? approvalGatedDefinition(form.taskName, form.approverRole) : singleTaskDefinition(form.taskName);
      await api("/v1/flow/workflows", { method: "POST", body: JSON.stringify({ name: form.name, definition }) });
      setForm(f => ({ ...f, name: "", taskName: "" }));
      await refresh();
    } catch { /* noop */ } finally { setBusy(false); }
  };

  const run = async (id: string) => {
    setBusy(true);
    try { const r = await api<WorkflowRun>(`/v1/flow/workflows/${id}/run`, { method: "POST", body: JSON.stringify({ input: {} }) }); setRuns(prev => [r, ...prev].slice(0, 15)); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  const resume = async (runId: string) => {
    setBusy(true);
    try { const r = await api<WorkflowRun>(`/v1/flow/runs/${runId}/resume`, { method: "POST" }); setRuns(prev => prev.map(x => x.id === r.id ? r : x)); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  const statusColor: Record<WorkflowRun["status"], string> = { running: "text-yellow-400", waiting_approval: "text-sky-400", completed: "text-primary-accent", failed: "text-red-400", compensated: "text-text-secondary" };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Create a workflow</h2>
        <p className="mt-1 text-xs text-text-secondary">Compiles a real, schema-validated workflow — optionally gated behind a human approval node (reuses HiveShield&apos;s Governance approvals).</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <Field label="Workflow name"><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Weekly report pipeline" /></Field>
          <Field label="Task"><input className={inputCls} value={form.taskName} onChange={e => setForm(f => ({ ...f, taskName: e.target.value }))} placeholder="Generate weekly executive summary" /></Field>
          <Field label="Require approval"><select className={inputCls} value={form.withApproval ? "yes" : "no"} onChange={e => setForm(f => ({ ...f, withApproval: e.target.value === "yes" }))}><option value="no">No</option><option value="yes">Yes</option></select></Field>
          {form.withApproval && <Field label="Approver role"><input className={inputCls} value={form.approverRole} onChange={e => setForm(f => ({ ...f, approverRole: e.target.value }))} /></Field>}
        </div>
        <button onClick={create} disabled={busy || !online} className="mt-3 rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">
          {busy ? "Compiling…" : "Create workflow"}
        </button>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Workflows ({workflows.length})</h2>
        <div className="mt-3 space-y-2">
          {workflows.map(w => (
            <div key={w.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface/40 p-4">
              <div>
                <div className="text-sm font-semibold text-text-primary">{w.name} <span className="text-text-secondary">v{w.version}</span></div>
                <p className="mt-0.5 text-xs text-text-secondary">{w.definition.nodes.length} nodes · entry: {w.definition.entry} · {w.status}</p>
              </div>
              <button onClick={() => run(w.id)} disabled={busy || !online} className="rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">Run</button>
            </div>
          ))}
          {workflows.length === 0 && <p className="text-sm text-text-secondary">No workflows created yet.</p>}
        </div>
      </section>

      {runs.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Recent runs (this session)</h2>
          <div className="mt-3 space-y-2">
            {runs.map(r => (
              <div key={r.id} className="rounded-xl border border-border bg-surface/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-text-secondary">run {r.id.slice(0, 12)}…</span>
                  <span className={`text-xs font-semibold uppercase ${statusColor[r.status]}`}>{r.status}</span>
                </div>
                {r.state.completed.length > 0 && <p className="mt-1 text-xs text-text-secondary">Completed nodes: {r.state.completed.join(", ")}</p>}
                {r.error && <p className="mt-1 text-xs text-red-400">{r.error}</p>}
                {r.status === "waiting_approval" && (
                  <button onClick={() => resume(r.id)} disabled={busy} className="mt-2 rounded-md border border-sky-400 px-3 py-1 text-xs font-semibold text-sky-400 disabled:opacity-40">Check approval &amp; resume</button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function IntegrationsPanel({ online }: { online: boolean | null }) {
  const [catalog, setCatalog] = useState<ConnectorDescriptor[]>([]);
  const [instances, setInstances] = useState<ConnectorInstance[]>([]);
  const [form, setForm] = useState({ kind: "webhook", name: "" });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setCatalog(await api<ConnectorDescriptor[]>("/v1/connect/catalog")); } catch { /* noop */ }
    try { setInstances(await api<ConnectorInstance[]>("/v1/connect/instances")); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const id = setInterval(() => void refresh(), 8000); return () => clearInterval(id); }, [refresh]);

  const configure = async () => {
    if (!form.name.trim()) return;
    setBusy(true);
    try { await api("/v1/connect/instances", { method: "POST", body: JSON.stringify({ kind: form.kind, name: form.name, config: {} }) }); setForm(f => ({ ...f, name: "" })); await refresh(); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Connect an integration</h2>
        <p className="mt-1 text-xs text-text-secondary">Webhook, REST, and GitHub connectors are fully live. Slack/Teams/Jira/Salesforce/SAP/HubSpot/Google/Microsoft/AWS/Azure are catalog scaffolds — same contract, ready for OAuth credentials.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Field label="Connector"><select className={inputCls} value={form.kind} onChange={e => setForm(f => ({ ...f, kind: e.target.value }))}>{catalog.map(c => <option key={c.kind} value={c.kind}>{c.title}</option>)}</select></Field>
          <Field label="Instance name"><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ops-webhook" /></Field>
        </div>
        <button onClick={configure} disabled={busy || !online} className="mt-3 rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">
          {busy ? "Configuring…" : "Configure"}
        </button>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Configured instances ({instances.length})</h2>
        <div className="mt-3 space-y-2">
          {instances.map(i => (
            <div key={i.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface/40 p-4">
              <div className="text-sm text-text-primary">{i.name} <span className="text-text-secondary">· {i.kind}</span></div>
              <span className={`text-xs font-semibold uppercase ${i.status === "configured" ? "text-primary-accent" : "text-red-400"}`}>{i.status}</span>
            </div>
          ))}
          {instances.length === 0 && <p className="text-sm text-text-secondary">No integrations configured yet.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Catalog ({catalog.length})</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {catalog.map(c => (
            <div key={c.kind} className="rounded-lg border border-border bg-surface-elevated/40 px-3 py-2 text-xs">
              <div className="font-semibold text-text-primary">{c.title}</div>
              <p className="mt-0.5 text-text-secondary">{c.category} · {c.auth} auth · {c.operations.join(", ")}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ApprovalsPanel({ online }: { online: boolean | null }) {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | "">("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { const q = statusFilter ? `?status=${statusFilter}` : ""; setApprovals(await api<Approval[]>(`/v1/governance/approvals${q}`)); } catch { /* noop */ }
  }, [online, statusFilter]);
  useEffect(() => { void refresh(); const id = setInterval(() => void refresh(), 6000); return () => clearInterval(id); }, [refresh]);

  const decide = async (id: string, decision: "approved" | "rejected") => {
    setBusyId(id);
    try { await api(`/v1/governance/approvals/${id}/decide`, { method: "POST", body: JSON.stringify({ decision }) }); await refresh(); }
    catch { /* noop */ } finally { setBusyId(null); }
  };

  const statusColor: Record<ApprovalStatus, string> = { pending: "text-yellow-400", approved: "text-primary-accent", rejected: "text-red-400" };

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">Same Governance approval queue HiveShield surfaces — CerebroFlow gives workflow builders a dedicated view for the approval-gated nodes they create.</p>
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <Field label="Status">
          <select className={inputCls} value={statusFilter} onChange={e => setStatusFilter(e.target.value as ApprovalStatus | "")}>
            <option value="">All</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
          </select>
        </Field>
      </section>
      <section className="space-y-3">
        {approvals.map(a => (
          <div key={a.id} className="rounded-xl border border-border bg-surface/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold text-text-primary">{a.subjectKind} <span className="text-text-secondary">· {a.subjectId}</span></div>
              <span className={`text-xs font-semibold uppercase ${statusColor[a.status]}`}>{a.status}</span>
            </div>
            <p className="mt-1 text-xs text-text-secondary">Requested by {a.requestedBy} · needs {a.approverRole} approval</p>
            {a.status === "pending" && (
              <div className="mt-3 flex gap-2">
                <button onClick={() => decide(a.id, "approved")} disabled={busyId === a.id || !online} className="rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">Approve</button>
                <button onClick={() => decide(a.id, "rejected")} disabled={busyId === a.id || !online} className="rounded-md border border-red-400 px-3 py-1.5 text-xs font-semibold text-red-400 disabled:opacity-40">Reject</button>
              </div>
            )}
          </div>
        ))}
        {approvals.length === 0 && <p className="text-sm text-text-secondary">No approval requests yet.</p>}
      </section>
    </div>
  );
}

const TABS: [Tab, string, React.ComponentType<{ size?: number; className?: string }>][] = [
  ["workflows", "Workflows", GitBranch],
  ["integrations", "Integrations", Plug],
  ["approvals", "Approvals", ClipboardCheck],
];

export default function CerebroFlowPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("workflows");

  useEffect(() => { void checkOnline().then(setOnline); }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Platform
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">CerebroFlow™</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Event-driven workflow orchestration with human-in-the-loop approvals</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">
        CerebroFlow is the console over CerebroHive&apos;s Flow engine and Connect integration hub: compile and run
        schema-validated workflows, gate any step behind a real Governance approval, and configure connectors
        (webhook, REST, GitHub live; Slack/Jira/Salesforce/SAP and more as ready-to-authenticate scaffolds).
      </p>

      <div className="mt-5 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
        <span className="text-text-secondary">{online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}</span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {TABS.map(([t, label, Icon]) => (
          <button key={t} onClick={() => setTab(t)} className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold ${tab === t ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary"}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === "workflows" && <WorkflowsPanel online={online} />}
      {tab === "integrations" && <IntegrationsPanel online={online} />}
      {tab === "approvals" && <ApprovalsPanel online={online} />}
    </main>
  );
}
