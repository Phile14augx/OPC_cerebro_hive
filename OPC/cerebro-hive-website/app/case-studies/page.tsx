"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Clock, Building2, ChevronRight, BarChart3, Filter } from "lucide-react";
import { TrackedLink } from "@/components/ui/TrackedLink";

const filters = ["All", "AI & Automation", "Sales Intelligence", "Enterprise Training", "Logistics"];

const caseStudies = [
  {
    href: "/case-studies/sales-pipeline-automation",
    industry: "B2B SaaS",
    service: "AI & Automation",
    serviceTag: "AI & Automation",
    title: "3x Pipeline Growth: AI-Powered Sales Intelligence for a B2B SaaS Company",
    summary: "Replaced a manual, spreadsheet-driven SDR workflow with a multi-agent system that scores, enriches, and prioritizes leads in real-time — tripling qualified pipeline in 90 days.",
    metrics: [
      { value: "3x", label: "Qualified Leads" },
      { value: "85%", label: "CRM Accuracy" },
      { value: "180h", label: "Saved/Rep/Mo" },
    ],
    timeline: "90 Days",
    color: "#00F57A",
  },
  {
    href: "/case-studies/logistics-support-automation",
    industry: "3PL Logistics",
    service: "AI & Automation",
    serviceTag: "AI & Automation",
    title: "65% Ticket Deflection: Autonomous Support for a Global Logistics Operator",
    summary: "Built an AI-native support layer that resolves 65% of inbound logistics queries autonomously, reducing response time from 4 hours to under 3 minutes at enterprise scale.",
    metrics: [
      { value: "65%", label: "Ticket Deflection" },
      { value: "3 min", label: "Avg Response" },
      { value: "4h→3m", label: "Resolution Time" },
    ],
    timeline: "60 Days",
    color: "#00E5FF",
  },
  {
    href: "/case-studies/corporate-ai-training",
    industry: "Financial Services",
    service: "Enterprise Training",
    serviceTag: "Enterprise Training",
    title: "AI Literacy at Scale: Corporate AI Training for a Tier-1 Bank",
    summary: "Designed and delivered a 12-week AI literacy and readiness program for 800+ employees across risk, compliance, and operations — enabling the bank's internal AI initiative.",
    metrics: [
      { value: "800+", label: "Employees Trained" },
      { value: "94%", label: "Completion Rate" },
      { value: "12 Wks", label: "Program Duration" },
    ],
    timeline: "12 Weeks",
    color: "#7B61FF",
  },
];

const globalStats = [
  { value: "50+", label: "Engagements Completed", icon: BarChart3 },
  { value: "$1.2B+", label: "Client Value Generated", icon: TrendingUp },
  { value: "12", label: "Industry Verticals", icon: Building2 },
  { value: "90 Days", label: "Avg Time to Impact", icon: Clock },
];

export default function CaseStudiesPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = activeFilter === "All" ? caseStudies : caseStudies.filter(c => c.serviceTag === activeFilter);

  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(0,245,122,0.06),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] dark:block hidden" style={{ backgroundSize: '48px 48px' }} />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="container-wide flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary-accent animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Measurable Enterprise Impact</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-space font-bold text-text-primary leading-[1.1] tracking-tight mb-6 max-w-4xl">
            Enterprise Outcomes<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-[#00E5FF]">That Speak for Themselves</span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary font-inter max-w-2xl leading-relaxed mb-10">
            Real implementations. Real organizations. Real results — measured, documented, and independently verifiable.
          </p>
          <Link href="#studies" className="px-8 py-4 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-xl flex items-center gap-3 hover:-translate-y-0.5 transition-transform shadow-elevated">
            View Case Studies <ArrowRight size={16} />
          </TrackedLink>
        </motion.div>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted">
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-text-muted to-transparent" />
        </motion.div>
      </section>

      {/* Global Stats */}
      <section className="section-pad-sm border-b border-border bg-surface-elevated">
        <div className="container-wide grid grid-cols-2 md:grid-cols-4 gap-8">
          {globalStats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="flex flex-col items-center text-center">
              <s.icon size={28} className="text-primary-accent mb-3" strokeWidth={1.5} />
              <span className="text-4xl font-space font-bold text-text-primary mb-1">{s.value}</span>
              <span className="text-xs uppercase tracking-widest text-text-muted font-bold">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Filter + Case Studies */}
      <section id="studies" className="section-pad">
        <div className="container-wide">
          {/* Filter Bar */}
          <div className="flex items-center gap-2 mb-12 flex-wrap">
            <Filter size={14} className="text-text-muted" />
            {filters.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  activeFilter === f ? "bg-primary-accent text-text-primary" : "bg-surface border border-border text-text-muted hover:border-primary-accent/40 hover:text-text-primary"
                }`}>
                {f}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-8">
            {filtered.map((cs, i) => (
              <motion.div key={cs.href} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}>
                <Link href={cs.href} className="group block">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-8 md:p-10 rounded-2xl bg-surface border border-border hover:border-primary-accent/40 transition-all hover:-translate-y-1 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl" style={{ backgroundColor: cs.color }} />
                    {/* Content */}
                    <div className="lg:col-span-3 flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: cs.color }}>{cs.serviceTag}</span>
                        <span className="text-[10px] text-text-muted uppercase tracking-widest">— {cs.industry}</span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-space font-bold text-text-primary leading-tight group-hover:text-primary-accent transition-colors">{cs.title}</h2>
                      <p className="text-text-secondary text-sm leading-relaxed">{cs.summary}</p>
                      <div className="flex items-center gap-2 text-primary-accent text-sm font-bold mt-2">
                        Read Full Case Study <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                    {/* Metrics */}
                    <div className="lg:col-span-2 grid grid-cols-3 gap-4 lg:border-l lg:border-border lg:pl-8 items-center">
                      {cs.metrics.map((m) => (
                        <div key={m.label} className="flex flex-col items-center text-center">
                          <span className="text-3xl font-space font-bold" style={{ color: cs.color }}>{m.value}</span>
                          <span className="text-[10px] uppercase tracking-widest text-text-muted mt-1 font-bold">{m.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TrackedLink>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad bg-surface-elevated border-t border-border">
        <div className="container-wide max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-space font-bold text-text-primary mb-4">Ready to Be Our Next Case Study?</h2>
          <p className="text-text-secondary mb-8">Join the organizations transforming their operations with AI-native engineering.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <TrackedLink href="/contact" analyticsEvent="cta_click" analyticsCategory="conversion" analyticsLabel="Start Your Initiative — Case Studies" className="px-8 py-4 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 hover:-translate-y-0.5 transition-transform shadow-elevated">
              Start Your Initiative <ArrowRight size={16} />
            </TrackedLink>
            <TrackedLink href="/solutions" analyticsEvent="cta_click" analyticsCategory="engagement" analyticsLabel="Explore Solutions — Case Studies" className="px-8 py-4 bg-surface border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-xl hover:border-primary-accent/40 hover:bg-surface-elevated transition-all text-center">
              Explore Solutions
            </TrackedLink>
          </div>
        </div>
      </section>
    </div>
  );
}
