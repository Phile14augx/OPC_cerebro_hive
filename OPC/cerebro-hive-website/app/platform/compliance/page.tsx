"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Tab = "posture" | "frameworks" | "evidence";
type Status = "compliant" | "partial" | "gap" | "not_applicable";

const STATUS_COLOR: Record<Status, string> = {
  compliant: "border-primary-accent/40 text-primary-accent bg-primary-accent/10",
  partial: "border-yellow-400/40 text-yellow-400 bg-yellow-400/10",
  gap: "border-red-500/40 text-red-400 bg-red-500/10",
  not_applicable: "border-border text-text-secondary",
};

const FRAMEWORKS = [
  { name: "SOC 2 Type II", controls: 64, compliant: 61, partial: 2, gap: 1, score: 95 },
  { name: "ISO 27001", controls: 114, compliant: 108, partial: 4, gap: 2, score: 96 },
  { name: "GDPR", controls: 38, compliant: 35, partial: 3, gap: 0, score: 97 },
  { name: "HIPAA", controls: 42, compliant: 38, partial: 3, gap: 1, score: 93 },
  { name: "PCI DSS v4", controls: 78, compliant: 71, partial: 5, gap: 2, score: 91 },
];

const EVIDENCE = [
  { id: "ev1", control: "SOC2-CC6.1 Logical Access", type: "automated", status: "compliant" as Status, collected: "2026-07-25 00:00", expiry: "2026-08-25" },
  { id: "ev2", control: "GDPR Art. 32 Data Encryption", type: "automated", status: "compliant" as Status, collected: "2026-07-25 00:00", expiry: "2026-08-25" },
  { id: "ev3", control: "ISO 27001 A.9.4 Access Control", type: "automated", status: "partial" as Status, collected: "2026-07-24 00:00", expiry: "2026-07-31" },
  { id: "ev4", control: "HIPAA 164.312(e) Transmission Security", type: "manual", status: "gap" as Status, collected: "2026-07-20 00:00", expiry: "2026-07-27" },
];

export default function CerebroCompliancePage() {
  const [tab, setTab] = useState<Tab>("posture");
  const overallScore = Math.round(FRAMEWORKS.reduce((s, f) => s + f.score, 0) / FRAMEWORKS.length);
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">CerebroCompliance™ · Tier 4</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Compliance Intelligence — real-time posture, automated evidence, 14 frameworks</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">CerebroCompliance continuously monitors control compliance across SOC 2, ISO 27001, GDPR, HIPAA, PCI DSS and more. Evidence is collected automatically from platform APIs — no more spreadsheet audits.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {(["posture", "frameworks", "evidence"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${tab === t ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary hover:text-text-primary"}`}>{t}</button>
        ))}
      </div>
      {tab === "posture" && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-primary-accent/30 bg-primary-accent/5 p-4 sm:col-span-1"><p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Overall Score</p><p className="mt-2 text-4xl font-bold text-primary-accent">{overallScore}</p></div>
            {[["Frameworks", FRAMEWORKS.length],["Controls monitored", FRAMEWORKS.reduce((s,f)=>s+f.controls,0)],["Gaps", FRAMEWORKS.reduce((s,f)=>s+f.gap,0)]].map(([k,v]) => (
              <div key={String(k)} className="rounded-xl border border-border bg-surface/40 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{k}</p><p className="mt-2 text-2xl font-bold text-text-primary">{v}</p></div>
            ))}
          </div>
          <div className="space-y-2">
            {FRAMEWORKS.map(f => (
              <div key={f.name} className="rounded-xl border border-border bg-surface/40 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-text-primary">{f.name}</span>
                  <span className={`text-lg font-bold ${f.score >= 95 ? "text-primary-accent" : f.score >= 90 ? "text-yellow-400" : "text-red-400"}`}>{f.score}%</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-surface-elevated/40">
                  <div className="h-2 rounded-full bg-primary-accent transition-all" style={{ width: `${f.score}%` }} />
                </div>
                <div className="mt-2 flex gap-4 text-xs text-text-secondary">
                  <span className="text-primary-accent">{f.compliant} compliant</span>
                  <span className="text-yellow-400">{f.partial} partial</span>
                  <span className="text-red-400">{f.gap} gap</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === "frameworks" && (
        <div className="mt-6 overflow-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-elevated/40"><tr>{["Framework","Controls","Compliant","Partial","Gaps","Score"].map(h=><th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">{h}</th>)}</tr></thead>
            <tbody>{FRAMEWORKS.map(f=><tr key={f.name} className="border-b border-border last:border-none hover:bg-surface-elevated/20"><td className="px-3 py-2 font-semibold text-text-primary">{f.name}</td><td className="px-3 py-2 text-text-secondary">{f.controls}</td><td className="px-3 py-2 text-primary-accent font-semibold">{f.compliant}</td><td className="px-3 py-2 text-yellow-400">{f.partial}</td><td className="px-3 py-2 text-red-400">{f.gap}</td><td className="px-3 py-2 font-bold text-primary-accent">{f.score}%</td></tr>)}</tbody>
          </table>
        </div>
      )}
      {tab === "evidence" && (
        <div className="mt-6 space-y-2">
          {EVIDENCE.map(e => (
            <div key={e.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex items-center justify-between gap-2">
                <div><p className="font-semibold text-text-primary">{e.control}</p><p className="mt-0.5 text-xs text-text-secondary">{e.type} · collected {e.collected} · expires {e.expiry}</p></div>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[e.status]}`}>{e.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
