"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Cpu, List, Zap } from "lucide-react";
import { api, checkOnline, type RunOut } from "./lib";

type Tab = "submit" | "runs";
const inputCls = "rounded-md border border-border bg-surface-elevated/40 px-2.5 py-1.5 text-sm text-text-primary w-full";
const btnPrimary = "rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1 text-xs text-text-secondary"><span className="font-semibold uppercase tracking-wider">{label}</span>{children}</label>;
}

function StatusBadge({ status }: { status: string }) {
  const color = status === "completed" ? "text-primary-accent border-primary-accent/40 bg-primary-accent/10"
    : status === "failed" ? "text-red-400 border-red-400/40 bg-red-400/10"
    : status === "running" ? "text-yellow-400 border-yellow-400/40 bg-yellow-400/10"
    : "text-text-secondary border-border bg-surface/40";
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${color}`}>{status}</span>;
}

function SubmitPanel({ online }: { online: boolean | null }) {
  const [form, setForm] = useState({ prompt: "", model: "gpt-4o-mini", temperature: "0.7", max_tokens: "512" });
  const [result, setResult] = useState<RunOut | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      const r = await api<RunOut>("/runtime/execute", {
        method: "POST",
        body: JSON.stringify({ prompt: form.prompt, model: form.model, temperature: parseFloat(form.temperature), max_tokens: parseInt(form.max_tokens) }),
      });
      setResult(r);
    } catch { /* noop */ } finally { setBusy(false); }
  };

  const simRun = async () => {
    setBusy(true);
    try {
      const r = await api<{ run_id: string; status: string }>("/simulator/run", {
        method: "POST",
        body: JSON.stringify({ prompt: form.prompt, model: form.model }),
      });
      setResult({ run_id: r.run_id, status: r.status as RunOut["status"] });
    } catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">HiveCompute manages LLM inference dispatch, resource quotas, and model routing. Submit a prompt to execute against the active model pool. Simulator mode allows dry-runs without consuming inference credits.</p>
      <section className="rounded-xl border border-border bg-surface/40 p-4 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Job parameters</h2>
        <Field label="Prompt">
          <textarea className={`${inputCls} min-h-[100px]`} value={form.prompt} onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))} placeholder="Summarize the Q3 earnings data in 3 bullet points." />
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Model"><input className={inputCls} value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} /></Field>
          <Field label="Temperature"><input className={inputCls} type="number" step="0.1" min="0" max="2" value={form.temperature} onChange={e => setForm(f => ({ ...f, temperature: e.target.value }))} /></Field>
          <Field label="Max tokens"><input className={inputCls} type="number" step="64" min="64" value={form.max_tokens} onChange={e => setForm(f => ({ ...f, max_tokens: e.target.value }))} /></Field>
        </div>
        <div className="flex gap-2">
          <button onClick={run} disabled={busy || !online || !form.prompt.trim()} className={btnPrimary}>{busy ? "Executing…" : "Execute"}</button>
          <button onClick={simRun} disabled={busy || !online || !form.prompt.trim()} className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary disabled:opacity-40">{busy ? "…" : "Simulate"}</button>
        </div>
      </section>
      {result && (
        <section className="rounded-xl border border-border bg-surface/40 p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Result</h2>
            <StatusBadge status={result.status} />
          </div>
          <p className="mt-1 text-xs text-text-secondary font-mono">run_id: {result.run_id}</p>
          {result.output && <pre className="mt-3 whitespace-pre-wrap text-sm text-text-primary">{result.output}</pre>}
          {result.error && <p className="mt-3 text-sm text-red-400">{result.error}</p>}
        </section>
      )}
    </div>
  );
}

function RunsPanel({ online }: { online: boolean | null }) {
  const [runs, setRuns] = useState<RunOut[]>([]);
  const [selected, setSelected] = useState<RunOut | null>(null);

  const refresh = useCallback(async () => {
    if (!online) return;
    try { setRuns(await api<RunOut[]>("/runtime/runs")); } catch { /* noop */ }
  }, [online]);

  useEffect(() => { void refresh(); const id = setInterval(refresh, 6000); return () => clearInterval(id); }, [refresh]);

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-secondary">{runs.length} runs tracked</p>
        <button onClick={() => void refresh()} className={btnPrimary}>Refresh</button>
      </div>
      {runs.length === 0
        ? <p className="text-sm text-text-secondary">No runs yet. Submit a job from the Submit tab.</p>
        : <div className="space-y-2">
            {runs.map(r => (
              <div key={r.run_id} onClick={() => setSelected(selected?.run_id === r.run_id ? null : r)} className="cursor-pointer rounded-xl border border-border bg-surface/40 p-4 hover:border-primary-accent/40 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-text-secondary">{r.run_id}</span>
                  <StatusBadge status={r.status} />
                </div>
                {selected?.run_id === r.run_id && (
                  <div className="mt-3 space-y-2">
                    {r.output && <pre className="whitespace-pre-wrap text-sm text-text-primary">{r.output}</pre>}
                    {r.error && <p className="text-sm text-red-400">{r.error}</p>}
                    {r.started_at && <p className="text-xs text-text-secondary">Started: {new Date(r.started_at).toLocaleString()}</p>}
                    {r.completed_at && <p className="text-xs text-text-secondary">Completed: {new Date(r.completed_at).toLocaleString()}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
      }
    </div>
  );
}

const TABS: [Tab, string, React.ComponentType<{ size?: number }>][] = [
  ["submit", "Submit Job", Zap],
  ["runs", "Run History", List],
];

export default function HiveComputePage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("submit");
  useEffect(() => { void checkOnline().then(setOnline); }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Platform
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveCompute™ · Tier 1</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Elastic AI compute — dispatch inference jobs across the model pool</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">HiveCompute is the distributed inference layer. Submit jobs to the runtime, simulate workloads before committing credits, and inspect full run history with status, output, and timing.</p>
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
      {tab === "submit" && <SubmitPanel online={online} />}
      {tab === "runs" && <RunsPanel online={online} />}
    </main>
  );
}
