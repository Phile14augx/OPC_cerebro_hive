"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
type Tab = "entitlements" | "seats" | "enforcement";
const ENTITLEMENTS = [
  { product: "HiveAgents™", tier: "Enterprise", seats: 25, used: 18, tokens: "10M/mo", expires: "2027-03-31", status: "active" },
  { product: "CerebroFinance™", tier: "Pro", seats: 10, used: 7, tokens: "1M/mo", expires: "2027-03-31", status: "active" },
  { product: "HiveKnowledge™", tier: "Enterprise", seats: null, used: null, tokens: "100M/mo", expires: "2027-03-31", status: "active" },
  { product: "CerebroCompliance™", tier: "Growth", seats: 5, used: 5, tokens: "500K/mo", expires: "2026-09-30", status: "expiring_soon" },
];
export default function HiveLicensePage() {
  const [tab, setTab] = useState<Tab>("entitlements");
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveLicense™ · Tier 5</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Entitlement management — seat quotas, token limits, runtime enforcement</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">HiveLicense manages every product entitlement in the organization. Seat counts and token quotas are enforced at runtime via a Redis-cached entitlement check on every API request — no billing surprises, no silent overages.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {(["entitlements","seats","enforcement"] as Tab[]).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${tab===t?"border-b-2 border-primary-accent text-primary-accent":"text-text-secondary hover:text-text-primary"}`}>{t}</button>)}
      </div>
      {tab==="entitlements" && (
        <div className="mt-6 space-y-2">
          {ENTITLEMENTS.map(e=>(
            <div key={e.product} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex items-start justify-between gap-2">
                <div><p className="font-semibold text-text-primary">{e.product}</p><p className="mt-0.5 text-xs text-text-secondary">{e.tier} · expires {e.expires}</p></div>
                <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${e.status==="active"?"border-primary-accent/40 text-primary-accent bg-primary-accent/10":"border-yellow-400/40 text-yellow-400 bg-yellow-400/10"}`}>{e.status.replace("_"," ")}</span>
              </div>
              <div className="mt-2 flex gap-4 text-xs text-text-secondary">
                {e.seats&&<span>Seats: <span className={`font-bold ${e.used===e.seats?"text-yellow-400":"text-text-primary"}`}>{e.used}/{e.seats}</span></span>}
                <span>Token quota: <span className="font-bold text-text-primary">{e.tokens}</span></span>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab==="seats" && (
        <div className="mt-6 space-y-4">
          <p className="text-xs text-text-secondary">Seat assignments are tracked per user per product. Seats auto-release after 90 days of inactivity.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[["Total licensed seats","40"],["Seats in use","30"],["Available seats","10"],["Auto-released (90d)","3"]].map(([k,v])=><div key={String(k)} className="rounded-xl border border-border bg-surface/40 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{k}</p><p className="mt-2 text-2xl font-bold text-primary-accent">{v}</p></div>)}
          </div>
        </div>
      )}
      {tab==="enforcement" && (
        <div className="mt-6 space-y-4">
          <p className="text-xs text-text-secondary">Every API request is checked against the Redis-cached entitlement table before execution. Latency overhead: &lt;1ms P99. On cache miss, the entitlement database is queried and the result is cached for 60 seconds.</p>
          {[["Check latency","< 1ms P99 (Redis cache hit)"],["Cache TTL","60 seconds"],["On seat exceeded","HTTP 402 — clear error message with upgrade link"],["On token quota exceeded","HTTP 429 — remaining quota in response header"],["Enforcement point","HiveGateway middleware, before upstream routing"]].map(([k,v])=>(
            <div key={String(k)} className="flex items-start gap-3 rounded-xl border border-border bg-surface/40 p-4"><div className="mt-0.5 h-2 w-2 rounded-full bg-primary-accent shrink-0" /><div><p className="text-xs font-semibold text-text-primary">{k}</p><p className="mt-0.5 text-xs text-text-secondary">{v}</p></div></div>
          ))}
        </div>
      )}
    </main>
  );
}
