"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api, checkOnline, KEY, type ProvisionedResource } from "../lib";

const QUICK_ITEMS: { itemId: string; label: string }[] = [
  { itemId: "postgresql", label: "PostgreSQL" },
  { itemId: "redis", label: "Redis" },
  { itemId: "qdrant", label: "Qdrant (Vector)" },
  { itemId: "opensearch", label: "OpenSearch" },
  { itemId: "object-storage", label: "Object Storage" },
  { itemId: "load-balancer", label: "Load Balancer" },
];

export default function DataConsolePage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [resources, setResources] = useState<ProvisionedResource[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const ok = await checkOnline();
    setOnline(ok);
    if (!ok || !KEY) return;
    try {
      const kinds = ["database", "storage", "network"];
      const lists = await Promise.all(kinds.map(k => api<{ resources: ProvisionedResource[] }>(`/v1/hiveforge/resources?kind=${k}`)));
      setResources(lists.flatMap(l => l.resources));
    } catch { /* noop */ }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const provision = useCallback(async (itemId: string) => {
    setBusy(itemId);
    try {
      await api("/v1/hiveforge/provision", { method: "POST", body: JSON.stringify({ itemId }) });
      await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(null); }
  }, [refresh]);

  const deprovision = useCallback(async (id: string) => {
    setBusy(id);
    try {
      await api(`/v1/hiveforge/resources/${id}/deprovision`, { method: "POST" });
      await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(null); }
  }, [refresh]);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform/hiveforge" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> HiveForge™
      </Link>
      <h1 className="mt-5 text-3xl font-bold text-text-primary md:text-4xl">Data &amp; Networking Console</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">SQL, NoSQL, cache, search, vector, graph databases; object/block/file storage; and networking primitives.</p>

      <div className="mt-5 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
        <span className="text-text-secondary">{online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}</span>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Quick provision</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_ITEMS.map(q => (
            <button
              key={q.itemId}
              onClick={() => void provision(q.itemId)}
              disabled={busy !== null || !online || !KEY}
              className="rounded-full border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40"
            >
              {busy === q.itemId ? "…" : `+ ${q.label}`}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Provisioned resources</h2>
        <div className="mt-3 space-y-2">
          {resources.map(r => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border border-border bg-surface/40 px-4 py-3">
              <div>
                <div className="text-sm font-medium text-text-primary">{r.itemName} <span className="text-xs text-text-secondary">· {r.kind}</span></div>
                <div className="text-xs text-text-secondary">{r.endpoint} · {r.region} · ${r.hourlyRateUsd.toFixed(4)}/hr</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={r.status === "running" ? "text-xs text-primary-accent" : "text-xs text-text-secondary"}>{r.status}</span>
                {r.status !== "deprovisioned" && (
                  <button onClick={() => void deprovision(r.id)} disabled={busy !== null} className="rounded border border-border px-2 py-1 text-[11px] text-text-secondary hover:border-red-400 hover:text-red-400 disabled:opacity-40">Deprovision</button>
                )}
              </div>
            </div>
          ))}
          {resources.length === 0 && <p className="text-sm text-text-secondary">No data or network resources provisioned yet.</p>}
        </div>
      </section>
    </main>
  );
}
