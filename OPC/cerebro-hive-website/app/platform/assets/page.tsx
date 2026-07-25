"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
type Tab = "assets" | "maintenance" | "rul";
const ASSETS = [
  { id: "a1", name: "GPU Cluster Node-01", type: "Compute", location: "NYC-DC1", status: "operational", rul: 84, lastMaint: "2026-06-15", nextMaint: "2026-09-15", value: 240000 },
  { id: "a2", name: "NVMe Storage Array", type: "Storage", location: "NYC-DC1", status: "degraded", rul: 34, lastMaint: "2026-05-01", nextMaint: "2026-07-28", value: 80000 },
  { id: "a3", name: "Network Switch Core", type: "Network", location: "LDN-DC2", status: "operational", rul: 91, lastMaint: "2026-07-01", nextMaint: "2026-10-01", value: 45000 },
  { id: "a4", name: "UPS Unit B", type: "Power", location: "SF-DC3", status: "warning", rul: 52, lastMaint: "2026-04-20", nextMaint: "2026-07-29", value: 28000 },
];
const SC: Record<string, string> = { operational: "text-primary-accent border-primary-accent/40 bg-primary-accent/10", degraded: "text-red-400 border-red-500/40 bg-red-500/10", warning: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10" };
export default function CerebroAssetsPage() {
  const [tab, setTab] = useState<Tab>("assets");
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">CerebroAssets™ · Tier 4</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Predictive Asset Management — IoT sensors, RUL estimation, maintenance scheduling</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">CerebroAssets ingests real-time IoT sensor data to predict asset failures before they happen. Remaining Useful Life (RUL) models schedule maintenance at the optimal point — avoiding both unexpected failure and unnecessary early replacement.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {(["assets","maintenance","rul"] as Tab[]).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${tab===t?"border-b-2 border-primary-accent text-primary-accent":"text-text-secondary hover:text-text-primary"}`}>{t === "rul" ? "RUL Forecast" : t}</button>)}
      </div>
      {tab==="assets" && (
        <div className="mt-6 space-y-2">
          {ASSETS.map(a=>(
            <div key={a.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex items-start justify-between gap-2">
                <div><p className="font-semibold text-text-primary">{a.name}</p><p className="mt-0.5 text-xs text-text-secondary">{a.type} · {a.location} · ${(a.value/1000).toFixed(0)}K</p></div>
                <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${SC[a.status]}`}>{a.status}</span>
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-text-secondary">
                <span>RUL: <span className={`font-bold ${a.rul < 40 ? "text-red-400" : a.rul < 60 ? "text-yellow-400" : "text-primary-accent"}`}>{a.rul}%</span></span>
                <span>Next maintenance: {a.nextMaint}</span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-surface-elevated/40"><div className={`h-1.5 rounded-full transition-all ${a.rul<40?"bg-red-400":a.rul<60?"bg-yellow-400":"bg-primary-accent"}`} style={{width:`${a.rul}%`}} /></div>
            </div>
          ))}
        </div>
      )}
      {tab==="maintenance" && (
        <div className="mt-6 space-y-4">
          <p className="text-xs text-text-secondary">Maintenance schedule optimized by the RUL model — work orders are generated when the model predicts asset health will drop below the intervention threshold within 30 days.</p>
          <div className="space-y-2">
            {ASSETS.sort((a,b)=>new Date(a.nextMaint).getTime()-new Date(b.nextMaint).getTime()).map(a=>(
              <div key={a.id} className={`rounded-xl border p-4 ${a.status==="degraded"?"border-red-500/40 bg-red-500/5":a.status==="warning"?"border-yellow-400/40 bg-yellow-400/5":"border-border bg-surface/40"}`}>
                <div className="flex items-center justify-between gap-2">
                  <div><p className="font-semibold text-text-primary">{a.name}</p><p className="text-xs text-text-secondary">{a.location}</p></div>
                  <div className="text-right"><p className="text-sm font-bold text-text-primary">{a.nextMaint}</p><p className="text-xs text-text-secondary">scheduled</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==="rul" && (
        <div className="mt-6 space-y-4">
          <p className="text-xs text-text-secondary">Remaining Useful Life is estimated using LSTM networks trained on sensor time-series data (vibration, temperature, power draw, error rates). The model outputs a probability distribution over failure time, not a single point estimate.</p>
          <div className="space-y-3">
            {ASSETS.map(a=>(
              <div key={a.id} className="rounded-xl border border-border bg-surface/40 p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="font-semibold text-text-primary">{a.name}</p>
                  <p className={`text-lg font-bold ${a.rul<40?"text-red-400":a.rul<60?"text-yellow-400":"text-primary-accent"}`}>{a.rul}% RUL</p>
                </div>
                <div className="h-3 w-full rounded-full bg-surface-elevated/40 overflow-hidden">
                  <div className={`h-3 rounded-full transition-all ${a.rul<40?"bg-red-400":a.rul<60?"bg-yellow-400":"bg-primary-accent"}`} style={{width:`${a.rul}%`}} />
                </div>
                <p className="mt-1.5 text-xs text-text-secondary">Estimated failure window: {a.rul < 40 ? "< 30 days" : a.rul < 60 ? "30–90 days" : "> 90 days"} · Confidence: 87%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
