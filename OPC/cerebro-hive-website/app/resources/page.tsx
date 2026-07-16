"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, FileText, BookOpen, Wrench, LayoutTemplate, ChevronRight } from "lucide-react";
import Link from "next/link";

const hubs = [
  {
    href: "/resources/whitepapers",
    icon: FileText,
    color: "#00F57A",
    label: "Whitepapers",
    title: "Original Research & Frameworks",
    desc: "In-depth technical whitepapers on enterprise AI architecture, deployment patterns, and governance frameworks authored by the CerebroHive research team.",
    count: "12 Documents",
    cta: "Browse Whitepapers",
  },
  {
    href: "/resources/blog",
    icon: BookOpen,
    color: "#00E5FF",
    label: "Engineering Blog",
    title: "Technical Deep-Dives",
    desc: "Engineering articles on LLMs, agents, data pipelines, infrastructure, and real-world implementation challenges from the CerebroHive engineering team.",
    count: "24 Articles",
    cta: "Read Blog",
  },
  {
    href: "/resources/templates",
    icon: LayoutTemplate,
    color: "#7B61FF",
    label: "Templates",
    title: "Ready-to-Use Templates",
    desc: "Architecture diagrams, project planning templates, AI readiness assessments, and RFP frameworks for enterprise AI initiatives.",
    count: "18 Templates",
    cta: "Download Templates",
  },
  {
    href: "/resources/ai-tools-directory",
    icon: Wrench,
    color: "#FF9500",
    label: "AI Tools Directory",
    title: "Curated Tool Landscape",
    desc: "A vendor-neutral, category-organized directory of enterprise AI tools, platforms, and vendors — evaluated by our architects for production readiness.",
    count: "150+ Tools",
    cta: "Explore Directory",
  },
];

const featured = [
  { title: "CerebroSphere Enterprise AI Framework", type: "Whitepaper", href: "/resources/whitepapers", color: "#00F57A" },
  { title: "AI Readiness Assessment Template", type: "Template", href: "/resources/templates", color: "#7B61FF" },
  { title: "Building Production RAG Systems", type: "Blog", href: "/resources/blog", color: "#00E5FF" },
  { title: "Enterprise LLM Evaluation Guide", type: "Whitepaper", href: "/resources/whitepapers", color: "#00F57A" },
  { title: "AI Project RFP Template", type: "Template", href: "/resources/templates", color: "#7B61FF" },
  { title: "Multi-Agent Architecture Patterns", type: "Blog", href: "/resources/blog", color: "#00E5FF" },
];

export default function ResourcesPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(0,245,122,0.05),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] dark:block hidden" style={{ backgroundSize: '48px 48px' }} />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="container-wide flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary-accent animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Knowledge Library</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-space font-bold text-text-primary leading-[1.1] tracking-tight mb-6 max-w-4xl">
            Resources for<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-[#00E5FF]">Enterprise AI Leaders</span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary font-inter max-w-2xl leading-relaxed">
            Whitepapers, engineering guides, ready-to-use templates, and a curated AI tools directory — everything you need to plan and execute enterprise AI initiatives.
          </p>
        </motion.div>
      </section>

      {/* Hub Cards */}
      <section className="section-pad border-b border-border">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hubs.map((hub, i) => (
              <motion.div key={hub.href} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}>
                <Link href={hub.href} className="group block h-full">
                  <div className="h-full flex flex-col p-8 rounded-2xl bg-surface border border-border hover:border-primary-accent/40 transition-all hover:-translate-y-1 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: hub.color }} />
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${hub.color}15`, border: `1px solid ${hub.color}30` }}>
                        <hub.icon size={28} style={{ color: hub.color }} strokeWidth={1.5} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: hub.color }}>{hub.count}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 block">{hub.label}</span>
                    <h2 className="text-xl font-space font-bold text-text-primary mb-3 group-hover:text-primary-accent transition-colors">{hub.title}</h2>
                    <p className="text-text-secondary text-sm leading-relaxed flex-1 mb-6">{hub.desc}</p>
                    <div className="flex items-center gap-2 font-space font-bold text-sm" style={{ color: hub.color }}>
                      {hub.cta} <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Downloads */}
      <section className="section-pad bg-surface-elevated border-b border-border">
        <div className="container-wide">
          <div className="text-center mb-12">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-3 block">Most Downloaded</span>
            <h2 className="text-4xl font-space font-bold text-text-primary mb-4">Featured Resources</h2>
            <p className="text-text-secondary max-w-xl mx-auto">The resources enterprise teams download most when planning AI initiatives.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.07 }}>
                <Link href={f.href} className="group flex items-center justify-between p-5 rounded-xl bg-background border border-border hover:border-primary-accent/40 transition-all hover:-translate-y-0.5">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-10 rounded-full" style={{ backgroundColor: f.color }} />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">{f.type}</div>
                      <div className="font-space font-bold text-text-primary text-sm group-hover:text-primary-accent transition-colors">{f.title}</div>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-text-muted group-hover:text-primary-accent group-hover:translate-x-1 transition-all shrink-0 ml-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad">
        <div className="container-wide max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-space font-bold text-text-primary mb-4">Looking for Something Specific?</h2>
          <p className="text-text-secondary mb-8">Our team can create custom architecture assessments, solution briefs, and technical guides tailored to your initiative.</p>
          <Link href="/contact" className="inline-flex items-center gap-3 px-8 py-4 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-xl hover:-translate-y-0.5 transition-transform shadow-elevated">
            Talk to an Architect <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
