"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, checkOnline, KEY, hiveForgeSections, catalogCategoryIndex, type CostExplorer } from "./lib";

export default function HiveForgePage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [cost, setCost] = useState<CostExplorer | null>(null);

  const refresh = useCallback(async () => {
    const ok = await checkOnline();
    setOnline(ok);
    if (!ok || !KEY) return;
    try { setCost(await api<CostExplorer>("/v1/hiveforge/billing/cost-explorer")); } catch { /* noop */ }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveForge™ — Enterprise AI Cloud Marketplace</p>
      <h1 className="mt-3 text-4xl font-bold text-text-primary md:text-5xl">Build, Deploy, Run, Secure, and Scale AI.</h1>
      <p className="mt-4 max-w-2xl text-text-secondary">
        A unified AI-native control plane spanning compute (VPS, GPU, Kubernetes, serverless), data (databases,
        storage, networking), DevOps, security, AI governance, and a marketplace of models, agents, and templates —
        24 product categories, all provisionable from this console against the real platform.
      </p>

      <div className="mt-6 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
        <span className="text-text-secondary">{online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}</span>
      </div>

      {cost && (
        <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-surface/60 px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-text-secondary">Active resources</div>
            <div className="mt-1 text-2xl font-semibold text-text-primary">{cost.resourceCount}</div>
          </div>
          <div className="rounded-lg border border-border bg-surface/60 px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-text-secondary">Accrued cost</div>
            <div className="mt-1 text-2xl font-semibold text-text-primary">${cost.totalUsd.toFixed(2)}</div>
          </div>
          <div className="rounded-lg border border-border bg-surface/60 px-4 py-3 col-span-2">
            <div className="text-xs uppercase tracking-wider text-text-secondary">By kind</div>
            <div className="mt-1 text-sm text-text-primary">{Object.entries(cost.byKind).map(([k, v]) => `${k}: $${v.toFixed(2)}`).join(" · ") || "—"}</div>
          </div>
        </section>
      )}

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-text-primary">Consoles</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {hiveForgeSections.map(s => (
            <Link key={s.id} href={s.href} className="rounded-xl border border-border bg-surface/40 p-4 transition-colors hover:border-primary-accent">
              <div className="font-semibold text-text-primary">{s.name}</div>
              <p className="mt-1 text-xs text-text-secondary">{s.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-text-primary">Complete Product Catalog</h2>
        <p className="mt-1 text-sm text-text-secondary">24 categories. Click through to browse every product and provision what&apos;s live.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {catalogCategoryIndex.map(c => (
            <Link key={c.id} href={`/platform/hiveforge/catalog/${c.id}`} className="rounded-xl border border-border bg-surface/40 p-4 transition-colors hover:border-primary-accent">
              <div className="font-semibold text-text-primary">{c.name}</div>
              <p className="mt-1 text-xs text-text-secondary">{c.tagline}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
