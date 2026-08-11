"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
type Tab = "deals" | "resources" | "program";
const DEALS = [
  { id: "D-2026-0041", partner: "Nexus Consulting", type: "Reseller", customer: "Meridian Financial", stage: "Closed Won", value: "$142,000", date: "2026-07-18" },
  { id: "D-2026-0039", partner: "Apex Solutions", type: "Referral", customer: "BuildRight Corp", stage: "Proposal", value: "$58,000", date: "2026-07-12" },
  { id: "D-2026-0035", partner: "DataBridge Inc", type: "Technology", customer: "OmniRetail", stage: "Discovery", value: "$210,000", date: "2026-06-30" },
  { id: "D-2026-0031", partner: "CloudForward", type: "Reseller", customer: "HealthSync AI", stage: "Closed Won", value: "$89,000", date: "2026-06-15" },
];
const STAGE_COLOR: Record<string, string> = {
  "Closed Won": "border-primary-accent/40 text-primary-accent bg-primary-accent/10",
  "Proposal": "border-yellow-400/40 text-yellow-400 bg-yellow-400/10",
  "Discovery": "border-orange-400/40 text-orange-400 bg-orange-400/10",
};
export default function HivePartnerPage() {
  const [tab, setTab] = useState<Tab>("deals");
  const [form, setForm] = useState({ partner: "", customer: "", value: "", notes: "" });
  const [submitted, setSubmitted] = useState(false);
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HivePartner™ · Tier 5</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Partner portal — deal registration, co-sell, joint GTM</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">HivePartner is the channel partner portal. Partners register deals, access co-branded materials, track commission status, and run co-sell motions with the CerebroHive field team. Partner tiers: Affiliate, Silver, Gold, Platinum.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {(["deals","resources","program"] as Tab[]).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${tab===t?"border-b-2 border-primary-accent text-primary-accent":"text-text-secondary hover:text-text-primary"}`}>{t}</button>)}
      </div>
      {tab==="deals" && (
        <div className="mt-6 space-y-4">
          {submitted ? (
            <div className="rounded-xl border border-primary-accent/30 bg-primary-accent/5 p-4 text-sm text-primary-accent">Deal registered successfully. Your partner manager will respond within 1 business day.</div>
          ) : (
            <div className="rounded-xl border border-border bg-surface/40 p-5">
              <p className="font-semibold text-text-primary mb-3">Register a deal</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {([["Partner company", "partner"], ["Customer name", "customer"], ["Estimated value", "value"]] as [string,string][]).map(([label,field])=>(
                  <div key={field}><label className="text-xs font-semibold text-text-secondary">{label}</label><input className="mt-1 w-full rounded-md border border-border bg-surface-elevated/40 px-3 py-2 text-sm text-text-primary" value={form[field as keyof typeof form]} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))} /></div>
                ))}
                <div className="sm:col-span-2"><label className="text-xs font-semibold text-text-secondary">Notes</label><textarea className="mt-1 w-full rounded-md border border-border bg-surface-elevated/40 px-3 py-2 text-sm text-text-primary" rows={2} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} /></div>
              </div>
              <button onClick={()=>setSubmitted(true)} className="mt-3 rounded-md border border-primary-accent px-4 py-2 text-xs font-semibold text-primary-accent">Submit Deal</button>
            </div>
          )}
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Registered deals</p>
          <div className="space-y-2">
            {DEALS.map(d=>(
              <div key={d.id} className="rounded-xl border border-border bg-surface/40 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div><p className="font-semibold text-text-primary">{d.customer}</p><p className="mt-0.5 text-xs text-text-secondary">{d.partner} · {d.type} · {d.date}</p></div>
                  <div className="flex items-center gap-2 shrink-0"><span className="font-bold text-text-primary">{d.value}</span><span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${STAGE_COLOR[d.stage]}`}>{d.stage}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==="resources" && (
        <div className="mt-6 space-y-2">
          {[["Solution Brief — CerebroHive Enterprise","PDF","2026-07"],["Co-branded Slide Deck Template","PPTX","2026-06"],["Technical Integration Guide","PDF","2026-05"],["Partner Pricing Calculator","XLSX","2026-07"],["ROI Estimator for Prospects","HTML","2026-06"]].map(([name,type,date])=>(
            <div key={String(name)} className="flex items-center justify-between rounded-xl border border-border bg-surface/40 p-4">
              <div><p className="font-semibold text-text-primary">{name}</p><p className="mt-0.5 text-xs text-text-secondary">Updated {date}</p></div>
              <span className="rounded border border-border px-2 py-0.5 text-xs font-bold text-text-secondary">{type}</span>
            </div>
          ))}
        </div>
      )}
      {tab==="program" && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[{tier:"Affiliate",rev:"10%",minARR:"-",benefits:["Deal registration","Co-marketing kit","Partner badge"]},
            {tier:"Silver",rev:"15%",minARR:"$50K",benefits:["Priority deal reg","MDF 2%","Training access","Deal desk support"]},
            {tier:"Gold",rev:"20%",minARR:"$250K",benefits:["Named partner mgr","MDF 5%","Co-sell motion","QBR","Demo environment"],current:true},
            {tier:"Platinum",rev:"25%",minARR:"$1M",benefits:["VP exec sponsor","MDF 8%","Joint go-to-market","Revenue guarantee","Dedicated SE"]}
          ].map(p=>(
            <div key={p.tier} className={`rounded-2xl border p-4 ${(p as {current?:boolean}).current?"border-primary-accent/50 bg-primary-accent/5":"border-border bg-surface/40"}`}>
              <div className="flex items-center justify-between gap-2 mb-2"><p className="font-bold text-text-primary">{p.tier}</p>{(p as {current?:boolean}).current&&<span className="text-xs font-bold text-primary-accent">Current</span>}</div>
              <p className="text-lg font-bold text-primary-accent">{p.rev} rev share</p>
              <p className="text-xs text-text-secondary mb-2">Min ARR: {p.minARR}</p>
              <ul className="space-y-1">{p.benefits.map(b=><li key={b} className="flex items-start gap-1.5 text-xs text-text-secondary"><span className="text-primary-accent mt-0.5">✓</span>{b}</li>)}</ul>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
