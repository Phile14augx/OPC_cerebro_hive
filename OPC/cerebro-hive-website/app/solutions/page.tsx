import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Solutions — Enterprise AI Use Cases",
  description: "12 enterprise AI solution packages — from RAG systems to AI governance, ERP modernization to hyperautomation.",
};

const SOLUTIONS = [
  {
    slug: "enterprise-ai",
    name: "Enterprise AI Strategy",
    category: "Strategy",
    color: "text-purple-400",
    border: "border-purple-500/30",
    bg: "bg-purple-500/5",
    tagline: "Board-approved AI roadmap in 4–6 weeks.",
    outcomes: ["3-year implementation roadmap", "ROI-sequenced use case prioritization", "Executive alignment workshop"],
  },
  {
    slug: "ai-agents",
    name: "AI Agents",
    category: "AI Runtime",
    color: "text-primary-accent",
    border: "border-primary-accent/30",
    bg: "bg-primary-accent/5",
    tagline: "Autonomous agents that complete real enterprise tasks.",
    outcomes: [">90% task completion rate", "<10% human intervention", "Full audit trail"],
  },
  {
    slug: "rag",
    name: "RAG Systems",
    category: "Knowledge",
    color: "text-cyan-400",
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/5",
    tagline: "Accurate, cited answers from your enterprise knowledge base.",
    outcomes: ["Retrieval precision >85%", "Query latency <500ms P99", ">90% document coverage"],
  },
  {
    slug: "document-ai",
    name: "Document AI",
    category: "Automation",
    color: "text-yellow-400",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/5",
    tagline: "Intelligent extraction and processing from any document type.",
    outcomes: ["Straight-through processing >70%", "Classification accuracy >95%", "Manual review reduced >60%"],
  },
  {
    slug: "knowledge-management",
    name: "Knowledge Management",
    category: "Knowledge",
    color: "text-teal-400",
    border: "border-teal-500/30",
    bg: "bg-teal-500/5",
    tagline: "Enterprise knowledge graph connecting people, systems, and expertise.",
    outcomes: ["Entity coverage >80%", "Search relevance +40%", "Knowledge decay eliminated"],
  },
  {
    slug: "hyperautomation",
    name: "Hyperautomation",
    category: "Operations",
    color: "text-orange-400",
    border: "border-orange-500/30",
    bg: "bg-orange-500/5",
    tagline: "End-to-end automation of complex, multi-step enterprise workflows.",
    outcomes: ["Manual effort reduced >70%", "SLA adherence >99%", "Error rate reduced >80%"],
  },
  {
    slug: "decision-intelligence",
    name: "Decision Intelligence",
    category: "Analytics",
    color: "text-blue-400",
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    tagline: "AI-augmented decision-making with explainable recommendations.",
    outcomes: ["Decision cycle time -50%", "Explainability documented", "Bias assessment complete"],
  },
  {
    slug: "predictive-analytics",
    name: "Predictive Analytics",
    category: "Analytics",
    color: "text-indigo-400",
    border: "border-indigo-500/30",
    bg: "bg-indigo-500/5",
    tagline: "ML models that predict what matters before it happens.",
    outcomes: ["Forecast accuracy +15–30%", "Automated retraining", "Drift detection <24h"],
  },
  {
    slug: "customer-experience",
    name: "Customer Experience AI",
    category: "CX",
    color: "text-pink-400",
    border: "border-pink-500/30",
    bg: "bg-pink-500/5",
    tagline: "Personalized, AI-native customer interactions across every channel.",
    outcomes: ["AI containment rate >65%", "Customer NPS +5–10 points", "CSAT improvement >15%"],
  },
  {
    slug: "erp-modernization",
    name: "ERP Modernization",
    category: "Enterprise Systems",
    color: "text-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
    tagline: "Replace legacy ERPs incrementally with AI-native equivalents.",
    outcomes: ["Zero big-bang rewrite risk", "Phase 1 on time + budget", "Legacy load reduced by target %"],
  },
  {
    slug: "cloud-modernization",
    name: "Cloud Modernization",
    category: "Infrastructure",
    color: "text-sky-400",
    border: "border-sky-500/30",
    bg: "bg-sky-500/5",
    tagline: "AI workloads migrated to cloud with improved performance and lower cost.",
    outcomes: ["Zero data loss migration", "Infrastructure cost -20%+", "Resilience SLA improved"],
  },
  {
    slug: "ai-governance",
    name: "AI Governance",
    category: "Governance",
    color: "text-red-400",
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    tagline: "Running AI governance program — not just a policy document.",
    outcomes: ["ISO 42001 + NIST AI RMF aligned", "AI system inventory 100%", "Board-approved governance program"],
  },
];

export default function SolutionsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-12">
      <div className="text-center mb-14">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-accent mb-3">Solutions</p>
        <h1 className="font-space text-4xl font-bold text-text-primary md:text-5xl">
          Enterprise AI — Packaged for Outcomes
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-text-secondary text-lg">
          12 solution packages. Each with defined scope, timeline, deliverables, and quantified success metrics.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {SOLUTIONS.map((s) => (
          <Link
            key={s.slug}
            href={`/solutions/${s.slug}`}
            className={`group rounded-2xl border ${s.border} ${s.bg} p-6 hover:shadow-lg transition-all`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${s.color}`}>{s.category}</span>
              <ArrowRight size={14} className={`${s.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </div>
            <h2 className="text-base font-bold text-text-primary mb-2">{s.name}</h2>
            <p className="text-sm text-text-secondary mb-4">{s.tagline}</p>
            <ul className="space-y-1.5">
              {s.outcomes.map((o) => (
                <li key={o} className="flex items-center gap-2 text-xs text-text-secondary">
                  <span className={`shrink-0 ${s.color}`}>✓</span>{o}
                </li>
              ))}
            </ul>
          </Link>
        ))}
      </div>

      <div className="mt-14 rounded-2xl border border-border bg-surface/40 p-8 text-center">
        <h2 className="font-space text-2xl font-bold text-text-primary mb-3">Not sure which solution fits?</h2>
        <p className="text-text-secondary mb-6">Start with an AI Readiness Assessment — we&apos;ll map your situation to the right solution mix.</p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-accent text-background font-bold text-sm hover:opacity-90 transition-opacity"
        >
          Book a Discovery Call <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  );
}
