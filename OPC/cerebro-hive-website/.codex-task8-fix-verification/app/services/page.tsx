"use client";

import Link from "next/link";
import { Lightbulb, Wrench, Settings, Shield, Globe } from "lucide-react";

const CATEGORIES = [
  {
    code: "A",
    label: "Strategy & Advisory",
    href: "/services/strategy",
    icon: Lightbulb,
    color: "border-purple-500/30 bg-purple-500/5 hover:border-purple-500/60 text-purple-400",
    badge: "border-purple-500/40 text-purple-400",
    services: [
      { code: "SA-01", name: "Enterprise AI Strategy & Roadmap", price: "$45K" },
      { code: "SA-02", name: "AI Readiness Assessment", price: "$18K" },
      { code: "SA-03", name: "AI Transformation Roadmap", price: "$28K" },
      { code: "SA-04", name: "Architecture Design (Intelligence Mesh Blueprint)", price: "$65K" },
      { code: "SA-05", name: "Data Strategy & Governance Design", price: "$40K" },
      { code: "SA-06", name: "AI Governance Framework Design", price: "$55K" },
      { code: "SA-07", name: "Responsible AI Advisory", price: "$35K" },
      { code: "SA-08", name: "AI Center of Excellence Design", price: "$75K" },
      { code: "SA-09", name: "Executive AI Leadership Workshops", price: "$12K" },
      { code: "SA-10", name: "Digital Transformation Advisory", price: "$120K" },
    ],
  },
  {
    code: "B",
    label: "Engineering & Implementation",
    href: "/services/engineering",
    icon: Wrench,
    color: "border-primary-accent/30 bg-primary-accent/5 hover:border-primary-accent/60 text-primary-accent",
    badge: "border-primary-accent/40 text-primary-accent",
    services: [
      { code: "EI-01", name: "Enterprise RAG Implementation", price: "$65K" },
      { code: "EI-02", name: "Knowledge Graph Engineering", price: "$85K" },
      { code: "EI-03", name: "Custom AI Agent Development", price: "$35K/agent" },
      { code: "EI-04", name: "Workflow Automation Engineering", price: "$28K/flow" },
      { code: "EI-05", name: "AI Platform Deployment", price: "$55K" },
      { code: "EI-06", name: "API Integration Services", price: "$18K/integration" },
      { code: "EI-07", name: "Data Engineering & ETL", price: "$50K" },
      { code: "EI-08", name: "Enterprise Search Implementation", price: "$55K" },
      { code: "EI-09", name: "Cloud Migration", price: "$80K" },
      { code: "EI-10", name: "Legacy Modernization", price: "$150K" },
    ],
  },
  {
    code: "C",
    label: "AI Operations",
    href: "/services/operations",
    icon: Settings,
    color: "border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-500/60 text-yellow-400",
    badge: "border-yellow-500/40 text-yellow-400",
    services: [
      { code: "AO-01", name: "AgentOps", price: "$8K/mo" },
      { code: "AO-02", name: "MLOps", price: "$12K/mo" },
      { code: "AO-03", name: "LLMOps", price: "$10K/mo" },
      { code: "AO-04", name: "Prompt Engineering Services", price: "$15K" },
      { code: "AO-05", name: "Model Fine-Tuning", price: "$40K" },
      { code: "AO-06", name: "AI Evaluation & Benchmarking", price: "$30K" },
      { code: "AO-07", name: "Platform Reliability Engineering", price: "$12K/mo" },
      { code: "AO-08", name: "Observability Implementation", price: "$35K" },
      { code: "AO-09", name: "FinOps for AI", price: "$25K+" },
      { code: "AO-10", name: "AI Performance Optimization", price: "$35K" },
    ],
  },
  {
    code: "D",
    label: "Security & Governance",
    href: "/services/security",
    icon: Shield,
    color: "border-red-500/30 bg-red-500/5 hover:border-red-500/60 text-red-400",
    badge: "border-red-500/40 text-red-400",
    services: [
      { code: "SG-01", name: "AI Security Assessment", price: "$40K" },
      { code: "SG-02", name: "AI Red Teaming", price: "$55K" },
      { code: "SG-03", name: "Compliance Automation", price: "$50K" },
      { code: "SG-04", name: "Enterprise Risk Assessment", price: "$45K" },
      { code: "SG-05", name: "Identity Modernization", price: "$55K" },
      { code: "SG-06", name: "Zero Trust Implementation", price: "$75K" },
      { code: "SG-07", name: "AI Governance Program", price: "$90K setup" },
      { code: "SG-08", name: "Audit Automation", price: "$45K" },
      { code: "SG-09", name: "Data Privacy Assessment", price: "$38K" },
      { code: "SG-10", name: "Business Continuity Planning", price: "$35K" },
    ],
  },
  {
    code: "E",
    label: "Industry Solutions",
    href: "/services/industry",
    icon: Globe,
    color: "border-orange-500/30 bg-orange-500/5 hover:border-orange-500/60 text-orange-400",
    badge: "border-orange-500/40 text-orange-400",
    services: [
      { code: "IS-01", name: "Healthcare AI Transformation", price: "$150K" },
      { code: "IS-02", name: "Banking & Financial Services Modernization", price: "$200K" },
      { code: "IS-03", name: "Insurance AI Enablement", price: "$140K" },
      { code: "IS-04", name: "Manufacturing Industry 4.0", price: "$180K" },
      { code: "IS-05", name: "Retail & eCommerce Intelligence", price: "$120K" },
      { code: "IS-06", name: "Supply Chain Optimization", price: "$160K" },
      { code: "IS-07", name: "Government Digital Transformation", price: "$200K" },
      { code: "IS-08", name: "Education & Learning Transformation", price: "$90K" },
      { code: "IS-09", name: "Energy & Utilities Optimization", price: "$180K" },
      { code: "IS-10", name: "Telecommunications AI Transformation", price: "$175K" },
    ],
  },
];

const MODELS = [
  { name: "Project", desc: "Fixed-scope, fixed-price delivery", timeline: "2–36 weeks" },
  { name: "Retainer", desc: "Ongoing managed service with monthly SLA", timeline: "Monthly" },
  { name: "Time & Materials", desc: "Flexible hourly engagement for advisory", timeline: "As needed" },
  { name: "Outcome-Based", desc: "Success fee tied to measurable business outcome", timeline: "Post-delivery" },
];

export default function ServicesIndexPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-32 pt-12">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-accent">
        CerebroHive™ Enterprise Services
      </p>
      <h1 className="mt-3 text-4xl font-bold text-text-primary md:text-5xl">Services</h1>
      <p className="mt-4 max-w-2xl text-lg text-text-secondary">
        50 enterprise services across strategy, engineering, AI operations, security, and industry verticals. Every engagement is backed by the CerebroHive platform and delivered by specialists with deep AI and domain expertise.
      </p>
      <div className="mt-4 flex items-center gap-6 text-xs text-text-secondary">
        <span><span className="font-bold text-primary-accent">50</span> services</span>
        <span><span className="font-bold text-text-primary">5</span> categories</span>
        <span><span className="font-bold text-text-primary">4</span> engagement models</span>
      </div>

      <div className="mt-12 space-y-10">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <section key={cat.code}>
              <Link href={cat.href} className="group inline-flex items-center gap-3 mb-4">
                <Icon size={20} className={cat.color.split(" ")[3]} />
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-text-secondary group-hover:text-text-primary transition-colors">
                  Category {cat.code} — {cat.label}
                </h2>
                <span className="text-xs text-text-secondary group-hover:text-primary-accent transition-colors">→ View all 10 →</span>
              </Link>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {cat.services.map(svc => (
                  <Link key={svc.code} href={`${cat.href}#${svc.code.toLowerCase()}`}>
                    <div className={`group rounded-xl border p-4 transition-all duration-200 h-full ${cat.color.split(" ").slice(0, 3).join(" ")}`}>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cat.badge}`}>
                        {svc.code}
                      </span>
                      <p className="mt-2 text-xs font-semibold text-text-primary group-hover:text-primary-accent transition-colors leading-snug">
                        {svc.name}
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">from {svc.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-16 rounded-2xl border border-border bg-surface/40 p-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary mb-4">Engagement Models</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODELS.map(m => (
            <div key={m.name} className="rounded-xl border border-border bg-surface-elevated/40 p-4">
              <p className="font-bold text-text-primary">{m.name}</p>
              <p className="mt-1 text-xs text-text-secondary">{m.desc}</p>
              <p className="mt-2 text-xs font-semibold text-primary-accent">{m.timeline}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
