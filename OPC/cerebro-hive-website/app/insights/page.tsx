"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Lightbulb, Globe2, BarChart3, BookOpen, Megaphone, Calendar, Clock, Tag, ChevronRight } from "lucide-react";
import Link from "next/link";

// Editorial categories
const categories = [
  { id: "all", label: "All" },
  { id: "ai-strategy", label: "AI Strategy" },
  { id: "industry-trends", label: "Industry Trends" },
  { id: "executive-perspectives", label: "Executive Perspectives" },
  { id: "transformation", label: "Transformation" },
  { id: "announcements", label: "Announcements" },
];

const featuredInsight = {
  category: "AI Strategy",
  date: "July 2026",
  readTime: "12 min read",
  title: "The CIO's Playbook for Enterprise AI in 2026",
  subtitle: "How leading enterprises are moving from AI pilots to AI-native operations — and what separates the ones that succeed.",
  tag: "Featured",
  color: "#00F57A",
};

const insights = [
  {
    category: "ai-strategy",
    categoryLabel: "AI Strategy",
    date: "July 2026",
    readTime: "8 min",
    title: "Why 73% of Enterprise AI Projects Fail (And What the Successful 27% Do Differently)",
    desc: "After consulting on 50+ enterprise AI deployments, we've identified the structural patterns that separate transformative implementations from expensive experiments.",
    color: "#00F57A",
    icon: TrendingUp,
  },
  {
    category: "industry-trends",
    categoryLabel: "Industry Trends",
    date: "June 2026",
    readTime: "6 min",
    title: "The Rise of Agentic Operations: How AI Agents Are Replacing Entire Workflows",
    desc: "The next wave of enterprise AI isn't about chatbots — it's about autonomous agents that execute multi-step business processes without human intervention.",
    color: "#00E5FF",
    icon: Globe2,
  },
  {
    category: "executive-perspectives",
    categoryLabel: "Executive Perspectives",
    date: "June 2026",
    readTime: "10 min",
    title: "A Letter to Every CTO Considering an AI Transformation: Read This First",
    desc: "Before you approve that AI budget, there are ten questions your vendors won't ask you but your board absolutely will.",
    color: "#7B61FF",
    icon: Lightbulb,
  },
  {
    category: "transformation",
    categoryLabel: "Transformation",
    date: "May 2026",
    readTime: "7 min",
    title: "From Data Warehouse to Intelligence Layer: The Architectural Leap No One Talks About",
    desc: "Your data lake isn't the foundation of an AI strategy. Here's the architecture modern enterprises are building instead.",
    color: "#FF6B6B",
    icon: BarChart3,
  },
  {
    category: "ai-strategy",
    categoryLabel: "AI Strategy",
    date: "May 2026",
    readTime: "9 min",
    title: "Responsible AI at Enterprise Scale: Governance Frameworks That Actually Work",
    desc: "AI governance doesn't have to slow you down. The organizations moving fastest on AI also have the strongest guardrails.",
    color: "#00F57A",
    icon: BookOpen,
  },
  {
    category: "industry-trends",
    categoryLabel: "Industry Trends",
    date: "April 2026",
    readTime: "5 min",
    title: "Enterprise AI Spending Will Double in 2027: Where the Money Is Going",
    desc: "An analysis of enterprise AI budget allocations, vendor priorities, and the capabilities organizations are investing in ahead of the next adoption wave.",
    color: "#00E5FF",
    icon: TrendingUp,
  },
  {
    category: "announcements",
    categoryLabel: "Announcement",
    date: "April 2026",
    readTime: "3 min",
    title: "CerebroHive Launches CerebroSphere: Our Enterprise AI Operating Framework",
    desc: "After 18 months of development and validation across 12 enterprise deployments, we are making CerebroSphere publicly available as a reference architecture.",
    color: "#FF9500",
    icon: Megaphone,
  },
  {
    category: "executive-perspectives",
    categoryLabel: "Executive Perspectives",
    date: "March 2026",
    readTime: "11 min",
    title: "The Hidden Cost of AI Readiness: What No One Tells You Before the POC",
    desc: "Data quality, change management, and infrastructure readiness account for 60% of AI project timelines. We break down the hidden costs and how to plan for them.",
    color: "#7B61FF",
    icon: Lightbulb,
  },
  {
    category: "transformation",
    categoryLabel: "Transformation",
    date: "March 2026",
    readTime: "8 min",
    title: "AI-Native vs. AI-Augmented: The Organizational Design Decision That Changes Everything",
    desc: "There is a fundamental difference between adding AI to existing workflows and designing processes for AI from the ground up. One delivers 10% improvements, the other delivers 10x.",
    color: "#FF6B6B",
    icon: BarChart3,
  },
];

export default function InsightsPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all" ? insights : insights.filter(i => i.category === activeCategory);

  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(0,229,255,0.06),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] dark:block hidden" style={{ backgroundSize: '48px 48px' }} />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="container-wide relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Executive Intelligence</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-space font-bold text-text-primary leading-[1.1] tracking-tight mb-6">
                CerebroHive<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-primary-accent">Insights</span>
              </h1>
              <p className="text-lg md:text-xl text-text-secondary font-inter max-w-xl leading-relaxed mb-8">
                Strategic intelligence for technology leaders. AI strategy, industry trends, executive perspectives, and transformation stories from the frontier of enterprise AI.
              </p>
              <div className="flex items-center gap-3 text-sm text-text-muted">
                <BookOpen size={16} className="text-primary-accent" />
                <span>Published for CTOs, CIOs, Founders, and Enterprise Decision-Makers</span>
              </div>
            </div>
            {/* Featured Article Preview */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="relative p-8 rounded-2xl bg-surface border border-border shadow-elevated overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform">
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: featuredInsight.color }} />
              <div className="flex items-center gap-3 mb-5">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${featuredInsight.color}20`, color: featuredInsight.color }}>{featuredInsight.tag}</span>
                <span className="text-[10px] uppercase tracking-widest text-text-muted">{featuredInsight.category}</span>
              </div>
              <h2 className="text-2xl font-space font-bold text-text-primary mb-4 leading-tight group-hover:text-primary-accent transition-colors">{featuredInsight.title}</h2>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">{featuredInsight.subtitle}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-text-muted text-xs">
                  <span className="flex items-center gap-1.5"><Calendar size={12} /> {featuredInsight.date}</span>
                  <span className="flex items-center gap-1.5"><Clock size={12} /> {featuredInsight.readTime}</span>
                </div>
                <ChevronRight size={20} className="text-primary-accent group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </div>
        </motion.div>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted">
          <span className="text-[10px] uppercase tracking-widest">Explore</span>
          <div className="w-px h-8 bg-gradient-to-b from-text-muted to-transparent" />
        </motion.div>
      </section>

      {/* Category Filter */}
      <div className="sticky top-20 z-40 bg-background/95 backdrop-blur-xl border-b border-border py-4">
        <div className="container-wide flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <button key={c.id} onClick={() => setActiveCategory(c.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                activeCategory === c.id ? "bg-primary-accent text-black" : "bg-surface border border-border text-text-muted hover:border-primary-accent/40 hover:text-text-primary"
              }`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Insights Grid */}
      <section className="section-pad">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((insight, i) => (
              <motion.article key={insight.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.07 }}
                className="group relative flex flex-col p-7 rounded-2xl bg-surface border border-border hover:border-primary-accent/40 transition-all hover:-translate-y-1 cursor-pointer overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-0.5" style={{ backgroundColor: insight.color }} />
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: insight.color }}>{insight.categoryLabel}</span>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${insight.color}15` }}>
                    <insight.icon size={16} style={{ color: insight.color }} />
                  </div>
                </div>
                <h3 className="font-space font-bold text-text-primary text-lg leading-tight mb-3 flex-1 group-hover:text-primary-accent transition-colors">{insight.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-5">{insight.desc}</p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-3 text-text-muted text-xs">
                    <span className="flex items-center gap-1"><Calendar size={10} /> {insight.date}</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {insight.readTime}</span>
                  </div>
                  <ArrowRight size={16} className="text-text-muted group-hover:text-primary-accent group-hover:translate-x-1 transition-all" />
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="section-pad bg-surface-elevated border-t border-border">
        <div className="container-wide max-w-3xl mx-auto text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-4 block">Stay Ahead</span>
          <h2 className="text-4xl font-space font-bold text-text-primary mb-4">Intelligence Delivered Weekly</h2>
          <p className="text-text-secondary mb-8">Join 2,000+ technology leaders who receive our weekly digest of AI strategy, enterprise trends, and original research.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="your@company.com" className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary-accent/50 transition-colors" />
            <button type="submit" className="px-6 py-3 bg-primary-accent text-black font-space font-bold text-sm uppercase tracking-widest rounded-xl hover:-translate-y-0.5 transition-transform whitespace-nowrap">
              Subscribe
            </button>
          </form>
          <p className="text-text-muted text-xs mt-4">No spam. Unsubscribe anytime. Read by leaders at Fortune 500 companies.</p>
        </div>
      </section>
    </div>
  );
}
