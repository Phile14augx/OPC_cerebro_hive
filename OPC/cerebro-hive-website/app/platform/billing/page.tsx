"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
type Tab = "usage" | "invoices" | "plans";
const USAGE = [
  { metric: "Agent runs", unit: "runs", consumed: 24891, limit: 50000, cost: 1244.55 },
  { metric: "LLM tokens", unit: "M tokens", consumed: 182.4, limit: 500, cost: 2736.00 },
  { metric: "Vector searches", unit: "K searches", consumed: 48.2, limit: 200, cost: 240.00 },
  { metric: "Storage", unit: "GB", consumed: 87.3, limit: 500, cost: 87.30 },
  { metric: "Knowledge documents", unit: "docs", consumed: 842, limit: 5000, cost: 42.10 },
];
const INVOICES = [
  { id: "INV-2026-07", period: "Jul 2026", amount: 4349.95, status: "pending", due: "2026-08-15" },
  { id: "INV-2026-06", period: "Jun 2026", amount: 3982.40, status: "paid", due: "2026-07-15" },
  { id: "INV-2026-05", period: "May 2026", amount: 4112.20, status: "paid", due: "2026-06-15" },
];
export default function HiveBillingPage() {
  const [tab, setTab] = useState<Tab>("usage");
  const totalCost = USAGE.reduce((s, u) => s + u.cost, 0);
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveBilling™ · Tier 5</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Usage metering & billing — real-time consumption, rating engine, invoicing</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">HiveBilling meters every billable platform event via Kafka, rates usage through a configurable pricing engine, and generates compliant invoices with revenue recognition in accordance with ASC 606.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {(["usage","invoices","plans"] as Tab[]).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${tab===t?"border-b-2 border-primary-accent text-primary-accent":"text-text-secondary hover:text-text-primary"}`}>{t}</button>)}
      </div>
      {tab==="usage" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-primary-accent/30 bg-primary-accent/5 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Estimated charges this period</p><p className="mt-2 text-3xl font-bold text-primary-accent">${totalCost.toLocaleString("en-US",{minimumFractionDigits:2})}</p></div>
          <div className="space-y-3">
            {USAGE.map(u=>(
              <div key={u.metric} className="rounded-xl border border-border bg-surface/40 p-4">
                <div className="flex items-center justify-between gap-2 mb-2"><span className="font-semibold text-text-primary">{u.metric}</span><span className="font-bold text-primary-accent">${u.cost.toLocaleString("en-US",{minimumFractionDigits:2})}</span></div>
                <div className="h-2 w-full rounded-full bg-surface-elevated/40"><div className="h-2 rounded-full bg-primary-accent" style={{width:`${Math.min(100,u.consumed/u.limit*100)}%`}} /></div>
                <p className="mt-1 text-xs text-text-secondary">{u.consumed.toLocaleString()} / {u.limit.toLocaleString()} {u.unit} ({(u.consumed/u.limit*100).toFixed(1)}%)</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==="invoices" && (
        <div className="mt-6 space-y-2">
          {INVOICES.map(inv=>(
            <div key={inv.id} className="flex items-center justify-between rounded-xl border border-border bg-surface/40 p-4">
              <div><p className="font-semibold text-text-primary">{inv.period}</p><p className="mt-0.5 text-xs text-text-secondary">{inv.id} · Due {inv.due}</p></div>
              <div className="flex items-center gap-3"><p className="font-bold text-text-primary">${inv.amount.toLocaleString("en-US",{minimumFractionDigits:2})}</p><span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${inv.status==="paid"?"border-primary-accent/40 text-primary-accent bg-primary-accent/10":"border-yellow-400/40 text-yellow-400 bg-yellow-400/10"}`}>{inv.status}</span></div>
            </div>
          ))}
        </div>
      )}
      {tab==="plans" && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[{name:"Starter",price:"$499/mo",features:["10K agent runs","50M tokens","50GB storage","Community support"]},
            {name:"Growth",price:"$1,999/mo",features:["50K agent runs","500M tokens","500GB storage","Priority support","Custom domains"],current:true},
            {name:"Enterprise",price:"Custom",features:["Unlimited runs","Custom token pool","Unlimited storage","Dedicated CSM","SLA 99.99%","Data residency"]}
          ].map(p=>(
            <div key={p.name} className={`rounded-2xl border p-5 ${(p as {current?:boolean}).current?"border-primary-accent/50 bg-primary-accent/5":"border-border bg-surface/40"}`}>
              <div className="flex items-center justify-between gap-2"><p className="font-bold text-text-primary">{p.name}</p>{(p as {current?:boolean}).current&&<span className="rounded-full border border-primary-accent/40 bg-primary-accent/10 px-2 py-0.5 text-xs font-bold text-primary-accent">Current</span>}</div>
              <p className="mt-1 text-lg font-bold text-primary-accent">{p.price}</p>
              <ul className="mt-3 space-y-1">{p.features.map(f=><li key={f} className="flex items-center gap-1.5 text-xs text-text-secondary"><span className="text-primary-accent">✓</span>{f}</li>)}</ul>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
