"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Tab = "employees" | "attrition" | "compliance";

const EMPLOYEES = [
  { id: "e1", name: "Jordan Kim", role: "Senior ML Engineer", dept: "Platform", tenure: 2.4, performance: 92, flightRisk: 18, location: "NYC" },
  { id: "e2", name: "Priya Nair", role: "Product Manager", dept: "CerebroFlow", tenure: 1.1, performance: 88, flightRisk: 42, location: "LDN" },
  { id: "e3", name: "Marcus Webb", role: "Staff Engineer", dept: "Infrastructure", tenure: 4.2, performance: 96, flightRisk: 12, location: "SF" },
  { id: "e4", name: "Sofia Reyes", role: "Customer Success", dept: "CS", tenure: 0.8, performance: 79, flightRisk: 61, location: "MX" },
  { id: "e5", name: "Alex Thornton", role: "Sales Engineer", dept: "GTM", tenure: 1.9, performance: 84, flightRisk: 34, location: "NYC" },
];

const RISK_DRIVERS = [
  { factor: "No promotion in 24+ months", impact: "High", employees: 8 },
  { factor: "Below-market compensation (P40)", impact: "High", employees: 5 },
  { factor: "Manager tenure < 6 months", impact: "Medium", employees: 12 },
  { factor: "No internal mobility in 18+ months", impact: "Medium", employees: 7 },
  { factor: "Declined last 2 performance cycles", impact: "Low", employees: 3 },
];

export default function CerebroHRPage() {
  const [tab, setTab] = useState<Tab>("employees");
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">CerebroHR™ · Tier 4</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">People Intelligence — attrition prediction, HRIS, privacy-by-design</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">CerebroHR is an AI-native HRIS with built-in attrition prediction. Flight risk scores surface retention opportunities before employees disengage. All PII is encrypted at the field level and access-logged.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {(["employees", "attrition", "compliance"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${tab === t ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary hover:text-text-primary"}`}>{t}</button>
        ))}
      </div>
      {tab === "employees" && (
        <div className="mt-6 space-y-2">
          {EMPLOYEES.map(e => (
            <div key={e.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-semibold text-text-primary">{e.name}</span>
                  <span className="ml-2 text-xs text-text-secondary">{e.role} · {e.dept} · {e.location}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-text-secondary">Perf: <span className="font-bold text-primary-accent">{e.performance}</span></span>
                  <span className={`rounded-full border px-2 py-0.5 font-semibold ${e.flightRisk > 50 ? "border-red-500/40 text-red-400 bg-red-500/10" : e.flightRisk > 30 ? "border-yellow-400/40 text-yellow-400 bg-yellow-400/10" : "border-primary-accent/40 text-primary-accent bg-primary-accent/10"}`}>Risk {e.flightRisk}%</span>
                </div>
              </div>
              <p className="mt-1 text-xs text-text-secondary">Tenure: {e.tenure}y</p>
            </div>
          ))}
        </div>
      )}
      {tab === "attrition" && (
        <div className="mt-6 space-y-4">
          <p className="text-xs text-text-secondary">Gradient boosting model trained on 3 years of HR data. Features: compensation percentile, promotion recency, manager tenure, performance trend, internal mobility, PTO usage, and engagement survey delta.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[["At-risk employees", "5"], ["Avg flight risk", "33%"], ["Predicted attrition (90d)", "2.1 FTE"]].map(([k, v]) => (
              <div key={String(k)} className="rounded-xl border border-border bg-surface/40 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{k}</p><p className="mt-2 text-2xl font-bold text-primary-accent">{v}</p></div>
            ))}
          </div>
          <div className="space-y-2">
            {RISK_DRIVERS.map(r => (
              <div key={r.factor} className="flex items-center justify-between rounded-xl border border-border bg-surface/40 px-4 py-3">
                <div><p className="text-sm text-text-primary">{r.factor}</p><p className="text-xs text-text-secondary">{r.employees} employees affected</p></div>
                <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${r.impact === "High" ? "border-red-500/40 text-red-400" : r.impact === "Medium" ? "border-yellow-400/40 text-yellow-400" : "border-border text-text-secondary"}`}>{r.impact}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === "compliance" && (
        <div className="mt-6 space-y-4">
          <p className="text-xs text-text-secondary">All employee PII is encrypted at field level using tenant-managed keys. Access is logged per-field with requesting principal, timestamp, and business justification.</p>
          {[["Field-level encryption", "AES-256-GCM, per-field keys in HashiCorp Vault"],["Access logging", "All PII field reads logged to immutable audit trail"],["Right to erasure", "GDPR Art. 17 erasure automated within 30 days of request"],["Data minimization", "Only collect fields with documented business purpose"],["Cross-border transfer", "EU/UK data stays in-region; SCCs in place for US transfers"]].map(([k, v]) => (
            <div key={String(k)} className="flex items-start gap-3 rounded-xl border border-border bg-surface/40 p-4">
              <span className="mt-0.5 text-primary-accent">✓</span>
              <div><p className="text-sm font-semibold text-text-primary">{k}</p><p className="mt-0.5 text-xs text-text-secondary">{v}</p></div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
