"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api, checkOnline, KEY, type CatalogCategory, type CatalogItem, type MarketplaceInstallation } from "../lib";
import { HiveForgeWizard } from "../HiveForgeWizard";

export default function MarketplacePage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [category, setCategory] = useState<CatalogCategory | null>(null);
  const [installations, setInstallations] = useState<MarketplaceInstallation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [wizardItem, setWizardItem] = useState<CatalogItem | null>(null);

  const refresh = useCallback(async () => {
    const ok = await checkOnline();
    setOnline(ok);
    if (!ok || !KEY) return;
    try {
      const res = await api<{ categories: CatalogCategory[] }>("/v1/hiveforge/catalog?category=marketplace");
      setCategory(res.categories[0] ?? null);
      setInstallations((await api<{ installations: MarketplaceInstallation[] }>("/v1/hiveforge/installations")).installations);
    } catch { /* noop */ }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform/hiveforge" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> HiveForge™
      </Link>
      <h1 className="mt-5 text-3xl font-bold text-text-primary md:text-4xl">Marketplace</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">Models, agents, prompt packs, workflows, dashboards, templates, SDKs, extensions, connectors, and industry packs.</p>

      <div className="mt-5 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
        <span className="text-text-secondary">{online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}</span>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Browse</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {category?.subgroups.flatMap(sg => sg.items).map(item => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border border-border bg-surface/40 px-3 py-2.5">
              <div className="text-sm font-medium text-text-primary">{item.name}</div>
              <button
                onClick={() => setWizardItem(item)}
                disabled={!online || !KEY}
                className="rounded-lg border border-primary-accent px-2.5 py-1 text-xs font-semibold text-primary-accent disabled:opacity-40"
              >
                Install…
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Installed</h2>
        <ul className="mt-3 space-y-1.5 text-sm">
          {installations.map(i => (
            <li key={i.id} className="rounded-lg border border-border bg-background px-3 py-2">{i.itemName} <span className="text-xs text-text-secondary">· installed {new Date(i.installedAt).toLocaleString()}</span></li>
          ))}
          {installations.length === 0 && <li className="text-text-secondary">No marketplace items installed yet.</li>}
        </ul>
      </section>

      {wizardItem && (
        <HiveForgeWizard
          item={wizardItem}
          mode="install"
          onClose={() => setWizardItem(null)}
          onDone={refresh}
        />
      )}
    </main>
  );
}
