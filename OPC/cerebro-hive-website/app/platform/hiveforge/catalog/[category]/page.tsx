"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api, checkOnline, KEY, type CatalogCategory, type ProvisionedResource } from "../../lib";

export default function CatalogCategoryPage() {
  const params = useParams<{ category: string }>();
  const categoryId = params.category;
  const [online, setOnline] = useState<boolean | null>(null);
  const [category, setCategory] = useState<CatalogCategory | null>(null);
  const [resources, setResources] = useState<ProvisionedResource[]>([]);
  const [busyItem, setBusyItem] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const ok = await checkOnline();
    setOnline(ok);
    if (!ok || !KEY) return;
    try {
      const [catRes, resRes] = await Promise.all([
        api<{ categories: CatalogCategory[] }>(`/v1/hiveforge/catalog?category=${categoryId}`),
        api<{ resources: ProvisionedResource[] }>(`/v1/hiveforge/resources?category=${categoryId}`),
      ]);
      setCategory(catRes.categories[0] ?? null);
      setResources(resRes.resources);
    } catch { /* noop */ }
  }, [categoryId]);

  useEffect(() => { void refresh(); }, [refresh]);

  const provision = useCallback(async (itemId: string) => {
    setBusyItem(itemId); setMessage(null);
    try {
      const resource = await api<{ id: string; endpoint: string }>("/v1/hiveforge/provision", { method: "POST", body: JSON.stringify({ itemId }) });
      setMessage(`Provisioned ${itemId} → ${resource.endpoint}`);
      await refresh();
    } catch (err) { setMessage(err instanceof Error ? err.message : String(err)); }
    finally { setBusyItem(null); }
  }, [refresh]);

  const deprovision = useCallback(async (id: string) => {
    setBusyItem(id);
    try {
      await api(`/v1/hiveforge/resources/${id}/deprovision`, { method: "POST" });
      await refresh();
    } catch (err) { setMessage(err instanceof Error ? err.message : String(err)); }
    finally { setBusyItem(null); }
  }, [refresh]);

  const running = resources.filter(r => r.status !== "deprovisioned");
  const provisionableCount = category?.subgroups.reduce((n, sg) => n + sg.items.filter(i => i.provisionable).length, 0) ?? 0;

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform/hiveforge" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> HiveForge™
      </Link>

      {category ? (
        <>
          <h1 className="mt-5 text-3xl font-bold text-text-primary md:text-4xl">{category.name}</h1>
          <p className="mt-3 max-w-2xl text-text-secondary">{category.tagline}</p>
        </>
      ) : (
        <h1 className="mt-5 text-3xl font-bold text-text-primary md:text-4xl">{categoryId}</h1>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
          <span className="text-text-secondary">{online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}</span>
        </div>
        {category && <span className="text-text-secondary">{provisionableCount} provisionable items · {running.length} active</span>}
      </div>

      {message && <p className="mt-4 rounded-lg border border-border bg-surface/60 px-4 py-2 text-sm text-text-primary">{message}</p>}

      {running.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Active in this category</h2>
          <div className="mt-3 space-y-2">
            {running.map(r => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-border bg-surface/40 px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-text-primary">{r.itemName} <span className="text-xs text-text-secondary">· {r.subgroup}</span></div>
                  <div className="text-xs text-text-secondary">{r.endpoint} · {r.region} · ${r.hourlyRateUsd.toFixed(4)}/hr</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-primary-accent">{r.status}</span>
                  <button onClick={() => void deprovision(r.id)} disabled={busyItem !== null} className="rounded border border-border px-2 py-1 text-[11px] text-text-secondary hover:border-red-400 hover:text-red-400 disabled:opacity-40">
                    {busyItem === r.id ? "…" : "Deprovision"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 space-y-8">
        {category?.subgroups.map(sg => (
          <section key={sg.name}>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">{sg.name}</h2>
            <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {sg.items.map(item => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-border bg-surface/40 px-3 py-2.5">
                  <div>
                    <div className="text-sm font-medium text-text-primary">{item.name}</div>
                    {item.provisionable && (
                      <div className="text-xs text-text-secondary">
                        {item.hourlyRateUsd ? `$${item.hourlyRateUsd.toFixed(4)}/hr` : "Included"}
                      </div>
                    )}
                  </div>
                  {item.provisionable && (
                    <button
                      onClick={() => void provision(item.id)}
                      disabled={busyItem !== null || !online || !KEY}
                      className="rounded-lg border border-primary-accent px-2.5 py-1 text-xs font-semibold text-primary-accent disabled:opacity-40"
                    >
                      {busyItem === item.id ? "…" : "Provision"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
        {!category && online && <p className="text-text-secondary">Loading catalog…</p>}
      </div>
    </main>
  );
}
