"use client";

import React from "react";
import { Server, Building, Scale, ArrowRight } from "lucide-react";

const marketUpdates = [
  {
    category: "Infrastructure",
    icon: Server,
    color: "text-accent-secondary",
    bg: "bg-[#00E5FF]/10",
    date: "Today",
    title: "Major Cloud Providers Standardize Vector Search",
    desc: "All three major hyperscalers have officially integrated native vector search into their flagship SQL databases, signaling the commoditization of RAG retrieval infrastructure.",
    impact: "Organizations no longer need specialized standalone vector databases for basic RAG. This simplifies enterprise architecture but shifts the competitive bottleneck to data parsing and retrieval strategies."
  },
  {
    category: "Regulations",
    icon: Scale,
    color: "text-warning",
    bg: "bg-[#FFB300]/10",
    date: "Yesterday",
    title: "EU AI Act: Final Compliance Guidelines Published",
    desc: "The final technical standards for 'high-risk' AI systems have been published. Any system routing enterprise financial data autonomously is now classified as high-risk.",
    impact: "Immediate audit required for any agentic workflows interacting with ERPs. Expect procurement cycles for European subsidiaries to extend by 2-3 months as compliance teams adapt."
  },
  {
    category: "Enterprise Software",
    icon: Building,
    color: "text-accent-primary",
    bg: "bg-accent-primary/10",
    date: "This Week",
    title: "SaaS Vendors Shift from Copilots to Autonomous Agents",
    desc: "Three major CRM and ERP vendors announced pricing models shifting from 'per-seat copilot licenses' to 'per-action autonomous execution'.",
    impact: "Validates the CerebroHive AgentOS thesis. CIOs must prepare procurement teams to evaluate consumption-based pricing models rather than traditional SaaS seat licenses."
  }
];

export const MarketWatch = () => {
  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        
        <div className="mb-12">
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-4">Enterprise Market Watch</h2>
          <p className="text-text-secondary max-w-2xl font-inter">
            Live updates on infrastructure shifts, regulatory changes, and vendor moves that impact your enterprise architecture.
          </p>
        </div>

        <div className="space-y-6">
          {marketUpdates.map((update, i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 hover:border-border-strong transition-colors">
              
              <div className="w-full md:w-48 shrink-0">
                <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${update.bg} ${update.color} mb-3`}>
                  <update.icon size={12} /> {update.category}
                </div>
                <div className="text-xs text-text-muted font-bold uppercase tracking-widest">{update.date}</div>
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-space font-bold text-text-primary mb-3">{update.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-6">{update.desc}</p>
                
                <div className="p-4 rounded-xl bg-surface border border-border">
                  <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">Business Impact</div>
                  <p className="text-xs text-text-primary leading-relaxed">{update.impact}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center w-12 shrink-0 border-l border-border hidden md:flex cursor-pointer hover:bg-surface transition-colors rounded-r-2xl -my-8 -mr-8 ml-4">
                <ArrowRight size={20} className="text-text-muted" />
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
