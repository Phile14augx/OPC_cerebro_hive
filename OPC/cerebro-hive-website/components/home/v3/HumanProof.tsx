"use client";

import React, { useState } from "react";
import { Users, Building, Target, Zap, CheckCircle2, Bot, Layers, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const cases = [
  {
    id: "healthcare",
    industry: "Healthcare Provider Network",
    logo: "GlobalHealth",
    challenge: "Processing 50,000+ unstructured clinical notes daily required 400+ hours of manual nurse review for compliance.",
    solution: "Deployed a HIPAA-compliant agent swarm to parse notes, extract billing codes, and flag anomalies prior to human review.",
    products: ["Cerebro Knowledge Hub", "AgentOS"],
    timeline: "3 Months (Pilot to Production)",
    outcome: "92% reduction in manual review time.",
    metric: "92%",
    color: "bg-[#00E5FF]"
  },
  {
    id: "logistics",
    industry: "Global Logistics Firm",
    logo: "TransGlobal Freight",
    challenge: "Supply chain managers were reacting to weather delays 12 hours too late, causing cascading inventory shortages.",
    solution: "Integrated Quantiva ERP with live weather APIs and reasoning models to proactively suggest route alternatives.",
    products: ["Quantiva AI ERP"],
    timeline: "6 Months",
    outcome: "Prevented $12M in delay penalties.",
    metric: "$12M",
    color: "bg-[#00F57A]"
  }
];

export default function HumanProof() {
  const [activeCase, setActiveCase] = useState(cases[0]);

  return (
    <section className="py-24 border-b border-white/5 bg-[#0A0D14]">
      <div className="container-wide">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-[#00F57A] font-bold mb-6">
            <Users size={12} /> Enterprise Evidence
          </div>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-white mb-6">Proven in production.</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-inter">
            See how Fortune 500 companies use CerebroHive to transition from legacy operations to autonomous execution.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
          
          {/* Customer Selector */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {cases.map(c => (
              <button 
                key={c.id}
                onClick={() => setActiveCase(c)}
                className={`p-6 rounded-2xl border text-left transition-all ${
                  activeCase.id === c.id 
                    ? "bg-surface border-white/20 shadow-lg" 
                    : "bg-surface/50 border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Building size={16} className="text-text-muted" />
                  <div className="text-xs font-bold uppercase tracking-widest text-text-muted">{c.industry}</div>
                </div>
                <div className={`font-space font-bold text-xl ${activeCase.id === c.id ? "text-white" : "text-text-secondary"}`}>
                  {c.logo}
                </div>
              </button>
            ))}
          </div>

          {/* Case Study Details */}
          <div className="lg:col-span-8 bg-surface border border-white/10 rounded-2xl p-8 md:p-12 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCase.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                
                <div className="flex flex-col md:flex-row gap-8 mb-10">
                  <div className="flex-1">
                    <div className="text-[10px] uppercase tracking-widest text-[#FFB300] font-bold mb-3 flex items-center gap-2">
                      <Target size={12} /> The Challenge
                    </div>
                    <p className="text-sm text-white leading-relaxed">{activeCase.challenge}</p>
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] uppercase tracking-widest text-[#00E5FF] font-bold mb-3 flex items-center gap-2">
                      <CheckCircle2 size={12} /> The Solution
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{activeCase.solution}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-10">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">Products Used</div>
                    <div className="flex flex-col gap-2">
                      {activeCase.products.map(p => (
                        <div key={p} className="text-xs font-bold text-white flex items-center gap-2">
                          {p.includes("Quantiva") ? <Layers size={12} className="text-[#00F57A]" /> : <Bot size={12} className="text-[#00E5FF]" />} {p}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">Timeline</div>
                    <div className="text-sm font-bold text-white">{activeCase.timeline}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${activeCase.color}`} />
                    <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2 ml-2">Business Outcome</div>
                    <div className="text-3xl font-space font-bold text-white ml-2">{activeCase.metric}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <p className="text-sm font-bold text-[#00F57A]">{activeCase.outcome}</p>
                  <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white hover:text-[#00F57A] transition-colors">
                    Read Full Study <ArrowRight size={14} />
                  </button>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
