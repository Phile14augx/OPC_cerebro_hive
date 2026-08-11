"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api, checkOnline, KEY, type CatalogCategory, type CatalogItem, type ProvisionedResource } from "../lib";
import { HiveForgeWizard } from "../HiveForgeWizard";

const QUICK_ITEM_IDS = ["shared-vps", "enterprise-vps", "nvidia-l4", "nvidia-h100", "managed-kubernetes", "serverless-functions"];
const CATEGORIES = ["cloud-compute", "kubernetes", "containers", "serverless"];

export default function ComputeConsolePage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [resources, setResources] = useState<ProvisionedResource[]>([]);
  const [items, setItems] = useState<Record<string, CatalogItem>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wizardItem, setWizardItem] = useState<CatalogItem | null>(null);

  const refresh = useCallback(async () => {
    const ok = await checkOnline();
    setOnline(ok);
    if (!ok || !KEY) return;
    try {
      const kinds = ["vps", "gpu", "kubernetes", "container", "serverless"];
      const [lists, catRes] = await Promise.all([
        Promise.all(kinds.map(k => api<{ resources: ProvisionedResource[] }>(`/v1/hiveforge/resources?kind=${k}`))),
        Promise.all(CATEGORIES.map(c => api<{ categories: CatalogCategory[] }>(`/v1/hiveforge/catalog?category=${c}`))),
      ]);
      setResources(lists.flatMap(l => l.resources));
      const map: Record<string, CatalogItem> = {};
      for (const res of catRes) for (const cat of res.categories) for (const sg of cat.subgroups) for (const item of sg.items) map[item.id] = item;
      setItems(map);
    } catch { /* noop */ }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const deprovision = useCallback(async (id: string) => {
    setBusy(id);
    try {
      await api(`/v1/hiveforge/resources/${id}/deprovision`, { method: "POST" });
      await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(null); }
  }, [refresh]);

  const quickItems = QUICK_ITEM_IDS.map(id => items[id]).filter((x): x is CatalogItem => !!x);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform/hiveforge" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> HiveForge™
      </Link>
      <h1 className="mt-5 text-3xl font-bold text-text-primary md:text-4xl">Cloud Compute Console</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">VPS, GPU, Kubernetes, containers, and serverless — the full compute portfolio, provisioned on demand via a guided setup wizard.</p>

      <div className="mt-5 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
        <span className="text-text-secondary">{online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}</span>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Quick provision</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {quickItems.map(item => (
            <button
              key={item.id}
              onClick={() => setWizardItem(item)}
              disabled={!online || !KEY}
              className="rounded-full border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40"
            >
              + {item.name}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-text-secondary">Or browse the full <Link href="/platform/hiveforge/catalog/cloud-compute" className="underline hover:text-primary-accent">Cloud Compute</Link>, <Link href="/platform/hiveforge/catalog/kubernetes" className="underline hover:text-primary-accent">Kubernetes</Link>, <Link href="/platform/hiveforge/catalog/containers" className="underline hover:text-primary-accent">Containers</Link>, or <Link href="/platform/hiveforge/catalog/serverless" className="underline hover:text-primary-accent">Serverless</Link> catalogs for every line item.</p>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Provisioned resources</h2>
        <div className="mt-3 space-y-2">
          {resources.map(r => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border border-border bg-surface/40 px-4 py-3">
              <div>
                <div className="text-sm font-medium text-text-primary">{r.itemName} <span className="text-xs text-text-secondary">· {r.kind} · {r.sizeTier}</span></div>
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
          {resources.length === 0 && <p className="text-sm text-text-secondary">No compute resources provisioned yet.</p>}
        </div>
      </section>

      {wizardItem && (
        <HiveForgeWizard
          item={wizardItem}
          mode="provision"
          onClose={() => setWizardItem(null)}
          onDone={refresh}
        />
      )}
    </main>
  );
}
