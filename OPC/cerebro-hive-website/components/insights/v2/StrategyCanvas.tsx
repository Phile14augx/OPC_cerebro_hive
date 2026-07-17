"use client";

import React, { useState } from "react";
import { FileDown, CheckCircle2, Bot, Layers, Network, DollarSign, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const StrategyCanvas = () => {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 2500);
  };

  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide max-w-5xl">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-4">AI Strategy Canvas</h2>
          <p className="text-text-secondary max-w-2xl mx-auto font-inter">
            Generate a personalized executive deliverable containing an opportunity matrix, suggested architecture, and estimated ROI.
          </p>
        </div>

        {!generated && !generating && (
          <div className="flex justify-center">
            <button 
              onClick={handleGenerate}
              className="px-10 py-5 bg-surface text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg flex items-center gap-3 transition-transform hover:scale-105 shadow-xl"
            >
              <FileDown size={20} /> Generate Executive Deliverable
            </button>
          </div>
        )}

        {generating && (
          <div className="bg-surface border border-border rounded-2xl p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-4 border-border border-t-[#7B61FF] animate-spin mb-6" />
            <h3 className="text-2xl font-space font-bold text-text-primary mb-2">Synthesizing Strategy</h3>
            <p className="text-text-secondary">Generating opportunity matrix and architecture diagrams...</p>
          </div>
        )}

        <AnimatePresence>
          {generated && (
            <motion.div 
              initial={{ opacity: 0.4, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-surface/50 border border-border rounded-2xl p-6 md:p-10 relative overflow-hidden"
            >
              
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00E5FF] via-[#00F57A] to-[#7B61FF]" />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                <div>
                  <h3 className="text-3xl font-space font-bold text-text-primary mb-2">Executive AI Strategy Brief</h3>
                  <div className="text-xs font-bold uppercase tracking-widest text-text-muted">Prepared for: CIO • Finance Sector</div>
                </div>
                <button className="px-6 py-3 bg-[#7B61FF] text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap">
                  <FileDown size={16} /> Download PDF
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                
                <div className="bg-surface-secondary border border-border rounded-xl p-6">
                  <div className="text-[10px] uppercase tracking-widest text-accent-secondary font-bold mb-4 flex items-center gap-2">
                    <Target size={14} /> Executive Summary
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Based on your profile, the highest ROI opportunity lies in shifting from descriptive analytics to agentic workflows. By deploying an AgentOS layer, you can automate Level 1 compliance checks, reducing audit cycle times by an estimated 40%.
                  </p>
                </div>

                <div className="bg-surface-secondary border border-border rounded-xl p-6">
                  <div className="text-[10px] uppercase tracking-widest text-accent-primary font-bold mb-4 flex items-center gap-2">
                    <DollarSign size={14} /> Estimated ROI
                  </div>
                  <div className="text-4xl font-space font-bold text-text-primary mb-2">2.4x</div>
                  <p className="text-sm text-text-secondary">Expected return on infrastructure investment within 18 months, driven by headcount reallocation.</p>
                </div>

              </div>

              <div className="space-y-6">
                <h4 className="font-space font-bold text-text-primary text-lg border-b border-border pb-2">Implementation Phases</h4>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 bg-surface border border-border p-5 rounded-xl">
                    <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">Phase 1: 0-3 Months</div>
                    <div className="font-bold text-text-primary mb-2 flex items-center gap-2"><Layers size={14} className="text-accent-secondary" /> Knowledge Hub</div>
                    <p className="text-xs text-text-secondary">Deploy vector infrastructure and ground models in enterprise data.</p>
                  </div>
                  <div className="flex-1 bg-surface border border-border p-5 rounded-xl border-[#7B61FF]/30">
                    <div className="text-[10px] uppercase tracking-widest text-[#7B61FF] font-bold mb-2">Phase 2: 3-9 Months</div>
                    <div className="font-bold text-text-primary mb-2 flex items-center gap-2"><Bot size={14} className="text-[#7B61FF]" /> Agent Pilot</div>
                    <p className="text-xs text-text-secondary">Introduce autonomous agents to handle repetitive compliance workflows.</p>
                  </div>
                  <div className="flex-1 bg-surface border border-border p-5 rounded-xl">
                    <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">Phase 3: 9-18 Months</div>
                    <div className="font-bold text-text-primary mb-2 flex items-center gap-2"><Network size={14} className="text-accent-primary" /> Swarm Scaling</div>
                    <p className="text-xs text-text-secondary">Deploy multi-agent swarms across adjacent business units.</p>
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};
