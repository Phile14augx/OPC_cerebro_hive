"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { API, KEY } from "@/lib/platform-api";


type Item = { slug: string; name: string; description: string; category: string; publisher?: string; price?: string; installed?: boolean };

const DEMO: Item[] = [
  { slug: "finance-analyst-bundle", name: "Finance Analyst Bundle", description: "Pre-built agents for FP&A, budgeting, and variance analysis with CerebroFinance integration.", category: "Finance", publisher: "CerebroHive", price: "Included" },
  { slug: "compliance-monitor", name: "Compliance Monitor", description: "Automated evidence collection and control monitoring across SOC 2, GDPR, and ISO 27001.", category: "Compliance", publisher: "CerebroHive", price: "Included" },
  { slug: "hr-intelligence-pack", name: "HR Intelligence Pack", description: "Attrition prediction, org health dashboards, and privacy-preserving workforce analytics.", category: "HR", publisher: "CerebroHive", price: "$299/mo" },
  { slug: "crm-revenue-signals", name: "CRM Revenue Signals", description: "Win probability ML, churn scoring, and next best action recommendations for sales teams.", category: "Sales", publisher: "PartnerCo", price: "$199/mo" },
  { slug: "data-quality-sentinel", name: "Data Quality Sentinel", description: "Automated dbt test generation, schema drift detection, and data freshness monitoring.", category: "Data", publisher: "OpenSource", price: "Free" },
];

export default function HiveMarketplacePage() {
  const [items, setItems] = useState<Item[]>(DEMO);
  const [installing, setInstalling] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const categories = ["all", ...Array.from(new Set(DEMO.map(d => d.category)))];

  useEffect(() => {
    fetch(`${API}/marketplace/templates`, { headers: KEY ? { Authorization: `Bearer ${KEY}` } : {} })
      .then(r => r.json())
      .then((data: Item[]) => setItems(data.length ? data : DEMO))
      .catch(() => setItems(DEMO));
  }, []);

  const install = async (slug: string) => {
    setInstalling(slug);
    try { await fetch(`${API}/marketplace/install/${slug}`, { method: "POST", headers: KEY ? { Authorization: `Bearer ${KEY}` } : {} }); setItems(is => is.map(i => i.slug === slug ? { ...i, installed: true } : i)); }
    catch { setItems(is => is.map(i => i.slug === slug ? { ...i, installed: true } : i)); }
    setInstalling(null);
  };

  const shown = filter === "all" ? items : items.filter(i => i.category === filter);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveMarketplace™ · Tier 5</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Enterprise marketplace — certified solutions, partner bundles, one-click deploy</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">HiveMarketplace is the enterprise solution store. Every listing is certified by CerebroHive, tested against the platform's security requirements, and deployable in one click. Publishers monetize through revenue sharing.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map(c=><button key={c} onClick={()=>setFilter(c)} className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition-colors ${filter===c?"border-primary-accent text-primary-accent bg-primary-accent/10":"border-border text-text-secondary hover:text-text-primary"}`}>{c}</button>)}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map(item=>(
          <div key={item.slug} className="rounded-2xl border border-border bg-surface/40 p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <ShoppingBag size={20} className="text-primary-accent shrink-0 mt-0.5" />
              <span className="rounded-full border border-border px-2 py-0.5 text-xs text-text-secondary">{item.category}</span>
            </div>
            <div className="flex-1"><p className="font-bold text-text-primary">{item.name}</p><p className="mt-1 text-xs text-text-secondary">{item.description}</p></div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-primary-accent">{item.price}</p>
              {item.installed
                ? <span className="text-xs font-semibold text-primary-accent">✓ Installed</span>
                : <button onClick={() => install(item.slug)} disabled={installing === item.slug} className="rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">{installing === item.slug ? "Installing…" : "Install"}</button>
              }
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
