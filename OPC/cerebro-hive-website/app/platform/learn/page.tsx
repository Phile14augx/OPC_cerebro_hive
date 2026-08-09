"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Tab = "paths" | "skills" | "analytics";

const EMPLOYEES = [
  { name: "Jordan Kim", role: "AI Engineer", path: "LLM Engineering Track", progress: 72, completedModules: 9, totalModules: 13, certDue: "2026-09-30", riskOfExpiry: false },
  { name: "Alex Torres", role: "Data Analyst", path: "Data & Analytics Track", progress: 45, completedModules: 5, totalModules: 11, certDue: "2026-10-15", riskOfExpiry: false },
  { name: "Sam Okafor", role: "Compliance Lead", path: "GRC Certification Track", progress: 91, completedModules: 10, totalModules: 11, certDue: "2026-08-01", riskOfExpiry: true },
  { name: "Riley Chen", role: "Sales Engineer", path: "CerebroHive SE Bootcamp", progress: 28, completedModules: 3, totalModules: 11, certDue: "2026-12-01", riskOfExpiry: false },
];

const SKILLS_GAPS = [
  { skill: "LLM prompt engineering", coverage: 35, priority: "critical", employees: 12 },
  { skill: "Apache Iceberg / data lakehouse", coverage: 18, priority: "critical", employees: 8 },
  { skill: "OpenTelemetry observability", coverage: 52, priority: "high", employees: 6 },
  { skill: "SOC 2 Type II evidence collection", coverage: 71, priority: "medium", employees: 4 },
  { skill: "HiveAgents LangGraph patterns", coverage: 24, priority: "high", employees: 9 },
];

const PRIORITY_COLOR: Record<string, string> = {
  critical: "border-red-500/40 text-red-400 bg-red-500/10",
  high: "border-yellow-400/40 text-yellow-400 bg-yellow-400/10",
  medium: "border-primary-accent/40 text-primary-accent bg-primary-accent/10",
};

export default function CerebroLearnPage() {
  const [tab, setTab] = useState<Tab>("paths");

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Platform
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">CerebroLearn™ · Tier 4</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Adaptive enterprise learning — personalized paths, skills gap AI, compliance certification</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">CerebroLearn continuously upskills the enterprise workforce. An AI tutor adapts learning paths to each employee&apos;s role and pace, identifies org-wide skills gaps before they become risks, and tracks compliance certifications with automatic expiry alerts.</p>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {(["paths", "skills", "analytics"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${tab === t ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary hover:text-text-primary"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "paths" && (
        <div className="mt-6 space-y-3">
          <p className="text-xs text-text-secondary">Adaptive paths are generated per employee from their role, prior completions, and manager-defined priorities. The AI tutor adjusts pacing based on quiz performance and engagement signals.</p>
          {EMPLOYEES.map(e => (
            <div key={e.name} className={`rounded-xl border p-4 ${e.riskOfExpiry ? "border-yellow-400/40 bg-yellow-400/5" : "border-border bg-surface/40"}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-text-primary">{e.name} <span className="text-xs font-normal text-text-secondary">— {e.role}</span></p>
                  <p className="mt-0.5 text-xs text-text-secondary">{e.path}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-text-secondary">Cert due: {e.certDue}</p>
                  {e.riskOfExpiry && <p className="mt-0.5 text-xs font-bold text-yellow-400">⚠ Expiring soon</p>}
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-text-secondary">{e.completedModules}/{e.totalModules} modules</span>
                  <span className="text-xs font-bold text-primary-accent">{e.progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-surface-elevated/40">
                  <div className="h-2 rounded-full bg-primary-accent transition-all" style={{ width: `${e.progress}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "skills" && (
        <div className="mt-6 space-y-3">
          <p className="text-xs text-text-secondary">Skills gap analysis runs weekly across all employees. Coverage = % of employees with demonstrated proficiency. AI recommends learning content to close each gap.</p>
          {SKILLS_GAPS.map(s => (
            <div key={s.skill} className="rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold text-text-primary">{s.skill}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">{s.employees} employees below proficiency threshold</p>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold shrink-0 ${PRIORITY_COLOR[s.priority]}`}>{s.priority}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-surface-elevated/40">
                  <div className="h-2 rounded-full bg-primary-accent" style={{ width: `${s.coverage}%` }} />
                </div>
                <span className="text-xs font-bold text-text-primary w-12 text-right">{s.coverage}% covered</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "analytics" && (
        <div className="mt-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Active learners", "4"],
              ["Avg completion rate", "59%"],
              ["Certs expiring 90d", "1"],
              ["Skills gaps closed (YTD)", "7"],
            ].map(([k, v]) => (
              <div key={String(k)} className="rounded-xl border border-border bg-surface/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{k}</p>
                <p className="mt-2 text-2xl font-bold text-primary-accent">{v}</p>
              </div>
            ))}
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">AI tutor activity (last 30 days)</p>
          {[
            ["Quiz questions generated", "842", "Adaptive to each learner's progress"],
            ["Content recommendations", "128", "Personalized by role and skill gap"],
            ["Auto-translations", "34", "Localized to employee preferred language"],
            ["Manager nudges sent", "12", "Automated prompts for at-risk learners"],
          ].map(([label, count, desc]) => (
            <div key={String(label)} className="flex items-start gap-3 rounded-xl border border-border bg-surface/40 p-4">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-primary-accent shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-text-primary">{label} <span className="text-primary-accent">({count})</span></p>
                <p className="mt-0.5 text-xs text-text-secondary">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
