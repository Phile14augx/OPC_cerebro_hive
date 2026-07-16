"use client";

import React, { useState } from "react";
import { Activity, ShieldCheck, Factory, BookOpen, Layers, Target, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const industries = [
  {
    id: "healthcare",
    icon: Activity,
    label: "Healthcare & Life Sciences",
    desc: "AI adoption is shifting from administrative copilot to autonomous clinical documentation.",
    adoption: "65%",
    regulation: "High",
    research: ["Clinical Note Parsing via Local LLMs", "Federated Learning for Patient Outcomes"],
    products: ["Cerebro AgentOS - Healthcare Edition"],
    impact: "Reduces clinical documentation burden by 40%, directly increasing provider bandwidth."
  },
  {
    id: "finance",
    icon: ShieldCheck,
    label: "Financial Services",
    desc: "Focusing on low-latency reasoning models for fraud detection and automated auditing.",
    adoption: "82%",
    regulation: "Very High",
    research: ["Zero-Shot Anomaly Detection", "Agentic RFP Generation"],
    products: ["Quantiva AI ERP"],
    impact: "Automates Level 1 compliance checks, freeing auditors for complex investigations."
  },
  {
    id: "manufacturing",
    icon: Factory,
    label: "Manufacturing",
    desc: "Deploying multi-agent systems for predictive maintenance and dynamic inventory routing.",
    adoption: "45%",
    regulation: "Medium",
    research: ["Reinforcement Learning for Warehouse Routing"],
    products: ["Cerebro Knowledge Hub"],
    impact: "Prevents supply chain cascading failures via preemptive agentic rerouting."
  }
];

export const IndustryIntelligence = () => {
  const [active, setActive] = useState(industries[0].id);

  return (
    <section className="py-24 border-b border-white/5 bg-[#05070A]">
      <div className="container-wide">
        
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-space font-bold text-white mb-4">Industry Intelligence</h2>
          <p className="text-text-secondary max-w-2xl font-inter">
            Select an industry to see contextual analysis, relevant research, and recommended products.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Industry Selector */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            {industries.map(ind => {
              const isActive = active === ind.id;
              return (
                <button 
                  key={ind.id}
                  onClick={() => setActive(ind.id)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
                    isActive 
                      ? "bg-surface border-[#00E5FF]/50 shadow-[0_0_15px_rgba(0,229,255,0.1)]" 
                      : "bg-surface/50 border-white/5 hover:border-white/20"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0",
                    isActive ? "bg-[#00E5FF]/10 text-[#00E5FF]" : "bg-black text-text-muted group-hover:text-white"
                  )}>
                    <ind.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className={cn("font-space font-bold transition-colors", isActive ? "text-white" : "text-text-secondary")}>
                      {ind.label}
                    </div>
                  </div>
                  <ChevronRight size={16} className={cn("transition-colors", isActive ? "text-[#00E5FF]" : "text-text-muted")} />
                </button>
              );
            })}
          </div>

          {/* Details */}
          <div className="lg:col-span-8 bg-surface border border-white/10 rounded-2xl p-8 relative overflow-hidden">
            {industries.map(ind => ind.id === active && (
              <div key={ind.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center text-[#00E5FF]">
                    <ind.icon size={24} />
                  </div>
                  <h3 className="text-3xl font-space font-bold text-white">{ind.label} Overview</h3>
                </div>

                <p className="text-lg text-text-secondary leading-relaxed mb-8">
                  {ind.desc}
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-black/50 border border-white/5">
                    <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-1">Sector AI Adoption</div>
                    <div className="text-2xl font-space font-bold text-white">{ind.adoption}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-black/50 border border-white/5">
                    <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-1">Regulatory Pressure</div>
                    <div className="text-2xl font-space font-bold text-white">{ind.regulation}</div>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#00E5FF]/5 border border-[#00E5FF]/20 mb-8">
                  <div className="text-[10px] uppercase tracking-widest text-[#00E5FF] font-bold mb-2 flex items-center gap-2">
                    <Target size={12} /> Why It Matters
                  </div>
                  <p className="text-sm text-white font-medium">{ind.impact}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-4 flex items-center gap-2">
                      <BookOpen size={12} /> Relevant Research
                    </div>
                    <ul className="space-y-3">
                      {ind.research.map((r, i) => (
                        <li key={i} className="text-sm text-[#00E5FF] hover:text-white cursor-pointer transition-colors flex items-start gap-2">
                          <span className="mt-1 opacity-50">-</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-4 flex items-center gap-2">
                      <Layers size={12} /> Recommended Products
                    </div>
                    <ul className="space-y-3">
                      {ind.products.map((p, i) => (
                        <li key={i} className="text-sm text-[#00F57A] hover:text-white cursor-pointer transition-colors flex items-start gap-2">
                          <span className="mt-1 opacity-50">-</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
