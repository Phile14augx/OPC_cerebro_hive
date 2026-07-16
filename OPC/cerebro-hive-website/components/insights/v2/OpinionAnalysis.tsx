"use client";

import React from "react";
import { LineChart, BarChart, ArrowRight, Target, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const opinions = [
  {
    type: "Forecast",
    title: "The End of the Monolithic ERP by 2029",
    author: "Elena Rostova, Head of AI Architecture",
    desc: "Why modular, agent-driven micro-applications will replace traditional ERP deployments within three years.",
    confidence: "85% (High)",
    assumption: "Assumes vector retrieval latency drops below 50ms.",
    color: "border-[#00E5FF] bg-[#00E5FF]/5",
    iconColor: "text-[#00E5FF]"
  },
  {
    type: "Business Strategy",
    title: "Why 'AI-Ready Data' is a Dangerous Myth",
    author: "Marcus Chen, Lead Research Engineer",
    desc: "Companies are spending millions cleaning data for AI. The reality is that modern agentic pipelines handle messy data better than clean data.",
    confidence: "95% (Very High)",
    assumption: "Based on results from 12 enterprise pilot programs.",
    color: "border-[#00F57A] bg-[#00F57A]/5",
    iconColor: "text-[#00F57A]"
  }
];

export const OpinionAnalysis = () => {
  return (
    <section className="py-24 border-b border-white/5 bg-[#05070A]">
      <div className="container-wide">
        
        <div className="mb-12">
          <h2 className="text-3xl md:text-5xl font-space font-bold text-white mb-4">Strategic Forecasts & Opinion</h2>
          <p className="text-text-secondary max-w-2xl font-inter">
            Forward-looking analysis from CerebroHive leadership, complete with explicitly stated assumptions and confidence levels.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {opinions.map((op, i) => (
            <div key={i} className={cn("p-8 rounded-2xl border transition-all hover:-translate-y-1 cursor-pointer group", op.color)}>
              
              <div className="flex items-center justify-between mb-6">
                <span className={cn("px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-black/50 border border-white/10", op.iconColor)}>
                  {op.type}
                </span>
                <ArrowRight size={20} className="text-text-muted group-hover:text-white transition-colors" />
              </div>

              <h3 className="text-2xl font-space font-bold text-white mb-3 leading-tight">{op.title}</h3>
              <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-6">By {op.author}</div>
              
              <p className="text-sm text-text-secondary leading-relaxed mb-8">
                {op.desc}
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-1 flex items-center gap-1">
                    <Target size={12} /> Forecast Confidence
                  </div>
                  <div className={cn("text-sm font-bold", op.iconColor)}>{op.confidence}</div>
                </div>
                <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-1 flex items-center gap-1">
                    <Activity size={12} /> Key Assumption
                  </div>
                  <div className="text-xs text-text-secondary">{op.assumption}</div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
