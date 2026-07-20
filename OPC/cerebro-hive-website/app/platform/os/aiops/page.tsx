"use client";

import { useCallback, useEffect, useState } from "react";
import { api, checkOnline, KEY } from "../lib";
import { PillarShell } from "../PillarShell";

interface Incident { id: string; title: string; severity: string; status: string; suggestedPlaybook?: string }

export default function AIOpsPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const ok = await checkOnline();
    setOnline(ok);
    if (!ok || !KEY) return;
    try { setIncidents((await api<{ incidents: Incident[] }>("/v1/aiops/incidents")).incidents); } catch { /* noop */ }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const detectAnomalies = useCallback(async () => {
    setBusy(true);
    try {
      await api("/v1/aiops/detect", { method: "POST", body: JSON.stringify({ baselines: { error_rate_spike: -1, guard_block_spike: -1 } }) });
      setIncidents((await api<{ incidents: Incident[] }>("/v1/aiops/incidents")).incidents);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  }, []);

  return (
    <PillarShell slug="aiops" online={online}>
      <section className="rounded-xl border border-border bg-surface/40 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary">Incidents &amp; anomaly detection</h2>
          <button onClick={() => void detectAnomalies()} disabled={busy || !online || !KEY} className="rounded-lg border border-primary-accent px-4 py-2 text-sm font-semibold text-primary-accent disabled:opacity-40">{busy ? "…" : "Detect"}</button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <ul className="mt-4 space-y-2 text-sm">
          {incidents.map(i => (
            <li key={i.id} className="rounded-lg border border-border bg-background px-3 py-2">
              <span className="text-red-400">{i.severity}</span> · {i.title} · {i.status}{i.suggestedPlaybook ? ` · playbook: ${i.suggestedPlaybook}` : ""}
            </li>
          ))}
          {incidents.length === 0 && <li className="text-text-secondary">No open incidents.</li>}
        </ul>
      </section>
    </PillarShell>
  );
}
