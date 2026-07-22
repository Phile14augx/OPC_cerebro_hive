"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Activity, Route } from "lucide-react";
import { api, checkOnline, KEY, type ObservatoryOverview, type ModelProfile, type RoutingDecision } from "./lib";

type Tab = "observability" | "router";

const inputCls = "rounded-md border border-border bg-surface-elevated/40 px-2.5 py-1.5 text-sm text-text-primary";

function ObservabilityPanel({ online }: { online: boolean | null }) {
  const [overview, setOverview] = useState<ObservatoryOverview | null>(null);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setOverview(await api<ObservatoryOverview>("/v1/observatory/overview")); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const id = setInterval(() => void refresh(), 5000); return () => clearInterval(id); }, [refresh]);

  if (!overview) return <p className="mt-6 text-sm text-text-secondary">{online ? "Loading observability data…" : "Waiting for platform…"}</p>;

  return (
    <div className="mt-6 space-y-6">
      <section className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface/40 p-3 text-xs"><div className="text-text-secondary">AI calls</div><div className="mt-1 text-lg font-semibold text-text-primary">{overview.cost.calls}</div></div>
        <div className="rounded-xl border border-border bg-surface/40 p-3 text-xs"><div className="text-text-secondary">AI cost</div><div className="mt-1 text-lg font-semibold text-text-primary">${overview.cost.costUsd.toFixed(4)}</div></div>
        <div className="rounded-xl border border-border bg-surface/40 p-3 text-xs"><div className="text-text-secondary">Tokens (prompt/completion)</div><div className="mt-1 text-lg font-semibold text-text-primary">{overview.cost.promptTokens}/{overview.cost.completionTokens}</div></div>
        <div className="rounded-xl border border-border bg-surface/40 p-3 text-xs"><div className="text-text-secondary">Executions</div><div className="mt-1 text-lg font-semibold text-text-primary">{overview.executions.total}</div></div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Executions by status</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(overview.executions.byStatus).map(([k, v]) => (
            <span key={k} className="rounded-full border border-border bg-surface/40 px-3 py-1 text-xs text-text-secondary">{k}: <span className="font-semibold text-text-primary">{v}</span></span>
          ))}
          {Object.keys(overview.executions.byStatus).length === 0 && <p className="text-sm text-text-secondary">No executions yet.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Recent trace spans ({overview.spans.length})</h2>
        <div className="mt-3 space-y-2">
          {overview.spans.map((s, i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface/40 p-3 text-xs">
              <span className="text-text-primary font-semibold">{s.name}</span>
              <span className="text-text-secondary">{s.durationMs}ms · {s.status} · {s.traceId.slice(0, 12)}…</span>
            </div>
          ))}
          {overview.spans.length === 0 && <p className="text-sm text-text-secondary">No trace spans recorded yet.</p>}
        </div>
      </section>
    </div>
  );
}

function RouterPanel({ online }: { online: boolean | null }) {
  const [catalog, setCatalog] = useState<ModelProfile[]>([]);
  const [history, setHistory] = useState<RoutingDecision[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [lastDecision, setLastDecision] = useState<RoutingDecision | null>(null);

  const refresh = useCallback(async () => {
    if (!online || !KEY) return;
    try { setCatalog((await api<{ models: ModelProfile[] }>("/v1/router/catalog")).models); } catch { /* noop */ }
    try { setHistory((await api<{ decisions: RoutingDecision[] }>("/v1/router/history")).decisions); } catch { /* noop */ }
  }, [online]);
  useEffect(() => { void refresh(); const id = setInterval(() => void refresh(), 8000); return () => clearInterval(id); }, [refresh]);

  const route = async () => {
    if (!text.trim() || !online) return;
    setBusy(true);
    try { setLastDecision(await api<RoutingDecision>("/v1/router/route", { method: "POST", body: JSON.stringify({ text }) })); await refresh(); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Model catalog ({catalog.length})</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {catalog.map(m => (
            <div key={m.id} className="rounded-lg border border-border bg-surface-elevated/40 px-3 py-2 text-xs">
              <div className="font-semibold text-text-primary">{m.id} <span className="text-text-secondary">· {m.family}</span></div>
              <p className="mt-0.5 text-text-secondary">quality {m.quality} · ${m.costPer1kIn}/${m.costPer1kOut} per 1k in/out · strengths: {m.strengths.join(", ")}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Test the router</h2>
        <div className="mt-3 flex gap-3">
          <input className={`${inputCls} flex-1`} value={text} onChange={e => setText(e.target.value)} placeholder="Write a Python function to parse CSV files" />
          <button onClick={route} disabled={busy || !online} className="rounded-md border border-primary-accent px-4 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40 shrink-0">Route</button>
        </div>
        {lastDecision && (
          <div className="mt-3 rounded-lg border border-border bg-surface-elevated/40 p-3 text-xs text-text-secondary">
            <p><span className="font-semibold text-text-primary">{lastDecision.selectedModel}</span> selected — intent: {lastDecision.intent}, complexity: {lastDecision.complexity.toFixed(2)}</p>
            <p className="mt-1">{lastDecision.rationale}</p>
            <p className="mt-1">Est. cost ${lastDecision.predictedCostUsd.toFixed(4)} · ~{lastDecision.predictedLatencyMs}ms · ~{lastDecision.estimatedTokens} tokens</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Routing history ({history.length})</h2>
        <div className="mt-3 space-y-2">
          {history.map(d => (
            <div key={d.id} className="rounded-xl border border-border bg-surface/40 p-3 text-xs">
              <span className="font-semibold text-text-primary">{d.selectedModel}</span> <span className="text-text-secondary">— {d.intent}, complexity {d.complexity.toFixed(2)}, ${d.predictedCostUsd.toFixed(4)}</span>
            </div>
          ))}
          {history.length === 0 && <p className="text-sm text-text-secondary">No routing decisions yet.</p>}
        </div>
      </section>
    </div>
  );
}

const TABS: [Tab, string, React.ComponentType<{ size?: number; className?: string }>][] = [
  ["observability", "Observability", Activity],
  ["router", "Model Router", Route],
];

export default function CerebroXPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("observability");

  useEffect(() => { void checkOnline().then(setOnline); }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Platform
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">Cerebro X™</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">The AI gateway: model routing, cost, and observability in one place</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">
        Cerebro X is the console over the platform&apos;s Observatory and Cerebro Router: live AI call cost and
        token telemetry, execution status breakdowns, trace spans, the full model catalog, and a live router
        tester that shows exactly which model gets selected for a prompt and why.
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

      {tab === "observability" && <ObservabilityPanel online={online} />}
      {tab === "router" && <RouterPanel online={online} />}
    </main>
  );
}
