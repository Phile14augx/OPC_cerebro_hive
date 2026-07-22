"use client";

import { useCallback, useEffect, useState } from "react";
import { api, checkOnline, KEY } from "../lib";
import { PillarShell } from "../PillarShell";

interface DataAsset { id: string; name: string; kind: string; freshnessSlaMinutes: number }

export default function DataPlatformPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [assets, setAssets] = useState<DataAsset[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const ok = await checkOnline();
    setOnline(ok);
    if (!ok || !KEY) return;
    try { setAssets((await api<{ assets: DataAsset[] }>("/v1/dataplatform/assets")).assets); } catch { /* noop */ }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const registerDataAsset = useCallback(async () => {
    setBusy(true);
    try {
      await api("/v1/dataplatform/assets", { method: "POST", body: JSON.stringify({ name: `dataset_${Math.random().toString(16).slice(2, 6)}`, kind: "table", owner: "data-eng", freshnessSlaMinutes: 60 }) });
      setAssets((await api<{ assets: DataAsset[] }>("/v1/dataplatform/assets")).assets);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  }, []);

  return (
    <PillarShell slug="data-platform" online={online}>
      <section className="rounded-xl border border-border bg-surface/40 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary">Governed asset catalog</h2>
          <button onClick={() => void registerDataAsset()} disabled={busy || !online || !KEY} className="rounded-lg border border-primary-accent px-4 py-2 text-sm font-semibold text-primary-accent disabled:opacity-40">Register asset</button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <ul className="mt-4 space-y-1.5 text-sm">
          {assets.map(a => (
            <li key={a.id} className="rounded-lg border border-border bg-background px-3 py-2">{a.name} · {a.kind} · SLA {a.freshnessSlaMinutes}m</li>
          ))}
          {assets.length === 0 && <li className="text-text-secondary">No data assets registered yet.</li>}
        </ul>
      </section>
    </PillarShell>
  );
}
