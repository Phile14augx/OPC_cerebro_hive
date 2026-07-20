"use client";

import { useCallback, useEffect, useState } from "react";
import { api, checkOnline, KEY } from "../lib";
import { PillarShell } from "../PillarShell";

interface RoutingDecision { id: string; intent: string; complexity: number; privacyTier: string; selectedModel: string; rationale: string; predictedCostUsd: number; predictedLatencyMs: number }
interface ModelProfile { id: string; family: string; quality: number; local: boolean }

export default function RouterPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [text, setText] = useState("Write a Kubernetes deployment manifest and explain the rollout strategy.");
  const [decision, setDecision] = useState<RoutingDecision | null>(null);
  const [catalog, setCatalog] = useState<ModelProfile[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const ok = await checkOnline();
    setOnline(ok);
    if (!ok || !KEY) return;
    try { setCatalog((await api<{ models: ModelProfile[] }>("/v1/router/catalog")).models); } catch { /* noop */ }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const routeText = useCallback(async () => {
    setBusy(true); setError(null);
    try { setDecision(await api<RoutingDecision>("/v1/router/route", { method: "POST", body: JSON.stringify({ text }) })); }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  }, [text]);

  return (
    <PillarShell slug="router" online={online}>
      <section className="rounded-xl border border-border bg-surface/40 p-6">
        <p className="text-sm text-text-secondary">Every request passes through intent detection → complexity estimation → cost/latency prediction → privacy classification → model selection, across a catalog of {catalog.length || "14"} models.</p>
        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <input value={text} onChange={e => setText(e.target.value)} className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm text-text-primary outline-none focus:border-primary-accent" placeholder="Describe a request to route…" />
          <button onClick={() => void routeText()} disabled={busy || !online || !KEY} className="rounded-lg bg-primary-accent px-6 py-3 text-sm font-semibold text-background disabled:opacity-40">{busy ? "Routing…" : "Route"}</button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        {decision && (
          <div className="mt-4 rounded-lg border border-border bg-background p-4 text-sm">
            <div className="text-text-primary">intent=<span className="text-primary-accent">{decision.intent}</span> · complexity={decision.complexity} · privacy=<span className="text-primary-accent">{decision.privacyTier}</span></div>
            <div className="mt-1 text-text-primary">Selected: <span className="font-semibold">{decision.selectedModel}</span> — ~${decision.predictedCostUsd.toFixed(4)} / ~{decision.predictedLatencyMs}ms</div>
            <p className="mt-1 text-xs text-text-secondary">{decision.rationale}</p>
          </div>
        )}
      </section>
    </PillarShell>
  );
}
