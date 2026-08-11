import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Academy Courses — Enterprise AI Training",
  description:
    "40+ practitioner-grade enterprise AI courses covering Strategy, Engineering, Operations, and Security. Hands-on labs in CerebroStudio™.",
};

const CATEGORIES = [
  {
    id: "strategy",
    label: "AI Strategy",
    color: "text-purple-400",
    border: "border-purple-500/30",
    bg: "bg-purple-500/5",
    courses: [
      { code: "AS-101", name: "Enterprise AI Readiness Assessment", duration: "4h", level: "Foundation" },
      { code: "AS-102", name: "AI Opportunity Identification & Prioritization", duration: "6h", level: "Practitioner" },
      { code: "AS-103", name: "Building the AI Business Case", duration: "5h", level: "Practitioner" },
      { code: "AS-104", name: "AI Roadmap Design & Governance", duration: "6h", level: "Practitioner" },
      { code: "AS-105", name: "Communicating AI Strategy to Executives", duration: "3h", level: "Practitioner" },
      { code: "AS-106", name: "AI Vendor Selection & Due Diligence", duration: "5h", level: "Advanced" },
      { code: "AS-107", name: "AI Change Management & Adoption", duration: "4h", level: "Practitioner" },
      { code: "AS-108", name: "AI ROI Measurement Framework", duration: "5h", level: "Advanced" },
    ],
  },
  {
    id: "engineering",
    label: "AI Engineering",
    color: "text-primary-accent",
    border: "border-primary-accent/30",
    bg: "bg-primary-accent/5",
    courses: [
      { code: "AE-101", name: "Production RAG Systems", duration: "10h", level: "Advanced" },
      { code: "AE-102", name: "Building AI Agents with CerebroAgent™", duration: "8h", level: "Advanced" },
      { code: "AE-103", name: "LLM Evaluation & Red-Teaming", duration: "6h", level: "Practitioner" },
      { code: "AE-104", name: "Vector Database Design & Optimization", duration: "5h", level: "Practitioner" },
      { code: "AE-105", name: "Fine-Tuning Foundation Models", duration: "8h", level: "Advanced" },
      { code: "AE-106", name: "AI Pipeline Engineering with HiveForge™", duration: "6h", level: "Advanced" },
      { code: "AE-107", name: "Document AI & Intelligent Extraction", duration: "7h", level: "Advanced" },
      { code: "AE-108", name: "Multi-Agent System Design", duration: "8h", level: "Expert" },
    ],
  },
  {
    id: "operations",
    label: "AI Operations",
    color: "text-yellow-400",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/5",
    courses: [
      { code: "AO-101", name: "MLOps Fundamentals", duration: "6h", level: "Practitioner" },
      { code: "AO-102", name: "Model Monitoring & Drift Detection", duration: "5h", level: "Practitioner" },
      { code: "AO-103", name: "AI Incident Response", duration: "4h", level: "Practitioner" },
      { code: "AO-104", name: "Production ML Cost Optimization", duration: "4h", level: "Advanced" },
      { code: "AO-105", name: "Automated Retraining Pipelines", duration: "6h", level: "Advanced" },
      { code: "AO-106", name: "AI SLA Design & Enforcement", duration: "4h", level: "Advanced" },
      { code: "AO-107", name: "LLMOps: Operating Large Language Models", duration: "7h", level: "Advanced" },
      { code: "AO-108", name: "AI Platform Engineering", duration: "8h", level: "Expert" },
    ],
  },
  {
    id: "security",
    label: "AI Security & Governance",
    color: "text-red-400",
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    courses: [
      { code: "SG-101", name: "AI Risk Management (NIST AI RMF)", duration: "6h", level: "Practitioner" },
      { code: "SG-102", name: "EU AI Act: Compliance for Enterprise", duration: "5h", level: "Practitioner" },
      { code: "SG-103", name: "AI Red-Teaming & Adversarial Testing", duration: "7h", level: "Advanced" },
      { code: "SG-104", name: "Model Risk Management for Financial Services", duration: "6h", level: "Advanced" },
      { code: "SG-105", name: "AI Privacy Engineering", duration: "5h", level: "Advanced" },
      { code: "SG-106", name: "Building an AI Governance Program", duration: "6h", level: "Practitioner" },
      { code: "SG-107", name: "Bias Auditing & Fairness Testing", duration: "5h", level: "Advanced" },
      { code: "SG-108", name: "AI Security Architecture", duration: "7h", level: "Expert" },
    ],
  },
];

const LEVELS: Record<string, { color: string; bg: string }> = {
  Foundation: { color: "text-slate-400", bg: "bg-slate-500/10" },
  Practitioner: { color: "text-primary-accent", bg: "bg-primary-accent/10" },
  Advanced: { color: "text-orange-400", bg: "bg-orange-500/10" },
  Expert: { color: "text-red-400", bg: "bg-red-500/10" },
};

export default function CoursesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link
        href="/academy"
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"
      >
        <ArrowLeft size={14} /> Academy
      </Link>

      <div className="mt-6 mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-accent mb-3">Courses</p>
        <h1 className="text-3xl font-bold text-text-primary md:text-4xl">
          40+ Enterprise AI Courses
        </h1>
        <p className="mt-3 text-text-secondary max-w-2xl">
          Practitioner-built, hands-on courses covering the full AI delivery lifecycle. Every course includes lab exercises in CerebroStudio™ and a certificate of completion.
        </p>
      </div>

      <div className="space-y-12">
        {CATEGORIES.map((cat) => (
          <section key={cat.id}>
            <div className="flex items-center gap-3 mb-5">
              <span className={`text-[10px] font-bold uppercase tracking-[0.3em] ${cat.color}`}>
                {cat.label}
              </span>
              <div className={`h-px flex-1 border-t ${cat.border}`} />
              <span className="text-xs text-text-secondary">{cat.courses.length} courses</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {cat.courses.map((course) => {
                const lvl = LEVELS[course.level] ?? LEVELS.Practitioner;
                return (
                  <div
                    key={course.code}
                    className={`rounded-xl border ${cat.border} ${cat.bg} p-4 flex items-start justify-between gap-3`}
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-text-secondary">{course.code}</span>
                      <p className="text-sm font-semibold text-text-primary mt-0.5 leading-snug">
                        {course.name}
                      </p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${lvl.bg} ${lvl.color}`}
                      >
                        {course.level}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-text-secondary">
                        <Clock size={10} /> {course.duration}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-14 rounded-2xl border border-border bg-surface/40 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-bold text-text-primary">Ready to enroll?</p>
          <p className="text-sm text-text-secondary mt-0.5">
            Contact us for individual access or team licensing pricing.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-accent text-background font-bold text-sm hover:opacity-90 transition-opacity shrink-0"
        >
          Get Access <ArrowRight size={14} />
        </Link>
      </div>
    </main>
  );
}
