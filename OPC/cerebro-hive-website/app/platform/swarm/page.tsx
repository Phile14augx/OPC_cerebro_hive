"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import { api, checkOnline, KEY, type SwarmAgentDef, type Directive, type SwarmTask, type TaskPriority } from "./lib";

const ROLE_COLOR: Record<string, string> = {
  ceo: "border-primary-accent/60 text-primary-accent",
  strategy: "border-blue-400/50 text-blue-300",
  architect: "border-purple-400/50 text-purple-300",
  planner: "border-amber-400/50 text-amber-300",
  reviewer: "border-emerald-400/50 text-emerald-300",
};

function DirectiveCard({ directive }: { directive: Directive }) {
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState<SwarmTask[] | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = useCallback(async () => {
    if (!open && !tasks) {
      setLoading(true);
      try {
        const res = await api<{ directive: Directive; tasks: SwarmTask[] }>(`/v1/cerebroswarm/directives/${directive.id}`);
        setTasks(res.tasks);
      } catch { /* noop */ } finally { setLoading(false); }
    }
    setOpen(o => !o);
  }, [open, tasks, directive.id]);

  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4">
      <button onClick={() => void toggle()} className="flex w-full items-center justify-between gap-3 text-left">
        <div>
          <div className="text-sm font-semibold text-text-primary">{directive.objective}</div>
          <div className="mt-1 text-xs text-text-secondary">
            {directive.priority} priority · {directive.status} · submitted {new Date(directive.createdAt).toLocaleString()}
          </div>
        </div>
        {open ? <ChevronDown size={16} className="shrink-0 text-text-secondary" /> : <ChevronRight size={16} className="shrink-0 text-text-secondary" />}
      </button>

      {open && (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          {loading && <p className="text-xs text-text-secondary">Loading task chain…</p>}
          {tasks?.map(t => (
            <div key={t.id} className={`rounded-lg border ${ROLE_COLOR[t.role] ?? "border-border"} bg-surface-elevated/40 p-3`}>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-mono">{t.taskId}</span>
                <span className="uppercase tracking-wider">{t.recipient}</span>
              </div>
              <div className="mt-1 text-xs text-text-secondary">
                {t.sender} → {t.recipient} · deps: {t.dependencies.length ? t.dependencies.join(", ") : "none"} · deadline {t.deadline}
              </div>
              <div className="mt-2 text-sm text-text-primary">{t.objective}</div>
              <div className="mt-2 rounded-md bg-surface/60 p-2 text-sm text-text-secondary">{t.output}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CerebroSwarmPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [agents, setAgents] = useState<SwarmAgentDef[]>([]);
  const [directives, setDirectives] = useState<Directive[]>([]);
  const [objective, setObjective] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("High");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const ok = await checkOnline();
    setOnline(ok);
    if (!ok || !KEY) return;
    try {
      const [a, d] = await Promise.all([
        api<{ agents: SwarmAgentDef[] }>("/v1/cerebroswarm/agents"),
        api<{ directives: Directive[] }>("/v1/cerebroswarm/directives"),
      ]);
      setAgents(a.agents);
      setDirectives(d.directives);
    } catch { /* noop */ }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const submit = useCallback(async () => {
    if (!objective.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await api("/v1/cerebroswarm/directives", { method: "POST", body: JSON.stringify({ objective, priority }) });
      setObjective("");
      await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  }, [objective, priority, refresh]);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Platform
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">CerebroSwarm™ — Phase 1: Executive Council</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">The Enterprise Cognitive Workforce</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">
        Five named domain-expert agents — CEO, Strategy, Enterprise Architect, Planner, Reviewer — coordinate every
        submitted directive through a sequential chain of structured task messages (sender, recipient, objective,
        dependencies, priority, deadline). These agents plan and coordinate; they don&apos;t write code. Engineering,
        DevOps, Security, and Business execution swarms are a later phase once the shared Knowledge Graph, Memory, and
        Tool Registry substrate is further along.
      </p>

      <div className="mt-5 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
        <span className="text-text-secondary">{online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}</span>
      </div>

      <section className="mt-6 rounded-xl border border-primary-accent/40 bg-primary-accent/5 p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-accent">Want the numbers behind the decisions?</p>
        <h2 className="mt-2 text-xl font-semibold text-text-primary">CerebroInsight™ — the executive intelligence layer</h2>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">Live metrics, alerts, and AI-generated insight narratives pulled directly from HiveForge, CerebroStudio, and CerebroSwarm activity.</p>
        <Link href="/platform/insight" className="mt-4 inline-block rounded-lg border border-primary-accent px-4 py-2 text-sm font-semibold text-primary-accent">Open CerebroInsight™ →</Link>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Executive roster</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3 lg:grid-cols-5">
          {agents.map(a => (
            <div key={a.role} className={`rounded-xl border ${ROLE_COLOR[a.role] ?? "border-border"} bg-surface/40 p-4`}>
              <div className="text-sm font-semibold text-text-primary">{a.name}</div>
              <div className="mt-0.5 text-xs uppercase tracking-wider">{a.title}</div>
              <p className="mt-2 text-xs text-text-secondary">{a.responsibility}</p>
            </div>
          ))}
          {agents.length === 0 && <p className="text-sm text-text-secondary">Roster loads once the platform is reachable.</p>}
        </div>
      </section>

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

      <section className="mt-8 rounded-xl border border-border bg-surface/40 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Submit a directive</h2>
        <p className="mt-1 text-xs text-text-secondary">The directive runs through all five agents in order — CEO → Strategy → Enterprise Architect → Planner → Reviewer.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-[3fr_1fr_auto]">
          <input
            value={objective}
            onChange={e => setObjective(e.target.value)}
            placeholder="e.g. Build an enterprise AI customer support platform"
            className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary"
          />
          <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <button onClick={() => void submit()} disabled={busy || !online || !KEY || !objective.trim()} className="rounded-lg border border-primary-accent px-4 py-2 text-sm font-semibold text-primary-accent disabled:opacity-40">
            {busy ? "Coordinating…" : "Submit directive"}
          </button>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Directive history</h2>
        <div className="mt-3 space-y-3">
          {directives.map(d => <DirectiveCard key={d.id} directive={d} />)}
          {directives.length === 0 && <p className="text-sm text-text-secondary">No directives yet — submit one above to see the executive council coordinate.</p>}
        </div>
      </section>
    </main>
  );
}
