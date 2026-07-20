"use client";

import { useCallback, useEffect, useState } from "react";
import { api, checkOnline, KEY } from "../lib";
import { PillarShell } from "../PillarShell";

interface TwinRun { id: string; kind: string; result: Record<string, unknown> & { recommendation?: string } }

export default function DigitalTwinPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [runs, setRuns] = useState<TwinRun[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const ok = await checkOnline();
    setOnline(ok);
    if (!ok || !KEY) return;
    try { setRuns((await api<{ runs: TwinRun[] }>("/v1/digitaltwin/runs")).runs); } catch { /* noop */ }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const runSupplyChainTwin = useCallback(async () => {
    setBusy(true);
    try {
      await api("/v1/digitaltwin/supply-chain", { method: "POST", body: JSON.stringify({ suppliers: 25, disruptionProbability: 0.25, avgLeadTimeDays: 21 }) });
      setRuns((await api<{ runs: TwinRun[] }>("/v1/digitaltwin/runs")).runs);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  }, []);

  const runCyberTwin = useCallback(async () => {
    setBusy(true);
    try {
      await api("/v1/digitaltwin/cyber-attack", { method: "POST", body: JSON.stringify({ attackVector: "phishing", assetCriticality: "high", mttdHours: 6, mttrHours: 10 }) });
      setRuns((await api<{ runs: TwinRun[] }>("/v1/digitaltwin/runs")).runs);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  }, []);

  return (
    <PillarShell slug="digital-twin" online={online}>
      <section className="rounded-xl border border-border bg-surface/40 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary">Named enterprise scenarios</h2>
          <div className="flex gap-2">
            <button onClick={() => void runSupplyChainTwin()} disabled={busy || !online || !KEY} className="rounded-lg border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">Supply chain</button>
            <button onClick={() => void runCyberTwin()} disabled={busy || !online || !KEY} className="rounded-lg border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">Cyber attack</button>
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <ul className="mt-4 space-y-1.5 text-sm">
          {runs.map(r => (
            <li key={r.id} className="rounded-lg border border-border bg-background px-3 py-2">
              <span className="text-primary-accent">{r.kind.replace(/_/g, " ")}</span>{r.result.recommendation ? `: ${r.result.recommendation}` : ""}
            </li>
          ))}
          {runs.length === 0 && <li className="text-text-secondary">No scenarios simulated yet.</li>}
        </ul>
      </section>
    </PillarShell>
  );
}
