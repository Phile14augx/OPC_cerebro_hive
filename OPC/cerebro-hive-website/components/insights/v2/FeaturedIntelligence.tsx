"use client";

import React from "react";
import { ArrowRight, PlayCircle, BookOpen, Clock, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

const articles = [
  {
    tag: "Executive Playbook",
    title: "The CIO's Playbook for Enterprise AI in 2026",
    summary: "How leading enterprises are moving from AI pilots to AI-native operations — and what separates the ones that succeed.",
    impact: "Provides a step-by-step roadmap for scaling AI from experimentation to production, reducing deployment risks.",
    readTime: "12 min read",
    color: "bg-[#00F57A]",
    text: "text-[#00F57A]",
    type: "Read"
  },
  {
    tag: "Market Analysis",
    title: "Why 73% of Enterprise AI Projects Fail (And What the Successful 27% Do Differently)",
    summary: "After consulting on 50+ enterprise AI deployments, we've identified the structural patterns that separate transformative implementations from expensive experiments.",
    impact: "Helps leaders avoid common pitfalls like over-indexing on models rather than data architecture.",
    readTime: "8 min read",
    color: "bg-[#00E5FF]",
    text: "text-[#00E5FF]",
    type: "Read"
  },
  {
    tag: "Architecture Review",
    title: "From Data Warehouse to Intelligence Layer: The Architectural Leap",
    summary: "Your data lake isn't the foundation of an AI strategy. Here's the architecture modern enterprises are building instead.",
    impact: "Shifts IT strategy from static storage to dynamic, real-time vector infrastructures.",
    readTime: "15 min video",
    color: "bg-[#FFB300]",
    text: "text-[#FFB300]",
    type: "Watch"
  }
];

export const FeaturedIntelligence = () => {
  return (
    <section className="py-24 border-b border-white/5 bg-[#05070A]">
      <div className="container-wide">
        
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-space font-bold text-white mb-4">Featured Intelligence</h2>
            <p className="text-text-secondary max-w-2xl font-inter">
              Curated strategic analysis to help you navigate the transition to an AI-first enterprise.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <div key={i} className="group bg-surface border border-white/10 rounded-2xl p-8 hover:border-white/30 transition-all flex flex-col cursor-pointer relative overflow-hidden h-full">
              
              <div className={cn("absolute top-0 left-0 w-full h-1", article.color)} />

              <div className="flex items-center gap-3 mb-6">
                <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5", article.text)}>
                  {article.tag}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-text-muted flex items-center gap-1">
                  <Clock size={12} /> {article.readTime}
                </span>
              </div>

              <h3 className="text-2xl font-space font-bold text-white leading-tight mb-4 group-hover:text-primary-accent transition-colors">
                {article.title}
              </h3>
              
              <p className="text-sm text-text-secondary leading-relaxed mb-6">
                {article.summary}
              </p>

              <div className="mt-auto p-4 rounded-xl bg-black/40 border border-white/5 mb-6">
                <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">Why it matters</div>
                <p className="text-xs text-white leading-relaxed">{article.impact}</p>
              </div>

              <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
                <div className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
                  {article.type === "Read" ? <BookOpen size={14} /> : <PlayCircle size={14} />} {article.type}
                </div>
                <ArrowRight size={16} className="text-primary-accent group-hover:translate-x-1 transition-transform" />
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
