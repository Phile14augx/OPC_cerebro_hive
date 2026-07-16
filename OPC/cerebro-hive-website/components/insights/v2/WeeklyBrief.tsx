"use client";

import React from "react";
import { ArrowRight, BookOpen, AlertTriangle, Lightbulb, Target } from "lucide-react";

export const WeeklyBrief = () => {
  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-surface to-black border border-border rounded-2xl overflow-hidden shadow-2xl relative">
          
          <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-20 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at top right, #00E5FF, transparent)` }} />

          {/* Header */}
          <div className="p-8 md:p-12 border-b border-border relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 bg-[#00E5FF]/10 text-accent-secondary border border-[#00E5FF]/30 rounded text-[10px] uppercase tracking-widest font-bold">
                Weekly Briefing
              </span>
              <span className="text-xs text-text-muted font-bold uppercase tracking-widest">
                Week of October 12, 2026
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-6 leading-tight">
              The Shift from Chat to Autonomous Agent Swarms
            </h2>
            <div className="bg-white/5 border border-border rounded-xl p-6">
              <div className="text-[10px] uppercase tracking-widest text-accent-secondary font-bold mb-2 flex items-center gap-2">
                <BookOpen size={12} /> Executive Summary
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Enterprise AI investment is rapidly shifting away from standalone chat interfaces toward autonomous agent swarms capable of executing multi-step ERP workflows. Organizations attempting to build out complex chat interfaces are accruing technical debt, while early adopters of agentic architectures are seeing 40% reductions in process cycle times.
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 md:p-12 grid md:grid-cols-3 gap-8 relative z-10">
            
            <div className="space-y-4">
              <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-warning" /> Major Developments
              </div>
              <ul className="space-y-3">
                <li className="text-sm text-text-secondary pb-3 border-b border-border leading-relaxed">
                  <span className="text-text-primary font-bold block mb-1">OpenAI introduces structured outputs for agents.</span>
                  Ensures deterministic JSON responses, critical for ERP integration.
                </li>
                <li className="text-sm text-text-secondary pb-3 border-b border-border leading-relaxed">
                  <span className="text-text-primary font-bold block mb-1">EU AI Act enforcement timeline clarified.</span>
                  High-risk enterprise systems require human-in-the-loop validation by Q3.
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold flex items-center gap-2 mb-2">
                <Lightbulb size={14} className="text-primary-accent" /> Business Implications
              </div>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                Chat interfaces rely on human reasoning to drive the tool. Agents absorb the reasoning burden. This means the ROI of AI is no longer bottlenecked by employee adoption rates—it is directly tied to the infrastructure's ability to execute autonomous tasks.
              </p>
              <div className="p-4 rounded-lg bg-black/40 border border-border">
                <div className="text-xs text-text-primary font-bold mb-1">Why it matters</div>
                <div className="text-xs text-text-muted">Companies investing purely in employee copilot licenses may miss out on the much larger ROI of process automation.</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold flex items-center gap-2 mb-2">
                <Target size={14} className="text-accent-secondary" /> Recommended Actions
              </div>
              <ul className="space-y-3 mb-6">
                <li className="text-sm text-text-secondary flex gap-3">
                  <div className="w-5 h-5 rounded bg-[#00E5FF]/10 text-accent-secondary flex items-center justify-center font-bold text-xs shrink-0">1</div>
                  <span className="leading-relaxed">Audit current AI projects. If a project relies on humans typing prompts to achieve ROI, categorize it as high-risk.</span>
                </li>
                <li className="text-sm text-text-secondary flex gap-3">
                  <div className="w-5 h-5 rounded bg-[#00E5FF]/10 text-accent-secondary flex items-center justify-center font-bold text-xs shrink-0">2</div>
                  <span className="leading-relaxed">Initiate a pilot using an agentic framework (like Cerebro AgentOS) against a narrow, high-volume back-office process.</span>
                </li>
              </ul>
              
              <button className="w-full py-3 bg-[#00E5FF]/10 text-accent-secondary border border-[#00E5FF]/30 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#00E5FF] hover:text-black transition-colors flex items-center justify-center gap-2">
                Subscribe to Briefing <ArrowRight size={14} />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
