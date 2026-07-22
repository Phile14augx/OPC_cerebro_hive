"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Network, PlayCircle } from "lucide-react";
import { api, checkOnline, KEY, type MeshAgent, type DiscoverHit, type VoteResult, type Execution, type ExecutionStatus, type ToolDefinition } from "./lib";

type Tab = "mesh" | "runtime";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-text-secondary">
      <span className="font-semibold uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "rounded-md border border-border bg-surface-elevated/40 px-2.5 py-1.5 text-sm text-text-primary";

function MeshPanel({ online }: { online: boolean | null }) {
  const [agents, setAgents] = useState<MeshAgent[]>([]);
  const [form, setForm] = useState({ name: "", capabilitiesRaw: "" });
  const [task, setTask] = useState("");
  const [discovered, setDiscovered] = useState<DiscoverHit[] | null>(null);
  const [vote, setVote] = useState<VoteResult | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setAgents(await api<MeshAgent[]>("/v1/mesh/agents")); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const id = setInterval(() => void refresh(), 7000); return () => clearInterval(id); }, [refresh]);

  const register = async () => {
    const capabilities = form.capabilitiesRaw.split(",").map(s => s.trim()).filter(Boolean);
    if (!form.name.trim() || capabilities.length === 0) return;
    setBusy(true);
    try { await api("/v1/mesh/agents", { method: "POST", body: JSON.stringify({ name: form.name, capabilities }) }); setForm({ name: "", capabilitiesRaw: "" }); await refresh(); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  const discover = async () => {
    if (!task.trim()) return;
    setBusy(true);
    try { setDiscovered((await api<{ agent: MeshAgent; score: number }[]>("/v1/mesh/discover", { method: "POST", body: JSON.stringify({ task, limit: 5 }) }))); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  const electLeader = async () => {
    setBusy(true);
    try { await api("/v1/mesh/leader", { method: "POST" }); await refresh(); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  const runVote = async () => {
    setBusy(true);
    try { setVote(await api<VoteResult>("/v1/mesh/vote", { method: "POST", body: JSON.stringify({ question: "Which region should we prioritize next?", options: ["us-east", "eu-west", "apac"] }) })); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  const statusColor: Record<MeshAgent["status"], string> = { online: "text-primary-accent", degraded: "text-yellow-400", offline: "text-text-secondary" };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Register an agent</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Field label="Name"><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="billing-support-agent" /></Field>
          <Field label="Capabilities (comma-sep)"><input className={inputCls} value={form.capabilitiesRaw} onChange={e => setForm(f => ({ ...f, capabilitiesRaw: e.target.value }))} placeholder="billing, refunds, invoices" /></Field>
        </div>
        <button onClick={register} disabled={busy || !online} className="mt-3 rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">
          {busy ? "Registering…" : "Register agent"}
        </button>
      </section>

      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Capability discovery</h2>
        <div className="mt-3 flex gap-3">
          <input className={`${inputCls} flex-1`} value={task} onChange={e => setTask(e.target.value)} placeholder="Handle a refund escalation for a VIP customer" />
          <button onClick={discover} disabled={busy || !online} className="rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40 shrink-0">Discover</button>
        </div>
        {discovered && (
          <ul className="mt-3 space-y-1 text-xs text-text-secondary">
            {discovered.map(d => <li key={d.agent.id}>{d.agent.name} — score {d.score.toFixed(3)}</li>)}
            {discovered.length === 0 && <li>No agents matched.</li>}
          </ul>
        )}
      </section>

      <section className="flex gap-2">
        <button onClick={electLeader} disabled={busy || !online} className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary disabled:opacity-40">Elect leader</button>
        <button onClick={runVote} disabled={busy || !online} className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary disabled:opacity-40">Run sample vote</button>
      </section>
      {vote && <p className="text-xs text-text-secondary">Vote winner: <span className="font-semibold text-text-primary">{vote.winner}</span> ({vote.voters} voters) — {Object.entries(vote.tally).map(([k, v]) => `${k}: ${v.toFixed(2)}`).join(", ")}</p>}

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Agent directory ({agents.length})</h2>
        <div className="mt-3 space-y-2">
          {agents.map(a => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface/40 p-4">
              <div>
                <div className="text-sm font-semibold text-text-primary">{a.name} <span className="text-text-secondary">· {a.kind}</span></div>
                <p className="mt-0.5 text-xs text-text-secondary">{a.capabilities.join(", ")}</p>
              </div>
              <span className={`text-xs font-semibold uppercase ${statusColor[a.status]}`}>{a.status}</span>
            </div>
          ))}
          {agents.length === 0 && <p className="text-sm text-text-secondary">No agents registered yet.</p>}
        </div>
      </section>
    </div>
  );
}

function RuntimePanel({ online }: { online: boolean | null }) {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [tools, setTools] = useState<ToolDefinition[]>([]);
  const [goal, setGoal] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setExecutions(await api<Execution[]>("/v1/runtime/executions?limit=25")); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const id = setInterval(() => void refresh(), 5000); return () => clearInterval(id); }, [refresh]);
  useEffect(() => { if (!online || !KEY) return; api<{ tools: ToolDefinition[] }>("/v1/runtime/tools").then(r => setTools(r.tools)).catch(() => {}); }, [online]);

  const submit = async () => {
    if (!goal.trim() || !online) return;
    setBusy(true);
    try { await api("/v1/runtime/executions", { method: "POST", body: JSON.stringify({ goal, sync: true }) }); setGoal(""); await refresh(); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  const cancel = async (id: string) => {
    setBusy(true);
    try { await api(`/v1/runtime/executions/${id}/cancel`, { method: "POST" }); await refresh(); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  const statusColor: Partial<Record<ExecutionStatus, string>> = { completed: "text-primary-accent", failed: "text-red-400", cancelled: "text-text-secondary", running: "text-yellow-400" };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Submit an execution</h2>
        <p className="mt-1 text-xs text-text-secondary">{tools.length} tools available to the planner: {tools.slice(0, 6).map(t => t.name).join(", ")}{tools.length > 6 ? "…" : ""}</p>
        <div className="mt-3 flex gap-3">
          <input className={`${inputCls} flex-1`} value={goal} onChange={e => setGoal(e.target.value)} placeholder="Summarize this week's support tickets and flag anomalies" />
          <button onClick={submit} disabled={busy || !online} className="rounded-md border border-primary-accent px-4 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40 shrink-0 inline-flex items-center gap-1.5"><PlayCircle size={14} /> Run</button>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Executions ({executions.length})</h2>
        <div className="mt-3 space-y-2">
          {executions.map(e => (
            <div key={e.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-text-primary">{e.goal}</div>
                <span className={`text-xs font-semibold uppercase ${statusColor[e.status] ?? "text-text-secondary"}`}>{e.status}</span>
              </div>
              {e.result && <p className="mt-1 text-xs text-text-secondary">{e.result.output.slice(0, 300)}</p>}
              {e.error && <p className="mt-1 text-xs text-red-400">{e.error}</p>}
              {(e.status === "queued" || e.status === "running" || e.status === "planning") && (
                <button onClick={() => cancel(e.id)} disabled={busy} className="mt-2 rounded-md border border-red-400 px-3 py-1 text-xs font-semibold text-red-400 disabled:opacity-40">Cancel</button>
              )}
            </div>
          ))}
          {executions.length === 0 && <p className="text-sm text-text-secondary">No executions submitted yet.</p>}
        </div>
      </section>
    </div>
  );
}

const TABS: [Tab, string, React.ComponentType<{ size?: number; className?: string }>][] = [
  ["mesh", "Agent Mesh", Network],
  ["runtime", "Runtime", PlayCircle],
];

export default function HivePulsePage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("mesh");

  useEffect(() => { void checkOnline().then(setOnline); }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Platform
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HivePulse™</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">The unified control plane for your agent mesh and execution runtime</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">
        HivePulse is the console over CerebroHive&apos;s Agent Mesh and Execution Runtime: register agents, discover
        the best-suited agent for a task, elect leaders and run weighted votes across the mesh, and submit goals
        to the planning/execution engine with live status tracking.
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

      {tab === "mesh" && <MeshPanel online={online} />}
      {tab === "runtime" && <RuntimePanel online={online} />}
    </main>
  );
}
