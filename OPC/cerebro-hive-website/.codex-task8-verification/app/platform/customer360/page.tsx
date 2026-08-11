"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
type Tab = "profiles" | "identity" | "segments";
const PROFILES = [
  { id: "c1", name: "Meridian Financial", type: "enterprise", ltv: 2400000, touchpoints: 847, lastSeen: "2 hours ago", idConfidence: 98, channels: ["email","web","support","sales"] },
  { id: "c2", name: "Vantage Health", type: "enterprise", ltv: 380000, touchpoints: 312, lastSeen: "1 day ago", idConfidence: 94, channels: ["web","support","product"] },
  { id: "c3", name: "Dev - maria@techcorp.io", type: "individual", ltv: 4800, touchpoints: 124, lastSeen: "3 hours ago", idConfidence: 87, channels: ["api","web","email"] },
];
export default function CerebroCustomer360Page() {
  const [tab, setTab] = useState<Tab>("profiles");
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">CerebroCustomer360™ · Tier 4</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Customer Data Platform — probabilistic identity resolution, unified profiles</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">CerebroCustomer360 stitches customer interactions across every channel into a single unified profile using probabilistic identity resolution. Every touchpoint — web, email, support, product usage, sales calls — is merged into one view with confidence scoring.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {(["profiles","identity","segments"] as Tab[]).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${tab===t?"border-b-2 border-primary-accent text-primary-accent":"text-text-secondary hover:text-text-primary"}`}>{t}</button>)}
      </div>
      {tab==="profiles" && (
        <div className="mt-6 space-y-3">
          {PROFILES.map(p=>(
            <div key={p.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex items-start justify-between gap-2">
                <div><p className="font-semibold text-text-primary">{p.name}</p><p className="mt-0.5 text-xs text-text-secondary">{p.type} · LTV: <span className="font-bold text-primary-accent">${(p.ltv/1000).toFixed(0)}K</span> · {p.touchpoints} touchpoints · Last seen {p.lastSeen}</p></div>
                <span className="text-xs font-bold text-primary-accent shrink-0">ID {p.idConfidence}%</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">{p.channels.map(c=><span key={c} className="rounded-full border border-border bg-surface/40 px-2 py-0.5 text-xs text-text-secondary">{c}</span>)}</div>
            </div>
          ))}
        </div>
      )}
      {tab==="identity" && (
        <div className="mt-6 space-y-4">
          <p className="text-xs text-text-secondary">Probabilistic identity resolution merges customer records using a Fellegi-Sunter model across email, phone, name, company, and behavioral fingerprint. Confidence scores gate automatic merges from manual review queues.</p>
          {[["Auto-merge threshold","≥ 95% confidence — merged automatically"],["Review queue threshold","75–94% — flagged for human review"],["No-merge threshold","< 75% — kept as separate profiles"],["Resolution algorithm","Fellegi-Sunter + ML re-ranking + graph deduplication"],["Daily profiles resolved","4,821 merges · 132 to review queue"]].map(([k,v])=>(
            <div key={String(k)} className="flex items-start gap-3 rounded-xl border border-border bg-surface/40 p-4"><div className="mt-0.5 h-2 w-2 rounded-full bg-primary-accent shrink-0" /><div><p className="text-xs font-semibold text-text-primary">{k}</p><p className="mt-0.5 text-xs text-text-secondary">{v}</p></div></div>
          ))}
        </div>
      )}
      {tab==="segments" && (
        <div className="mt-6 space-y-3">
          <p className="text-xs text-text-secondary">Real-time audience segments update as profile attributes change. Segments feed CerebroCRM, email campaigns, and product personalization.</p>
          {[["Enterprise champions","Contacts with ≥ 3 product sessions/week and NPS ≥ 9","142 members"],["Expansion ready","Accounts with >80% seat utilization for 30+ days","28 accounts"],["Churn risk","Health score < 60 and support tickets ≥ 3 in 30 days","7 accounts"],["High-value developers","API usage ≥ 10K calls/month, free tier","891 users"]].map(([name,def,size])=>(
            <div key={String(name)} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex items-center justify-between gap-2"><p className="font-semibold text-text-primary">{name}</p><p className="font-bold text-primary-accent">{size}</p></div>
              <p className="mt-1 text-xs text-text-secondary">{def}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
