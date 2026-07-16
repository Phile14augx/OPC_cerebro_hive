"use client";

import React, { useState } from "react";
import { User, Building2, Target, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export const ExecutiveDecisionCenter = () => {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({ role: "", industry: "", priority: "" });

  const roles = ["CIO", "CTO", "CEO", "Head of AI", "Other"];
  const industries = ["Healthcare", "Finance", "Manufacturing", "Retail", "Gov"];
  const priorities = ["Cost Reduction", "New Revenue", "Risk/Compliance", "Process Automation"];

  const handleSelect = (key: string, value: string) => {
    setSelections(prev => ({ ...prev, [key]: value }));
    if (step < 3) setStep(step + 1);
  };

  return (
    <section className="py-24 border-b border-border bg-background relative overflow-hidden">
      
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#7B61FF]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-wide">
        
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-4">Executive Decision Center</h2>
          <p className="text-text-secondary max-w-2xl mx-auto font-inter">
            Configure your organizational profile to receive personalized strategic recommendations, architectures, and product paths.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-surface/80 backdrop-blur-xl border border-border rounded-2xl p-8 relative z-10 shadow-2xl">
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-12 relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-white/10 z-0" />
            {[1, 2, 3].map(num => (
              <div key={num} className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold relative z-10 transition-colors",
                step === num ? "bg-[#7B61FF] text-text-primary border-4 border-[#0A0D14]" :
                step > num ? "bg-accent-primary text-black border-4 border-[#0A0D14]" :
                "bg-surface text-text-muted border border-border"
              )}>
                {step > num ? <CheckCircle2 size={14} /> : num}
              </div>
            ))}
          </div>

          <div className="min-h-[250px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="text-center mb-8">
                    <User size={24} className="text-[#7B61FF] mx-auto mb-2" />
                    <h3 className="text-xl font-space font-bold text-text-primary">What is your role?</h3>
                  </div>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {roles.map(role => (
                      <button key={role} onClick={() => handleSelect('role', role)} className="px-6 py-3 rounded-xl border border-border bg-white/5 text-sm font-bold text-text-primary hover:border-[#7B61FF] hover:bg-[#7B61FF]/10 transition-colors">
                        {role}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="text-center mb-8">
                    <Building2 size={24} className="text-[#7B61FF] mx-auto mb-2" />
                    <h3 className="text-xl font-space font-bold text-text-primary">What is your industry?</h3>
                  </div>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {industries.map(ind => (
                      <button key={ind} onClick={() => handleSelect('industry', ind)} className="px-6 py-3 rounded-xl border border-border bg-white/5 text-sm font-bold text-text-primary hover:border-[#7B61FF] hover:bg-[#7B61FF]/10 transition-colors">
                        {ind}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 3 && !selections.priority && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="text-center mb-8">
                    <Target size={24} className="text-[#7B61FF] mx-auto mb-2" />
                    <h3 className="text-xl font-space font-bold text-text-primary">Primary AI Objective?</h3>
                  </div>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {priorities.map(pri => (
                      <button key={pri} onClick={() => handleSelect('priority', pri)} className="px-6 py-3 rounded-xl border border-border bg-white/5 text-sm font-bold text-text-primary hover:border-[#7B61FF] hover:bg-[#7B61FF]/10 transition-colors">
                        {pri}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {selections.priority && (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <div className="bg-[#7B61FF]/10 border border-[#7B61FF]/30 rounded-xl p-6 text-center mb-8">
                    <h3 className="text-2xl font-space font-bold text-text-primary mb-2">Analysis Complete</h3>
                    <p className="text-sm text-text-secondary">Profile: {selections.role} • {selections.industry} • {selections.priority}</p>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="p-6 rounded-xl border border-border bg-surface-secondary">
                      <div className="text-[10px] uppercase tracking-widest text-accent-primary font-bold mb-4">Top Opportunity</div>
                      <p className="text-sm text-text-primary leading-relaxed">Agentic workflows can reduce manual compliance auditing by 60% in your sector.</p>
                    </div>
                    <div className="p-6 rounded-xl border border-border bg-surface-secondary">
                      <div className="text-[10px] uppercase tracking-widest text-accent-secondary font-bold mb-4">Suggested Action</div>
                      <p className="text-sm text-text-primary leading-relaxed">Pilot Cerebro AgentOS against a single, high-volume operational bottleneck.</p>
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <button className="px-8 py-4 bg-[#7B61FF] text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2">
                      Generate Strategy Canvas <ArrowRight size={16} />
                    </button>
                    <button onClick={() => { setStep(1); setSelections({ role: "", industry: "", priority: "" }); }} className="block mx-auto mt-4 text-xs text-text-muted hover:text-white transition-colors uppercase tracking-widest">
                      Reset Configuration
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
};
