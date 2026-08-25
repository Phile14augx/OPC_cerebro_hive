"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BrainCircuit, TrendingUp, Cpu } from "lucide-react";
import { api, checkOnline, KEY, type Memory, type MemoryType, type ForecastResult, type OptimizeResult } from "./lib";


const inputCls = "rounded-md border border-border bg-surface-elevated/40 px-2.5 py-1.5 text-sm text-text-primary w-full";
const btnPrimary = "rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1 text-xs text-text-secondary"><span className="font-semibold uppercase tracking-wider">{label}</span>{children}</label>;
}

const TYPE_BADGE: Record<MemoryType, string> = {
  working: "bg-blue-500/20 text-blue-400",
  episodic: "bg-purple-500/20 text-purple-400",
  semantic: "bg-primary-accent/20 text-primary-accent",
  long_term: "bg-yellow-500/20 text-yellow-400",
};

const MEMORY_TYPES: MemoryType[] = ["working", "episodic", "semantic", "long_term"];

function MemoryPanel({ online }: { online: boolean | null }) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [filterAgent, setFilterAgent] = useState("");
  const [filterType, setFilterType] = useState<MemoryType | "">("");
  const [form, setForm] = useState({ agentId: "", memoryType: "episodic" as MemoryType, content: "", importance: 0.5 });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (filterAgent) params.set("agent_id", filterAgent);
      if (filterType) params.set("memory_type", filterType);
      setMemories(await api<Memory[]>(`/memory?${params}`));
    } catch { /* noop */ }
  }, [online, filterAgent, filterType]);
  useEffect(() => { void refresh(); const t = setInterval(() => void refresh(), 6000); return () => clearInterval(t); }, [refresh]);

  const write = async () => {
    if (!form.agentId.trim() || !form.content.trim()) return;
    setBusy(true);
    try {
      await api("/memory", { method: "POST", body: JSON.stringify({ agentId: form.agentId, memoryType: form.memoryType, content: form.content, importance: form.importance }) });
      setForm(f => ({ ...f, content: "" }));
      await refresh();
    } catch { /* noop */ } finally { setBusy(false); }
  };

  const deleteMemory = async (id: string) => {
    setBusy(true);
    try { await api(`/memory/${id}`, { method: "DELETE" }); await refresh(); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Write memory</h2>
        <p className="mt-1 text-xs text-text-secondary">Store a memory entry for an agent across the four memory tiers: working (active context), episodic (what happened), semantic (what the agent knows), long-term (persistent facts).</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Agent ID"><input className={inputCls} value={form.agentId} onChange={e => setForm(f => ({ ...f, agentId: e.target.value }))} placeholder="invoice-processor-v1" /></Field>
          <Field label="Memory type">
            <select className={inputCls} value={form.memoryType} onChange={e => setForm(f => ({ ...f, memoryType: e.target.value as MemoryType }))}>
              {MEMORY_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Importance (0–1)"><input type="number" min={0} max={1} step={0.1} className={inputCls} value={form.importance} onChange={e => setForm(f => ({ ...f, importance: Number(e.target.value) }))} /></Field>
        </div>
        <div className="mt-3">
          <Field label="Content">
            <textarea className={`${inputCls} min-h-[70px]`} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="User prefers concise bullet-point summaries over long paragraphs." />
          </Field>
        </div>
        <button onClick={write} disabled={busy || !online} className={`mt-3 ${btnPrimary}`}>{busy ? "Writing…" : "Write memory"}</button>
      </section>

      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Filter</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Agent ID"><input className={inputCls} value={filterAgent} onChange={e => setFilterAgent(e.target.value)} placeholder="All agents" /></Field>
          <Field label="Memory type">
            <select className={inputCls} value={filterType} onChange={e => setFilterType(e.target.value as MemoryType | "")}>
              <option value="">All types</option>
              {MEMORY_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Memory store ({memories.length})</h2>
        <div className="mt-3 space-y-2">
          {memories.map(m => (
            <div key={m.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_BADGE[m.memoryType]}`}>{m.memoryType}</span>
                    <span className="text-xs text-text-secondary">{m.agentId} · importance {m.importance.toFixed(2)} · accessed {m.accessCount}×</span>
                  </div>
                  <p className="mt-2 text-sm text-text-primary">{m.content}</p>
                </div>
                <button onClick={() => deleteMemory(m.id)} disabled={busy} className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40 shrink-0">Delete</button>
              </div>
            </div>
          ))}
          {memories.length === 0 && <p className="text-sm text-text-secondary">No memories stored yet. Write the first memory above.</p>}
        </div>
      </section>
    </div>
  );
}

function ForecastPanel({ online }: { online: boolean | null }) {
  const [seriesRaw, setSeriesRaw] = useState("12,14,13,16,18,17,20,22");
  const [steps, setSteps] = useState(5);
  const [result, setResult] = useState<ForecastResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    const series = seriesRaw.split(",").map(s => Number(s.trim())).filter(n => !isNaN(n));
    if (series.length < 3) { setError("Need at least 3 data points."); return; }
    setError(""); setBusy(true);
    try { setResult(await api<ForecastResult>("/cortex/forecast", { method: "POST", body: JSON.stringify({ series, steps }) })); }
    catch (e: unknown) { setError(String((e as Error).message)); } finally { setBusy(false); }
  };

  const maxVal = result ? Math.max(...result.forecasts.map(f => f.value)) : 1;

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">Least-squares trend forecasting (Cortex Engine). Feed a time-series and get forward projections — used internally by HiveMemory for importance decay and by HiveAnalytics for demand prediction.</p>
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Run forecast</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Time series (comma-sep numbers)"><input className={inputCls} value={seriesRaw} onChange={e => setSeriesRaw(e.target.value)} placeholder="10,12,11,14,16" /></Field>
          <Field label="Steps to forecast"><input type="number" min={1} max={50} className={inputCls} value={steps} onChange={e => setSteps(Number(e.target.value))} /></Field>
        </div>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        <button onClick={run} disabled={busy || !online} className={`mt-3 ${btnPrimary}`}>{busy ? "Running…" : "Forecast"}</button>
      </section>
      {result && (
        <section className="rounded-xl border border-border bg-surface/40 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Forecast results</h2>
          <div className="mt-4 flex items-end gap-1 h-32">
            {result.forecasts.map(f => (
              <div key={f.step} className="flex flex-col items-center flex-1 gap-1">
                <div className="w-full rounded-t bg-primary-accent/60 min-h-[4px]" style={{ height: `${Math.max(4, (f.value / maxVal) * 112)}px` }} />
                <span className="text-xs text-text-secondary">t+{f.step}</span>
                <span className="text-xs font-semibold text-text-primary">{f.value.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function OptimizePanel({ online }: { online: boolean | null }) {
  const [itemsRaw, setItemsRaw] = useState('[{"id":"a","value":6,"weight":2},{"id":"b","value":10,"weight":4},{"id":"c","value":4,"weight":3},{"id":"d","value":7,"weight":3}]');
  const [capacity, setCapacity] = useState(7);
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    let items;
    try { items = JSON.parse(itemsRaw); setError(""); }
    catch { setError("Invalid JSON"); return; }
    setBusy(true);
    try { setResult(await api<OptimizeResult>("/cortex/optimize", { method: "POST", body: JSON.stringify({ items, capacity }) })); }
    catch (e: unknown) { setError(String((e as Error).message)); } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-text-secondary">0/1 Knapsack optimizer (Cortex Engine). Select the highest-value subset of items subject to a weight constraint. Used internally for context-window budget management and resource allocation.</p>
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Run optimization</h2>
        <div className="mt-3 space-y-3">
          <Field label="Items (JSON array with id, value, weight)">
            <textarea className={`${inputCls} min-h-[100px] font-mono text-xs`} value={itemsRaw} onChange={e => setItemsRaw(e.target.value)} />
          </Field>
          <Field label="Capacity (weight limit)"><input type="number" min={1} className={inputCls} style={{ maxWidth: 120 }} value={capacity} onChange={e => setCapacity(Number(e.target.value))} /></Field>
        </div>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        <button onClick={run} disabled={busy || !online} className={`mt-3 ${btnPrimary}`}>{busy ? "Optimizing…" : "Optimize"}</button>
      </section>
      {result && (
        <section className="rounded-xl border border-border bg-surface/40 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Result — total value {result.totalValue}, total weight {result.totalWeight}</h2>
          <div className="mt-3 space-y-1">
            {result.selectedItems.map(item => (
              <div key={item.id} className="flex gap-4 text-sm"><span className="font-semibold text-primary-accent">{item.id}</span><span className="text-text-secondary">value {item.value} · weight {item.weight}</span></div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

type Tab = "memory" | "forecast" | "optimize";
const TABS: [Tab, string, React.ComponentType<{ size?: number }>][] = [
  ["memory", "Memory Store", BrainCircuit],
  ["forecast", "Forecasting", TrendingUp],
  ["optimize", "Optimizer", Cpu],
];

export default function HiveMemoryPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("memory");
  useEffect(() => { void checkOnline().then(setOnline); }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Platform
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveMemory™ · Tier 3</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Persistent multi-tier agent memory with built-in forecasting and optimization</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">
        HiveMemory gives agents four tiers of persistent memory — working, episodic, semantic, and long-term — so they learn from every interaction. The Cortex Engine provides least-squares forecasting and 0/1 knapsack optimization for intelligent resource allocation and context management.
      </p>
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
      {tab === "memory" && <MemoryPanel online={online} />}
      {tab === "forecast" && <ForecastPanel online={online} />}
      {tab === "optimize" && <OptimizePanel online={online} />}
    </main>
  );
}
