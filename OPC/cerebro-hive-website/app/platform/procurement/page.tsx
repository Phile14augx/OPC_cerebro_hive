"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
type Tab = "vendors" | "contracts" | "risk";
const VENDORS = [
  { name: "CloudBase Inc", category: "Infrastructure", spend: 480000, riskScore: 22, status: "preferred", contracts: 2 },
  { name: "DataVault Ltd", category: "Storage", spend: 120000, riskScore: 41, status: "approved", contracts: 1 },
  { name: "SecureNet Corp", category: "Security", spend: 240000, riskScore: 18, status: "preferred", contracts: 3 },
  { name: "ModelAPI GmbH", category: "AI/ML", spend: 380000, riskScore: 55, status: "under_review", contracts: 1 },
  { name: "LegalDocs AI", category: "Legal Tech", spend: 45000, riskScore: 31, status: "approved", contracts: 1 },
];
const CONTRACTS = [
  { vendor: "CloudBase Inc", type: "MSA", value: 480000, expiry: "2027-03-31", autoRenew: true, alerts: ["Renewal window opens Sep 1"] },
  { vendor: "SecureNet Corp", type: "SaaS", value: 240000, expiry: "2026-12-31", autoRenew: false, alerts: ["Renewal negotiation due Aug 15", "Price escalation clause at 8%"] },
  { vendor: "ModelAPI GmbH", type: "Enterprise License", value: 380000, expiry: "2026-09-30", autoRenew: false, alerts: ["Expiring in 67 days — high priority"] },
];
export default function CerebroProcurementPage() {
  const [tab, setTab] = useState<Tab>("vendors");
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">CerebroProcurement™ · Tier 4</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Source-to-pay intelligence — vendor risk scoring, contract NLP, spend analytics</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">CerebroProcurement automates vendor risk assessment, extracts key contract terms with NLP, and surfaces renewal alerts before auto-renewals lock in unfavourable terms.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {(["vendors","contracts","risk"] as Tab[]).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${tab===t?"border-b-2 border-primary-accent text-primary-accent":"text-text-secondary hover:text-text-primary"}`}>{t}</button>)}
      </div>
      {tab==="vendors" && (
        <div className="mt-6 space-y-2">
          {VENDORS.map(v=>(
            <div key={v.name} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex items-start justify-between gap-2">
                <div><p className="font-semibold text-text-primary">{v.name}</p><p className="mt-0.5 text-xs text-text-secondary">{v.category} · {v.contracts} contracts</p></div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${v.riskScore>50?"text-red-400":v.riskScore>30?"text-yellow-400":"text-primary-accent"}`}>Risk {v.riskScore}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${v.status==="preferred"?"border-primary-accent/40 text-primary-accent bg-primary-accent/10":v.status==="under_review"?"border-red-500/40 text-red-400 bg-red-500/10":"border-border text-text-secondary"}`}>{v.status.replace("_"," ")}</span>
                </div>
              </div>
              <p className="mt-1 text-xs text-text-secondary">Annual spend: <span className="font-bold text-text-primary">${(v.spend/1000).toFixed(0)}K</span></p>
            </div>
          ))}
        </div>
      )}
      {tab==="contracts" && (
        <div className="mt-6 space-y-3">
          {CONTRACTS.map(c=>(
            <div key={`${c.vendor}-${c.type}`} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex items-start justify-between gap-2">
                <div><p className="font-semibold text-text-primary">{c.vendor}</p><p className="mt-0.5 text-xs text-text-secondary">{c.type} · expires {c.expiry} · {c.autoRenew?"auto-renews":"manual renewal"}</p></div>
                <p className="font-bold text-primary-accent shrink-0">${(c.value/1000).toFixed(0)}K</p>
              </div>
              {c.alerts.map(a=><p key={a} className="mt-1.5 text-xs text-yellow-400">⚠ {a}</p>)}
            </div>
          ))}
        </div>
      )}
      {tab==="risk" && (
        <div className="mt-6 space-y-4">
          <p className="text-xs text-text-secondary">Vendor risk scores are computed from financial stability, geographic concentration, data access level, regulatory compliance status, and historical SLA performance.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[["Avg vendor risk score","33"],["High-risk vendors","1"],["Spend at risk","$380K"]].map(([k,v])=><div key={String(k)} className="rounded-xl border border-border bg-surface/40 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{k}</p><p className="mt-2 text-2xl font-bold text-primary-accent">{v}</p></div>)}
          </div>
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-400">High risk: ModelAPI GmbH</p>
            <p className="mt-2 text-sm text-text-primary">Risk score 55/100. Drivers: single-jurisdiction provider (US-only), no SOC 2 certification, 2 SLA misses in last 6 months. Recommendation: require SOC 2 as renewal condition or identify backup provider.</p>
          </div>
        </div>
      )}
    </main>
  );
}
