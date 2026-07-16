"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2, ArrowRight, BrainCircuit, ShieldCheck, Download, Calendar, Users, BarChart3, ChevronRight, Activity } from "lucide-react";

const industries = ["Financial Services", "Healthcare", "Manufacturing", "Technology", "Retail"];
const problems = ["Fragmented Knowledge", "High Operational Costs", "Slow Decision Making", "Legacy System Bottlenecks", "Compliance Risks"];
const sizes = ["Under 500", "500 - 1,000", "1,000 - 5,000", "5,000+"];

export function SolutionConfigurator() {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({
    industry: "",
    problem: "",
    size: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(false);

  const handleSelect = (key: keyof typeof selections, value: string) => {
    setSelections({ ...selections, [key]: value });
    if (step < 3) setStep(step + 1);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setResult(true);
    }, 2000);
  };

  const reset = () => {
    setStep(1);
    setResult(false);
    setSelections({ industry: "", problem: "", size: "" });
  };

  return (
    <section className="py-24 border-y border-border bg-surface-elevated">
      <div className="container-wide">
        
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-[10px] uppercase tracking-widest text-primary-accent font-bold mb-3 block">Design Your Transformation</span>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-6">Interactive Solution Configurator</h2>
          <p className="text-text-secondary text-lg">
            Map your business context to an enterprise-grade AI architecture. Get an instant estimate on timeline, ROI, and required team composition.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-background border border-border rounded-2xl shadow-elevated overflow-hidden">
          
          {/* Header */}
          <div className="border-b border-border p-6 flex items-center justify-between bg-surface/50">
            <div className="flex items-center gap-3">
              <Settings2 size={20} className="text-primary-accent" />
              <span className="font-space font-bold text-text-primary">Configuration Wizard</span>
            </div>
            {!result && !isGenerating && (
              <div className="flex gap-2">
                {[1, 2, 3].map(s => (
                  <div key={s} className={`h-1.5 w-12 rounded-full transition-colors ${step >= s ? "bg-primary-accent" : "bg-border"}`} />
                ))}
              </div>
            )}
          </div>

          <div className="p-8 md:p-12 min-h-[400px] flex flex-col justify-center relative">
            <AnimatePresence mode="wait">
              
              {/* Step 1: Industry */}
              {!result && !isGenerating && step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-2xl font-space font-bold text-text-primary mb-2">What is your industry?</h3>
                  <p className="text-text-muted mb-8 text-sm">This determines the compliance baseline and regulatory requirements of your architecture.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {industries.map(ind => (
                      <button key={ind} onClick={() => handleSelect("industry", ind)} className="p-4 rounded-xl border border-border bg-surface text-left hover:border-primary-accent/50 hover:bg-surface-elevated transition-all font-medium text-text-secondary">
                        {ind}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Problem */}
              {!result && !isGenerating && step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                   <div className="flex items-center gap-2 mb-2">
                    <button onClick={() => setStep(1)} className="text-xs text-text-muted hover:text-text-primary">Industry</button>
                    <ChevronRight size={12} className="text-text-muted" />
                    <span className="text-xs text-primary-accent">Primary Challenge</span>
                  </div>
                  <h3 className="text-2xl font-space font-bold text-text-primary mb-2">What is the primary challenge?</h3>
                  <p className="text-text-muted mb-8 text-sm">We map this to specific AI foundation models and orchestration strategies.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {problems.map(prob => (
                      <button key={prob} onClick={() => handleSelect("problem", prob)} className="p-4 rounded-xl border border-border bg-surface text-left hover:border-primary-accent/50 hover:bg-surface-elevated transition-all font-medium text-text-secondary">
                        {prob}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Size */}
              {!result && !isGenerating && step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-text-muted">Challenge</span>
                    <ChevronRight size={12} className="text-text-muted" />
                    <span className="text-xs text-primary-accent">Organization Size</span>
                  </div>
                  <h3 className="text-2xl font-space font-bold text-text-primary mb-2">What is your organization size?</h3>
                  <p className="text-text-muted mb-8 text-sm">Determines the deployment strategy, change management complexity, and cluster sizing.</p>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {sizes.map(size => (
                      <button key={size} onClick={() => setSelections({...selections, size})} 
                        className={`p-4 rounded-xl border transition-all font-medium ${selections.size === size ? "border-primary-accent bg-surface-elevated text-text-primary" : "border-border bg-surface text-text-secondary hover:border-primary-accent/50"}`}>
                        {size} Employees
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    disabled={!selections.size}
                    onClick={handleGenerate} 
                    className="w-full py-4 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-elevated transition-all flex items-center justify-center gap-2"
                  >
                    Generate Reference Architecture <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}

              {/* Generating Animation */}
              {isGenerating && (
                <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="absolute inset-0 rounded-full border-t-2 border-primary-accent" />
                    <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="absolute inset-2 rounded-full border-b-2 border-[#00E5FF]" />
                    <BrainCircuit className="text-primary-accent" size={32} />
                  </div>
                  <h3 className="text-xl font-space font-bold text-text-primary mb-2">Architecting Solution</h3>
                  <p className="text-text-muted text-sm">Cross-referencing {selections.industry} compliance with {selections.problem} blueprints...</p>
                </motion.div>
              )}

              {/* Result Dashboard */}
              {result && !isGenerating && (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col h-full">
                  
                  <div className="flex items-start justify-between border-b border-border pb-6 mb-6">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-primary-accent font-bold mb-2 block">Generated Blueprint</span>
                      <h3 className="text-2xl font-space font-bold text-text-primary mb-1">Enterprise Cognitive Layer</h3>
                      <p className="text-sm text-text-secondary">Customized for {selections.industry} • {selections.size} Employees</p>
                    </div>
                    <button onClick={reset} className="text-xs text-text-muted hover:text-text-primary underline">Start Over</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Left: Architecture */}
                    <div>
                      <h4 className="text-sm font-space font-bold text-text-primary mb-4 flex items-center gap-2"><BrainCircuit size={16} className="text-primary-accent" /> Recommended Architecture</h4>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-sm text-text-secondary bg-surface p-3 rounded-lg border border-border">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-accent" /> 
                          Private LLM Gateway (SOC2/HIPAA)
                        </li>
                        <li className="flex items-center gap-3 text-sm text-text-secondary bg-surface p-3 rounded-lg border border-border">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-accent" /> 
                          Vector Database (Pinecone Dedicated)
                        </li>
                        <li className="flex items-center gap-3 text-sm text-text-secondary bg-surface p-3 rounded-lg border border-border">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-accent" /> 
                          Orchestration (LangGraph + CrewAI)
                        </li>
                      </ul>
                    </div>

                    {/* Right: Consulting Output */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-surface rounded-xl border border-border">
                        <Calendar size={18} className="text-text-muted mb-2" />
                        <span className="text-[10px] uppercase tracking-widest text-text-muted block">Timeline</span>
                        <span className="font-space font-bold text-text-primary">12-16 Weeks</span>
                      </div>
                      <div className="p-4 bg-surface rounded-xl border border-border">
                        <Users size={18} className="text-text-muted mb-2" />
                        <span className="text-[10px] uppercase tracking-widest text-text-muted block">Team</span>
                        <span className="font-space font-bold text-text-primary">4-6 Experts</span>
                      </div>
                      <div className="p-4 bg-surface rounded-xl border border-border">
                        <BarChart3 size={18} className="text-text-muted mb-2" />
                        <span className="text-[10px] uppercase tracking-widest text-text-muted block">Est. ROI</span>
                        <span className="font-space font-bold text-text-primary">210% (1yr)</span>
                      </div>
                      <div className="p-4 bg-surface rounded-xl border border-border">
                        <ShieldCheck size={18} className="text-text-muted mb-2" />
                        <span className="text-[10px] uppercase tracking-widest text-text-muted block">Governance</span>
                        <span className="font-space font-bold text-text-primary">Enterprise-Grade</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                    <button className="flex-1 py-4 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-xl hover:shadow-elevated transition-all flex items-center justify-center gap-2">
                      Schedule Deep Dive <ArrowRight size={16} />
                    </button>
                    <button className="flex-1 py-4 bg-surface border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-xl hover:border-primary-accent/50 hover:bg-surface-elevated transition-all flex items-center justify-center gap-2">
                      Download PDF Report <Download size={16} />
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
}
