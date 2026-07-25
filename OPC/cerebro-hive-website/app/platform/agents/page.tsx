"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, Play, PlusCircle } from "lucide-react";
import { api, checkOnline, type Agent, type AgentStatus, type RunOut } from "./lib";

type Tab = "registry" | "run";
const inputCls = "rounded-md border border-border bg-surface-elevated/40 px-2.5 py-1.5 text-sm text-text-primary w-full";
const btnPrimary = "rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40";

function statusColor(s: AgentStatus) {
  return s === "active" ? "text-primary-accent border-primary-accent/40 bg-primary-accent/10"
    : s === "suspended" ? "text-red-400 border-red-400/40 bg-red-400/10"
    : "text-text-secondary border-border bg-surface/40";
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1 text-xs text-text-secondary"><span className="font-semibold uppercase tracking-wider">{label}</span>{children}</label>;
}

function RegistryPanel({ online }: { online: boolean | null }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", description: "", model: "gpt-4o-mini" });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online) return;
    try { setAgents(await api<Agent[]>("/agents")); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const id = setInterval(refresh, 6000); return () => clearInterval(id); }, [refresh]);

  const create = async () => {
    if (!form.name || !form.slug) return;
    setBusy(true);
    try { await api("/agents", { method: "POST", body: JSON.stringify(form) }); await refresh(); setForm(f => ({ ...f, name: "", slug: "", description: "" })); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  const setStatus = async (slug: string, status: AgentStatus) => {
    try { await api(`/agents/${slug}/status`, { method: "PATCH", body: JSON.stringify({ status }) }); await refresh(); }
    catch { /* noop */ }
  };

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">The agent registry is the authoritative list of all registered AI principals on the platform. Each agent has a unique slug, a bound model, and a status. Agents require explicit tool grants before they can invoke any platform capability.</p>
      <section className="rounded-xl border border-border bg-surface/40 p-4 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Register agent</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name"><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Finance Analyst" /></Field>
          <Field label="Slug"><input className={inputCls} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="finance-analyst-v1" /></Field>
          <Field label="Model"><input className={inputCls} value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} /></Field>
          <Field label="Description"><input className={inputCls} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Analyzes financial reports and generates forecasts" /></Field>
        </div>
        <button onClick={create} disabled={busy || !online || !form.name || !form.slug} className={`inline-flex items-center gap-1.5 ${btnPrimary}`}><PlusCircle size={12} />{busy ? "Registering…" : "Register agent"}</button>
      </section>
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">{agents.length} registered agents</h2>
        <div className="mt-3 space-y-2">
          {agents.map(a => (
            <div key={a.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-text-primary">{a.name}</div>
                  <div className="mt-0.5 font-mono text-[10px] text-text-secondary">{a.slug} · {a.model}</div>
                </div>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${statusColor(a.status)}`}>{a.status}</span>
              </div>
              {a.description && <p className="mt-2 text-xs text-text-secondary">{a.description}</p>}
              <div className="mt-3 flex gap-2">
                {a.status !== "active" && <button onClick={() => setStatus(a.slug, "active")} className={btnPrimary}>Activate</button>}
                {a.status === "active" && <button onClick={() => setStatus(a.slug, "inactive")} className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary">Deactivate</button>}
                {a.status !== "suspended" && <button onClick={() => setStatus(a.slug, "suspended")} className="rounded-md border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-400">Suspend</button>}
              </div>
            </div>
          ))}
          {agents.length === 0 && <p className="text-sm text-text-secondary">No agents registered. Create one above.</p>}
        </div>
      </div>
    </div>
  );
}

function RunPanel({ online }: { online: boolean | null }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [form, setForm] = useState({ slug: "", prompt: "" });
  const [result, setResult] = useState<RunOut | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!online) return;
    api<Agent[]>("/agents").then(setAgents).catch(() => { /* noop */ });
  }, [online]);

  const run = async () => {
    if (!form.slug || !form.prompt) return;
    setBusy(true);
    try {
      const r = await api<RunOut>("/runtime/execute", { method: "POST", body: JSON.stringify({ agent_slug: form.slug, prompt: form.prompt }) });
      setResult(r);
    } catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">Execute an agent against the runtime. The agent's tool grants are enforced at execution time — any tool call outside the granted set is denied. All executions are traced via HiveEvaluation.</p>
      <section className="rounded-xl border border-border bg-surface/40 p-4 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Execute agent</h2>
        <Field label="Agent">
          <select className={inputCls} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}>
            <option value="">Select agent…</option>
            {agents.map(a => <option key={a.slug} value={a.slug}>{a.name} ({a.slug})</option>)}
          </select>
        </Field>
        <Field label="Prompt">
          <textarea className={`${inputCls} min-h-[100px]`} value={form.prompt} onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))} placeholder="Analyze the latest quarterly results and identify top 3 risks." />
        </Field>
        <button onClick={run} disabled={busy || !online || !form.slug || !form.prompt} className={`inline-flex items-center gap-1.5 ${btnPrimary}`}><Play size={12} />{busy ? "Running…" : "Run agent"}</button>
      </section>
      {result && (
        <section className="rounded-xl border border-border bg-surface/40 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Output</h2>
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${result.status === "completed" ? "text-primary-accent border-primary-accent/40 bg-primary-accent/10" : "text-red-400 border-red-400/40 bg-red-400/10"}`}>{result.status}</span>
          </div>
          <p className="font-mono text-[10px] text-text-secondary">run_id: {result.run_id}</p>
          {result.output && <pre className="mt-2 whitespace-pre-wrap text-sm text-text-primary">{result.output}</pre>}
          {result.error && <p className="text-sm text-red-400">{result.error}</p>}
        </section>
      )}
    </div>
  );
}

const TABS: [Tab, string, React.ComponentType<{ size?: number }>][] = [
  ["registry", "Agent Registry", Bot],
  ["run", "Run Agent", Play],
];

export default function HiveAgentsPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("registry");
  useEffect(() => { void checkOnline().then(setOnline); }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Platform
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveAgents™ · Tier 3</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Agent orchestration — register principals, grant tools, execute with full tracing</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">HiveAgents is the agent runtime layer. Register AI principals with a unique slug and bound model, manage their activation lifecycle, then execute them against the LangGraph state engine with deny-by-default tool enforcement.</p>
      <div className="mt-5 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
        <span className="text-text-secondary">{online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}</span>
      </div>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {TABS.map(([t, label, Icon]) => (
          <button key={t} onClick={() => setTab(t)} className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors ${tab === t ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary hover:text-text-primary"}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>
      {tab === "registry" && <RegistryPanel online={online} />}
      {tab === "run" && <RunPanel online={online} />}
    </main>
  );
}
