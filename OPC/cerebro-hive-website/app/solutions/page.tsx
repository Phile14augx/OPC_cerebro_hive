"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronRight, BrainCircuit, Bot, Database, FileSearch, BookOpen, Zap, BarChart3, TrendingUp, Users, Cloud, Server, ShieldCheck, Star, Clock, Building2 } from "lucide-react";
import Link from "next/link";
import { InteractiveSolutionExplorer } from "@/components/solutions/InteractiveSolutionExplorer";
import { ROICalculator } from "@/components/solutions/ROICalculator";

const categories = [
  { id: "all", label: "All Solutions" },
  { id: "ai", label: "AI & Generative AI" },
  { id: "automation", label: "Automation" },
  { id: "data", label: "Data & Analytics" },
  { id: "platform", label: "Platform & Cloud" },
];

const solutions = [
  {
    slug: "enterprise-ai",
    category: "ai",
    name: "Enterprise AI Platform",
    tagline: "Transform operations with a secure, scalable, outcome-driven AI platform.",
    industries: ["Financial Services", "Healthcare", "Manufacturing"],
    timeline: "12–16 Weeks",
    color: "#00F57A",
    icon: BrainCircuit,
    impact: "40% Cost Reduction",
  },
  {
    slug: "ai-agents",
    category: "ai",
    name: "AI Agent Systems",
    tagline: "Deploy autonomous multi-agent systems that execute complex workflows end-to-end.",
    industries: ["B2B SaaS", "Logistics", "Finance"],
    timeline: "8–12 Weeks",
    color: "#00E5FF",
    icon: Bot,
    impact: "3x Process Throughput",
  },
  {
    slug: "rag",
    category: "ai",
    name: "RAG & Knowledge Intelligence",
    tagline: "Build enterprise-grade retrieval-augmented generation systems on your private data.",
    industries: ["Legal", "Healthcare", "Technology"],
    timeline: "6–10 Weeks",
    color: "#7B61FF",
    icon: BookOpen,
    impact: "85% Query Resolution",
  },
  {
    slug: "document-ai",
    category: "ai",
    name: "Document AI",
    tagline: "Automate extraction, classification, and processing of enterprise documents at scale.",
    industries: ["Insurance", "Banking", "Government"],
    timeline: "6–8 Weeks",
    color: "#FF9500",
    icon: FileSearch,
    impact: "90% Processing Automation",
  },
  {
    slug: "knowledge-management",
    category: "ai",
    name: "Knowledge Management",
    tagline: "Unify institutional knowledge into a searchable, intelligent enterprise memory layer.",
    industries: ["Professional Services", "Technology", "Education"],
    timeline: "8–12 Weeks",
    color: "#00F57A",
    icon: Database,
    impact: "60% Faster Knowledge Access",
  },
  {
    slug: "hyperautomation",
    category: "automation",
    name: "Hyperautomation",
    tagline: "End-to-end process automation combining RPA, AI, and intelligent workflow orchestration.",
    industries: ["Finance", "HR", "Supply Chain"],
    timeline: "10–16 Weeks",
    color: "#FF6B6B",
    icon: Zap,
    impact: "10x Faster Execution",
  },
  {
    slug: "decision-intelligence",
    category: "data",
    name: "Decision Intelligence",
    tagline: "AI-powered decision support systems that turn data into executive-ready insights.",
    industries: ["Retail", "Financial Services", "Manufacturing"],
    timeline: "8–14 Weeks",
    color: "#00E5FF",
    icon: BarChart3,
    impact: "92% Forecast Accuracy",
  },
  {
    slug: "predictive-analytics",
    category: "data",
    name: "Predictive Analytics",
    tagline: "Machine learning models for demand forecasting, churn prediction, and anomaly detection.",
    industries: ["E-Commerce", "Telecom", "Healthcare"],
    timeline: "8–12 Weeks",
    color: "#7B61FF",
    icon: TrendingUp,
    impact: "35% Churn Reduction",
  },
  {
    slug: "customer-experience",
    category: "automation",
    name: "Customer Experience AI",
    tagline: "Omnichannel AI for support, personalization, and customer lifecycle intelligence.",
    industries: ["Retail", "Banking", "Hospitality"],
    timeline: "8–12 Weeks",
    color: "#FF9500",
    icon: Users,
    impact: "65% Deflection Rate",
  },
  {
    slug: "erp-modernization",
    category: "platform",
    name: "ERP Modernization",
    tagline: "Migrate, modernize, and AI-augment legacy ERP systems for the cloud-native era.",
    industries: ["Manufacturing", "Distribution", "Services"],
    timeline: "16–24 Weeks",
    color: "#00F57A",
    icon: Server,
    impact: "30% OpEx Reduction",
  },
  {
    slug: "cloud-modernization",
    category: "platform",
    name: "Cloud Modernization",
    tagline: "Lift-and-shift, re-architect, and cloud-native transformation for enterprise systems.",
    industries: ["Technology", "Financial Services", "Healthcare"],
    timeline: "12–20 Weeks",
    color: "#00E5FF",
    icon: Cloud,
    impact: "99.99% Availability",
  },
  {
    slug: "ai-governance",
    category: "ai",
    name: "AI Governance & Compliance",
    tagline: "Enterprise AI governance frameworks, audit trails, and responsible AI implementation.",
    industries: ["Financial Services", "Healthcare", "Government"],
    timeline: "6–10 Weeks",
    color: "#FF6B6B",
    icon: ShieldCheck,
    impact: "Full Regulatory Alignment",
  },
];

export default function SolutionsIndexPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const filtered = activeCategory === "all" ? solutions : solutions.filter(s => s.category === activeCategory);

  return (
    <div className="bg-background min-h-screen selection:bg-primary-accent/30">

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(0,245,122,0.06),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] dark:block hidden" style={{ backgroundSize: '48px 48px' }} />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="container-wide flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 backdrop-blur-sm shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary-accent animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Outcome-Driven Architecture</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-space font-bold text-text-primary leading-[1.1] tracking-tight mb-6 max-w-4xl">
            Enterprise AI Solutions<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-[#00E5FF]">Built for Business Outcomes</span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary font-inter max-w-2xl leading-relaxed mb-10">
            12 production-proven solutions. Every one designed around measurable business outcomes, not technology demos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#solutions" className="px-8 py-4 bg-primary-accent text-black font-space font-bold text-sm uppercase tracking-widest rounded-xl flex items-center gap-3 hover:-translate-y-0.5 transition-transform shadow-elevated">
              Browse Solutions <ArrowRight size={16} />
            </a>
            <Link href="/contact" className="px-8 py-4 bg-surface border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-xl hover:border-primary-accent/40 hover:bg-surface-elevated transition-all">
              Book Strategy Workshop
            </Link>
          </div>
        </motion.div>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted">
          <span className="text-[10px] uppercase tracking-widest">Explore</span>
          <div className="w-px h-8 bg-gradient-to-b from-text-muted to-transparent" />
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="section-pad-sm border-b border-border bg-surface-elevated">
        <div className="container-wide grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: Star, value: "12", label: "Proven Solutions" },
            { icon: Building2, value: "50+", label: "Enterprises Served" },
            { icon: Clock, value: "90 Days", label: "Average Time to Impact" },
            { icon: TrendingUp, value: "$1.2B+", label: "Value Generated" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="flex flex-col items-center text-center">
              <s.icon size={26} className="text-primary-accent mb-3" strokeWidth={1.5} />
              <span className="text-3xl font-space font-bold text-text-primary mb-1">{s.value}</span>
              <span className="text-xs uppercase tracking-widest text-text-muted font-bold">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Solutions Grid */}
      <section id="solutions" className="section-pad border-b border-border">
        <div className="container-wide">
          <div className="text-center mb-12">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-3 block">Solution Catalog</span>
            <h2 className="text-4xl md:text-5xl font-space font-bold text-text-primary mb-4">Choose Your Outcome</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">Each solution is a pre-architected, enterprise-grade engagement model with defined scope, timeline, and measurable outcomes.</p>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mb-10 overflow-x-auto no-scrollbar justify-center flex-wrap">
            {categories.map((c) => (
              <button key={c.id} onClick={() => setActiveCategory(c.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                  activeCategory === c.id ? "bg-primary-accent text-black" : "bg-surface border border-border text-text-muted hover:border-primary-accent/40 hover:text-text-primary"
                }`}>
                {c.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((sol, i) => (
                <motion.div key={sol.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  onMouseEnter={() => setHoveredSlug(sol.slug)}
                  onMouseLeave={() => setHoveredSlug(null)}
                >
                  <Link href={`/solutions/${sol.slug}`} className="group block h-full">
                    <div className="relative h-full flex flex-col p-6 rounded-2xl bg-surface border border-border transition-all duration-300 overflow-hidden"
                      style={{ borderColor: hoveredSlug === sol.slug ? `${sol.color}60` : undefined }}>
                      {/* Top accent bar */}
                      <div className="absolute top-0 left-0 w-full h-0.5 transition-all duration-300"
                        style={{ backgroundColor: sol.color, opacity: hoveredSlug === sol.slug ? 1 : 0.4 }} />

                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300"
                        style={{ backgroundColor: `${sol.color}15`, border: `1px solid ${sol.color}30` }}>
                        <sol.icon size={22} style={{ color: sol.color }} strokeWidth={1.5} />
                      </div>

                      {/* Content */}
                      <h3 className="font-space font-bold text-text-primary text-base mb-2 leading-tight group-hover:text-primary-accent transition-colors">{sol.name}</h3>
                      <p className="text-text-secondary text-xs leading-relaxed mb-5 flex-1">{sol.tagline}</p>

                      {/* Industries */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {sol.industries.map((ind) => (
                          <span key={ind} className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-surface-elevated border border-border text-text-muted">{ind}</span>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] uppercase tracking-widest text-text-muted font-bold">Impact</span>
                          <span className="text-xs font-bold" style={{ color: sol.color }}>{sol.impact}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-text-muted">
                          <Clock size={10} />
                          <span>{sol.timeline}</span>
                        </div>
                      </div>

                      {/* Hover arrow */}
                      <motion.div
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: hoveredSlug === sol.slug ? 1 : 0, x: hoveredSlug === sol.slug ? 0 : -4 }}
                        className="absolute bottom-6 right-6 flex items-center gap-1 text-xs font-bold"
                        style={{ color: sol.color }}
                      >
                        Explore <ChevronRight size={14} />
                      </motion.div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Interactive Explorer */}
      <InteractiveSolutionExplorer />

      {/* ROI Calculator */}
      <ROICalculator />

      {/* CTA */}
      <section className="section-pad bg-surface-elevated border-t border-border">
        <div className="container-wide max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-space font-bold text-text-primary mb-4">Not Sure Which Solution Fits?</h2>
          <p className="text-text-secondary mb-8 text-lg">Our architects will assess your challenge and recommend the right engagement model in a 30-minute discovery call — at no cost.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="px-8 py-4 bg-primary-accent text-black font-space font-bold text-sm uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 hover:-translate-y-0.5 transition-transform shadow-elevated">
              Book Free Discovery Call <ArrowRight size={16} />
            </Link>
            <Link href="/tools/solution-finder" className="px-8 py-4 bg-surface border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-xl hover:border-primary-accent/40 hover:bg-surface-elevated transition-all text-center">
              Use Solution Finder →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
