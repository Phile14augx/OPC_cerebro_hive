"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
type Tab = "spc" | "defects" | "inspection";
const SPC_DATA = [
  { batch: "B-2026-07-21", metric: "Response coherence", value: 94.2, ucl: 97, lcl: 88, mean: 92.5, status: "in_control" },
  { batch: "B-2026-07-22", metric: "Response coherence", value: 91.8, ucl: 97, lcl: 88, mean: 92.5, status: "in_control" },
  { batch: "B-2026-07-23", metric: "Response coherence", value: 87.1, ucl: 97, lcl: 88, mean: 92.5, status: "warning" },
  { batch: "B-2026-07-24", metric: "Response coherence", value: 93.4, ucl: 97, lcl: 88, mean: 92.5, status: "in_control" },
  { batch: "B-2026-07-25", metric: "Response coherence", value: 95.1, ucl: 97, lcl: 88, mean: 92.5, status: "in_control" },
];
const DEFECTS = [
  { type: "Hallucinated citation", count: 12, severity: "critical", trend: "↓ -40%" },
  { type: "Constitutional violation", count: 3, severity: "critical", trend: "↓ -25%" },
  { type: "Context truncation error", count: 28, severity: "major", trend: "↑ +12%" },
  { type: "Tool call parameter error", count: 41, severity: "minor", trend: "↓ -8%" },
  { type: "Latency SLA breach", count: 67, severity: "minor", trend: "→ 0%" },
];
export default function CerebroQualityPage() {
  const [tab, setTab] = useState<Tab>("spc");
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">CerebroQuality™ · Tier 4</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Quality Intelligence — SPC, defect tracking, AI output inspection</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">CerebroQuality applies Statistical Process Control to AI outputs. Control charts detect when model quality drifts outside acceptable bounds. Computer vision inspection and NLP classifiers catch defect types before they reach users.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {(["spc","defects","inspection"] as Tab[]).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-colors ${tab===t?"border-b-2 border-primary-accent text-primary-accent":"text-text-secondary hover:text-text-primary"}`}>{t}</button>)}
      </div>
      {tab==="spc" && (
        <div className="mt-6 space-y-4">
          <p className="text-xs text-text-secondary">Control charts track AI output quality metrics per batch. UCL/LCL are set at μ ± 3σ from a 30-day baseline. Points below the LCL trigger automated re-evaluation and optional rollback to prior model checkpoint.</p>
          <div className="overflow-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface-elevated/40"><tr>{["Batch","Metric","Value","Mean","LCL","UCL","Status"].map(h=><th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">{h}</th>)}</tr></thead>
              <tbody>{SPC_DATA.map(d=><tr key={d.batch} className="border-b border-border last:border-none hover:bg-surface-elevated/20">
                <td className="px-3 py-2 font-mono text-xs text-text-secondary">{d.batch}</td>
                <td className="px-3 py-2 text-text-primary">{d.metric}</td>
                <td className={`px-3 py-2 font-bold ${d.status==="warning"?"text-yellow-400":"text-primary-accent"}`}>{d.value}</td>
                <td className="px-3 py-2 text-text-secondary">{d.mean}</td>
                <td className="px-3 py-2 text-text-secondary">{d.lcl}</td>
                <td className="px-3 py-2 text-text-secondary">{d.ucl}</td>
                <td className="px-3 py-2"><span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${d.status==="warning"?"border-yellow-400/40 text-yellow-400 bg-yellow-400/10":"border-primary-accent/40 text-primary-accent bg-primary-accent/10"}`}>{d.status.replace("_"," ")}</span></td>
              </tr>)}</tbody>
            </table>
          </div>
        </div>
      )}
      {tab==="defects" && (
        <div className="mt-6 space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            {[["Total defects (7d)","151"],["Critical","15"],["DPMO","6,240"]].map(([k,v])=><div key={String(k)} className="rounded-xl border border-border bg-surface/40 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{k}</p><p className={`mt-2 text-2xl font-bold ${k==="Critical"?"text-red-400":"text-primary-accent"}`}>{v}</p></div>)}
          </div>
          {DEFECTS.map(d=>(
            <div key={d.type} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex items-center justify-between gap-2">
                <div><p className="font-semibold text-text-primary">{d.type}</p></div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${d.trend.startsWith("↑")?"text-red-400":d.trend.startsWith("↓")?"text-primary-accent":"text-text-secondary"}`}>{d.trend}</span>
                  <span className="text-lg font-bold text-text-primary">{d.count}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${d.severity==="critical"?"border-red-500/40 text-red-400 bg-red-500/10":d.severity==="major"?"border-orange-400/40 text-orange-400 bg-orange-400/10":"border-border text-text-secondary"}`}>{d.severity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab==="inspection" && (
        <div className="mt-6 space-y-4">
          <p className="text-xs text-text-secondary">AI-powered output inspection runs every agent response through a multi-classifier pipeline before delivery. Classifiers check for hallucination, constitutional violations, PII leakage, and off-topic drift.</p>
          {[["Hallucination classifier","FactScore v2.1 + retrieval grounding check","97.2% precision"],["Constitutional check","13 constitutional principles + regex blocklist","99.8% recall"],["PII detector","Named entity + pattern matching (SSN, CC, DOB)","99.1% precision"],["Off-topic drift","Embedding distance from original query","91.4% accuracy"],["Toxicity filter","Perspective API + fine-tuned classifier","99.6% recall"]].map(([name,desc,score])=>(
            <div key={String(name)} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex items-center justify-between gap-2"><p className="font-semibold text-text-primary">{name}</p><p className="font-bold text-primary-accent">{score}</p></div>
              <p className="mt-1 text-xs text-text-secondary">{desc}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
