"use client";

import React, { useState } from "react";
import { Settings, FileDown, Target, Building2, Server, CheckCircle2, Bot, Network, Layers, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function EnterpriseSimulator() {
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [selections, setSelections] = useState({ industry: "", erp: "", maturity: "" });

  const handleSelect = (key: string, value: string) => {
    setSelections(prev => ({ ...prev, [key]: value }));
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleGenerate();
    }
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 2500);
  };

  return (
    <section className="py-24 border-b border-border bg-background relative overflow-hidden">
      
      {/* Background Accent */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-[#00E5FF]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-wide">
        
        <div className="text-center mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-border text-[10px] uppercase tracking-widest text-accent-secondary font-bold mb-6">
            <Settings size={12} /> Interactive Blueprint
          </div>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-6">Enterprise Transformation Simulator</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-inter">
            Configure your organizational parameters to instantly generate a personalized AI blueprint, architecture, and estimated ROI model.
          </p>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          
          {!generated && !generating && (
            <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-2xl p-8 md:p-12 shadow-2xl">
              
              {/* Progress */}
              <div className="flex items-center justify-between mb-12 relative max-w-lg mx-auto">
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-white/10 z-0" />
                {[1, 2, 3].map(num => (
                  <div key={num} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold relative z-10 transition-colors ${
                    step === num ? "bg-[#00E5FF] text-black border-4 border-[#0A0D14]" :
                    step > num ? "bg-accent-primary text-black border-4 border-[#0A0D14]" :
                    "bg-surface text-text-muted border border-border"
                  }`}>
                    {step > num ? <CheckCircle2 size={16} /> : num}
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-8">
                      <Building2 size={32} className="text-accent-secondary mx-auto mb-4" />
                      <h3 className="text-2xl font-space font-bold text-text-primary">Select Industry</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                      {["Finance", "Healthcare", "Manufacturing", "Retail"].map(ind => (
                        <button key={ind} onClick={() => handleSelect('industry', ind)} className="p-4 rounded-xl border border-border bg-white/5 font-bold text-text-primary hover:border-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors">
                          {ind}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-8">
                      <Server size={32} className="text-accent-secondary mx-auto mb-4" />
                      <h3 className="text-2xl font-space font-bold text-text-primary">Primary ERP / System</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                      {["SAP", "Oracle", "Workday", "Custom/Legacy"].map(erp => (
                        <button key={erp} onClick={() => handleSelect('erp', erp)} className="p-4 rounded-xl border border-border bg-white/5 font-bold text-text-primary hover:border-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors">
                          {erp}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-8">
                      <Target size={32} className="text-accent-secondary mx-auto mb-4" />
                      <h3 className="text-2xl font-space font-bold text-text-primary">Current AI Maturity</h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                      {["Exploration (Pilots)", "Isolated (Copilots)", "Integrated (APIs)"].map(mat => (
                        <button key={mat} onClick={() => handleSelect('maturity', mat)} className="p-4 rounded-xl border border-border bg-white/5 font-bold text-text-primary hover:border-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors">
                          {mat}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {generating && (
            <div className="bg-surface border border-border rounded-2xl p-16 text-center flex flex-col items-center shadow-2xl">
              <div className="w-16 h-16 rounded-full border-4 border-border border-t-[#00E5FF] animate-spin mb-8" />
              <h3 className="text-2xl font-space font-bold text-text-primary mb-2">Architecting Blueprint...</h3>
              <p className="text-text-secondary">Synthesizing platform recommendations for {selections.industry} running {selections.erp}.</p>
            </div>
          )}

          <AnimatePresence>
            {generated && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl">
                
                <div className="h-2 w-full bg-gradient-to-r from-[#00E5FF] via-[#00F57A] to-[#7B61FF]" />
                
                <div className="p-8 md:p-12">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                      <h3 className="text-3xl font-space font-bold text-text-primary mb-2">Executive AI Blueprint</h3>
                      <p className="text-text-muted text-sm font-bold uppercase tracking-widest">
                        {selections.industry} • {selections.erp} Environment
                      </p>
                    </div>
                    <button className="px-6 py-3 bg-[#00E5FF] text-black font-space font-bold text-sm uppercase tracking-widest rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
                      <FileDown size={16} /> Download PDF
                    </button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-surface-secondary border border-border rounded-xl p-6">
                      <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">Maturity Score</div>
                      <div className="text-4xl font-space font-bold text-text-primary mb-2">42<span className="text-lg text-text-muted">/100</span></div>
                      <p className="text-xs text-text-secondary">Your current setup is highly dependent on manual prompt engineering.</p>
                    </div>
                    <div className="bg-surface-secondary border border-border rounded-xl p-6">
                      <div className="text-[10px] uppercase tracking-widest text-accent-secondary font-bold mb-2">Top Opportunity</div>
                      <div className="text-xl font-space font-bold text-text-primary mb-2">Workflow Automation</div>
                      <p className="text-xs text-text-secondary">Deploying AgentOS alongside {selections.erp} can automate 60% of L1 tasks.</p>
                    </div>
                    <div className="bg-surface-secondary border border-border rounded-xl p-6">
                      <div className="text-[10px] uppercase tracking-widest text-accent-primary font-bold mb-2">Estimated ROI</div>
                      <div className="text-4xl font-space font-bold text-text-primary mb-2">2.8x</div>
                      <p className="text-xs text-text-secondary">Expected return within 12 months based on headcount reallocation.</p>
                    </div>
                  </div>

                  <h4 className="font-space font-bold text-text-primary text-xl mb-6">Recommended Architecture Path</h4>
                  <div className="grid md:grid-cols-3 gap-4 mb-8">
                    <div className="p-5 bg-white/5 border border-border rounded-xl relative">
                      <Layers size={20} className="text-text-muted mb-4" />
                      <h5 className="font-bold text-text-primary mb-2">1. Knowledge Layer</h5>
                      <p className="text-xs text-text-secondary">Vectorize {selections.erp} data using Cerebro Knowledge Hub.</p>
                    </div>
                    <div className="p-5 bg-white/5 border border-border rounded-xl relative border-[#00E5FF]/30">
                      <Bot size={20} className="text-accent-secondary mb-4" />
                      <h5 className="font-bold text-text-primary mb-2">2. Agent Network</h5>
                      <p className="text-xs text-text-secondary">Deploy specific AgentOS skills mapped to departmental bottlenecks.</p>
                    </div>
                    <div className="p-5 bg-white/5 border border-border rounded-xl relative">
                      <Network size={20} className="text-text-muted mb-4" />
                      <h5 className="font-bold text-text-primary mb-2">3. Decision Engine</h5>
                      <p className="text-xs text-text-secondary">Integrate Quantiva ERP for full multi-agent orchestration.</p>
                    </div>
                  </div>

                  <div className="text-center pt-8 border-t border-border">
                    <button className="px-8 py-4 bg-white text-black font-space font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-2">
                      Book Strategy Session <ArrowRight size={16} />
                    </button>
                    <button 
                      onClick={() => { setGenerated(false); setStep(1); setSelections({ industry: "", erp: "", maturity: "" }); }}
                      className="block mx-auto mt-4 text-xs font-bold uppercase tracking-widest text-text-muted hover:text-white"
                    >
                      Reset Simulator
                    </button>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </section>
  );
}
