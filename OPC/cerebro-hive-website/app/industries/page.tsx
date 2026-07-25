import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Industries — AI Transformation Across 15 Verticals",
  description: "CerebroHive serves 15 industries with vertical-specific AI transformation programs built on proven patterns for regulatory and operational requirements.",
};

const INDUSTRIES = [
  { slug: "finance", name: "Financial Services", icon: "🏦", color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/5", tagline: "AI-powered banking, insurance, and capital markets.", useCases: ["Fraud detection", "Credit risk", "KYC/AML", "Algorithmic trading"] },
  { slug: "healthcare", name: "Healthcare", icon: "🏥", color: "text-rose-400", border: "border-rose-500/30", bg: "bg-rose-500/5", tagline: "Clinical AI and operational excellence within HIPAA.", useCases: ["Clinical documentation", "Prior auth automation", "Revenue cycle", "Care coordination"] },
  { slug: "manufacturing", name: "Manufacturing", icon: "🏭", color: "text-orange-400", border: "border-orange-500/30", bg: "bg-orange-500/5", tagline: "Industry 4.0 — predictive, autonomous, optimized.", useCases: ["Predictive maintenance", "Visual quality inspection", "Production scheduling", "OEE improvement"] },
  { slug: "retail", name: "Retail & eCommerce", icon: "🛍️", color: "text-pink-400", border: "border-pink-500/30", bg: "bg-pink-500/5", tagline: "Demand intelligence, personalization, and inventory AI.", useCases: ["Demand forecasting", "Personalization", "Inventory optimization", "Customer service AI"] },
  { slug: "government", name: "Government", icon: "🏛️", color: "text-slate-400", border: "border-slate-500/30", bg: "bg-slate-500/5", tagline: "Secure, compliant AI for public sector transformation.", useCases: ["Citizen service AI", "Document processing", "Procurement automation", "Compliance reporting"] },
  { slug: "insurance", name: "Insurance", icon: "🛡️", color: "text-indigo-400", border: "border-indigo-500/30", bg: "bg-indigo-500/5", tagline: "Underwriting AI, claims automation, and fraud detection.", useCases: ["Underwriting AI", "Claims triage", "Fraud detection", "FNOL automation"] },
  { slug: "energy", name: "Energy & Utilities", icon: "⚡", color: "text-yellow-400", border: "border-yellow-500/30", bg: "bg-yellow-500/5", tagline: "Grid intelligence, asset health, and demand optimization.", useCases: ["Asset health monitoring", "Demand forecasting", "Outage prediction", "Renewable integration"] },
  { slug: "construction", name: "Construction", icon: "🏗️", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/5", tagline: "Project intelligence, safety, and supply chain AI.", useCases: ["Project risk AI", "Safety monitoring", "Materials forecasting", "Subcontractor management"] },
  { slug: "real-estate", name: "Real Estate", icon: "🏢", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/5", tagline: "Valuation AI, tenant intelligence, and property operations.", useCases: ["Automated valuation", "Tenant churn prediction", "Property operations AI", "Market intelligence"] },
  { slug: "logistics", name: "Logistics & Supply Chain", icon: "🚚", color: "text-cyan-400", border: "border-cyan-500/30", bg: "bg-cyan-500/5", tagline: "Supply chain optimization, route intelligence, and resilience.", useCases: ["Route optimization", "Demand sensing", "Disruption prediction", "Supplier risk scoring"] },
  { slug: "education", name: "Education", icon: "🎓", color: "text-teal-400", border: "border-teal-500/30", bg: "bg-teal-500/5", tagline: "Adaptive learning, AI tutoring, and institutional analytics.", useCases: ["Adaptive learning", "AI tutoring", "Curriculum analytics", "Student engagement"] },
  { slug: "telecom", name: "Telecommunications", icon: "📡", color: "text-sky-400", border: "border-sky-500/30", bg: "bg-sky-500/5", tagline: "Network AI, churn prediction, and revenue assurance.", useCases: ["Network anomaly detection", "Predictive churn", "Revenue assurance", "5G optimization"] },
  { slug: "technology", name: "Technology", icon: "💻", color: "text-violet-400", border: "border-violet-500/30", bg: "bg-violet-500/5", tagline: "AI-native software development, DevOps, and GTM intelligence.", useCases: ["AI code review", "Predictive DevOps", "Customer success AI", "GTM intelligence"] },
  { slug: "media", name: "Media & Entertainment", icon: "🎬", color: "text-fuchsia-400", border: "border-fuchsia-500/30", bg: "bg-fuchsia-500/5", tagline: "Content intelligence, audience AI, and monetization.", useCases: ["Content recommendation", "Audience segmentation", "Ad targeting AI", "Rights management"] },
  { slug: "services", name: "Professional Services", icon: "💼", color: "text-lime-400", border: "border-lime-500/30", bg: "bg-lime-500/5", tagline: "AI-augmented delivery, knowledge management, and client intelligence.", useCases: ["Proposal automation", "Knowledge management", "Client health scoring", "Billing intelligence"] },
];

export default function IndustriesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-12">
      <div className="text-center mb-14">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-accent mb-3">Industries</p>
        <h1 className="font-space text-4xl font-bold text-text-primary md:text-5xl">
          15 Industries. Pre-Built AI Programs.
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-text-secondary text-lg">
          Vertical-specific AI transformation programs with pre-built patterns for each industry's unique regulatory and operational requirements.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {INDUSTRIES.map((ind) => (
          <Link
            key={ind.slug}
            href={`/industries/${ind.slug}`}
            className={`group rounded-2xl border ${ind.border} ${ind.bg} p-5 hover:shadow-lg transition-all`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{ind.icon}</span>
              <ArrowRight size={14} className={`${ind.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </div>
            <h2 className={`text-sm font-bold ${ind.color} uppercase tracking-wide mb-1`}>{ind.name}</h2>
            <p className="text-xs text-text-secondary mb-3">{ind.tagline}</p>
            <div className="flex flex-wrap gap-1">
              {ind.useCases.map((u) => (
                <span key={u} className={`text-[10px] px-2 py-0.5 rounded-full border ${ind.border} text-text-secondary`}>{u}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
