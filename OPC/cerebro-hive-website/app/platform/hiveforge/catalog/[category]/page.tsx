"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api, checkOnline, KEY, type CatalogCategory } from "../../lib";

export default function CatalogCategoryPage() {
  const params = useParams<{ category: string }>();
  const categoryId = params.category;
  const [online, setOnline] = useState<boolean | null>(null);
  const [category, setCategory] = useState<CatalogCategory | null>(null);
  const [busyItem, setBusyItem] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const ok = await checkOnline();
    setOnline(ok);
    if (!ok || !KEY) return;
    try {
      const res = await api<{ categories: CatalogCategory[] }>(`/v1/hiveforge/catalog?category=${categoryId}`);
      setCategory(res.categories[0] ?? null);
    } catch { /* noop */ }
  }, [categoryId]);

  useEffect(() => { void refresh(); }, [refresh]);

  const provision = useCallback(async (itemId: string) => {
    setBusyItem(itemId); setMessage(null);
    try {
      const resource = await api<{ id: string; endpoint: string }>("/v1/hiveforge/provision", { method: "POST", body: JSON.stringify({ itemId }) });
      setMessage(`Provisioned ${itemId} → ${resource.endpoint}`);
    } catch (err) { setMessage(err instanceof Error ? err.message : String(err)); }
    finally { setBusyItem(null); }
  }, []);

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

      <div className="mt-5 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
        <span className="text-text-secondary">{online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}</span>
      </div>

      {message && <p className="mt-4 rounded-lg border border-border bg-surface/60 px-4 py-2 text-sm text-text-primary">{message}</p>}

      <div className="mt-8 space-y-8">
        {category?.subgroups.map(sg => (
          <section key={sg.name}>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">{sg.name}</h2>
            <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {sg.items.map(item => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-border bg-surface/40 px-3 py-2.5">
                  <div>
                    <div className="text-sm font-medium text-text-primary">{item.name}</div>
                    {item.provisionable && <div className="text-xs text-text-secondary">${item.hourlyRateUsd?.toFixed(4)}/hr</div>}
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
