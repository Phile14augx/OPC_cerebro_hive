"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Tab = "projects" | "risks" | "resources";
type Health = "on_track" | "at_risk" | "delayed";
const HC: Record<Health, string> = { on_track: "text-primary-accent border-primary-accent/40 bg-primary-accent/10", at_risk: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10", delayed: "text-red-400 border-red-500/40 bg-red-500/10" };

const PROJECTS = [
  { id: "p1", name: "Platform v3 Launch", health: "on_track" as Health, completion: 78, dueDate: "2026-08-15", budget: 420000, spent: 318000, team: 8, predictedDelay: 0 },
  { id: "p2", name: "EU Data Residency", health: "at_risk" as Health, completion: 41, dueDate: "2026-09-01", budget: 180000, spent: 142000, team: 5, predictedDelay: 12 },
  { id: "p3", name: "Mobile SDK", health: "delayed" as Health, completion: 23, dueDate: "2026-07-31", budget: 95000, spent: 87000, team: 3, predictedDelay: 28 },
  { id: "p4", name: "SOC 2 Type II Audit", health: "on_track" as Health, completion: 92, dueDate: "2026-08-01", budget: 60000, spent: 52000, team: 2, predictedDelay: 0 },
];

const RISKS = [
  { project: "EU Data Residency", risk: "Vendor dependency", probability: 68, impact: "High", mitigation: "Identify alternative provider by Jul 30" },
  { project: "Mobile SDK", risk: "Resource overcommitment", probability: 89, impact: "Critical", mitigation: "Reallocate 1 engineer from Platform v3" },
  { project: "Platform v3 Launch", risk: "Integration complexity", probability: 32, impact: "Medium", mitigation: "Add integration test sprint in Aug" },
];

export default function CerebroProjectsPage() {
  const [tab, setTab] = useState<Tab>("projects");
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">CerebroProjects™ · Tier 4</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Project Risk Intelligence — predictive delay detection, resource optimization</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">CerebroProjects combines PM tooling with AI-powered risk detection. The delay predictor surfaces schedule risk 3–4 weeks before slippage becomes visible in status reports, giving teams time to intervene.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {(["projects","risks","resources"] as Tab[]).map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${tab===t?"border-b-2 border-primary-accent text-primary-accent":"text-text-secondary hover:text-text-primary"}`}>{t}</button>
        ))}
      </div>
      {tab==="projects" && (
        <div className="mt-6 space-y-3">
          {PROJECTS.map(p=>(
            <div key={p.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex items-start justify-between gap-2">
                <div><p className="font-semibold text-text-primary">{p.name}</p><p className="mt-0.5 text-xs text-text-secondary">Due {p.dueDate} · {p.team} engineers</p></div>
                <div className="flex items-center gap-2">
                  {p.predictedDelay > 0 && <span className="text-xs font-bold text-red-400">+{p.predictedDelay}d predicted</span>}
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${HC[p.health]}`}>{p.health.replace("_"," ")}</span>
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-surface-elevated/40"><div className="h-1.5 rounded-full bg-primary-accent" style={{width:`${p.completion}%`}} /></div>
              <div className="mt-2 flex gap-4 text-xs text-text-secondary">
                <span>{p.completion}% complete</span>
                <span>${(p.spent/1000).toFixed(0)}K / ${(p.budget/1000).toFixed(0)}K budget</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab==="risks" && (
        <div className="mt-6 space-y-3">
          <p className="text-xs text-text-secondary">AI-detected risks ranked by probability × impact. The model analyzes velocity trends, dependency graphs, and team capacity to surface risks 3–4 weeks before they appear in status reports.</p>
          {RISKS.map(r=>(
            <div key={r.risk} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex items-start justify-between gap-2">
                <div><p className="font-semibold text-text-primary">{r.risk}</p><p className="mt-0.5 text-xs text-primary-accent">{r.project}</p></div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${r.impact==="Critical"?"border-red-500/40 text-red-400 bg-red-500/10":r.impact==="High"?"border-orange-400/40 text-orange-400 bg-orange-400/10":"border-yellow-400/40 text-yellow-400 bg-yellow-400/10"}`}>{r.impact}</span>
                  <span className="text-sm font-bold text-text-primary">{r.probability}%</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-text-secondary">Mitigation: {r.mitigation}</p>
            </div>
          ))}
        </div>
      )}
      {tab==="resources" && (
        <div className="mt-6 space-y-4">
          <p className="text-xs text-text-secondary">Resource allocation across active projects. AI recommends optimal reallocation when projects are at risk due to capacity constraints.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[["Total engineers allocated","18"],["Projects over capacity","1"],["AI reallocation suggestions","2"],["Avg utilization","87%"]].map(([k,v])=>(
              <div key={String(k)} className="rounded-xl border border-border bg-surface/40 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{k}</p><p className="mt-2 text-2xl font-bold text-primary-accent">{v}</p></div>
            ))}
          </div>
          <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">AI Recommendation</p>
            <p className="mt-2 text-sm text-text-primary">Reallocate 1 engineer from Platform v3 (78% complete, 3 weeks ahead of schedule) to Mobile SDK (23% complete, 28 days behind). This resolves the Mobile SDK delay risk with minimal impact to Platform v3.</p>
          </div>
        </div>
      )}
    </main>
  );
}
