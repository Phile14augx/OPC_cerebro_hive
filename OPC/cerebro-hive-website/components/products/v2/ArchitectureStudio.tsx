"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building, Factory, Cloud, Database, Shield, Target, ArrowRight, Loader2, Download, Calendar, DollarSign, LayoutTemplate, Network } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: "size", icon: Building, label: "Company Size", options: ["100-500", "501-2000", "2000-10000", "10000+"] },
  { id: "industry", icon: Factory, label: "Industry", options: ["Financial Services", "Healthcare", "Manufacturing", "Retail", "Technology"] },
  { id: "cloud", icon: Cloud, label: "Cloud Preference", options: ["AWS", "Azure", "GCP", "On-Premise"] },
  { id: "erp", icon: Database, label: "Core ERP", options: ["SAP S/4HANA", "Oracle NetSuite", "Workday", "Other / Legacy"] },
  { id: "compliance", icon: Shield, label: "Compliance Focus", options: ["SOC 2", "HIPAA", "GDPR", "FedRAMP"] },
  { id: "goals", icon: Target, label: "Primary AI Goal", options: ["Reduce OpEx", "Accelerate Time-to-Market", "Improve Customer Exp", "Modernize Legacy"] }
];

export const ArchitectureStudio = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (option: string) => {
    setSelections(prev => ({ ...prev, [steps[currentStep].id]: option }));
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsGenerating(true);
      setTimeout(() => {
        setIsGenerating(false);
        setShowResult(true);
      }, 2500);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setSelections({});
    setShowResult(false);
  };

  return (
    <section className="py-32 border-b border-border bg-background relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-primary-accent/5 rounded-full blur-[150px]" />
      </div>

      <div className="container-wide relative z-10">
        
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent-secondary mb-3 block">Interactive Configurator</span>
          <h2 className="text-4xl md:text-6xl font-space font-bold text-text-primary mb-4">Enterprise Architecture Studio</h2>
          <p className="text-text-secondary max-w-2xl mx-auto font-inter text-lg">
            Every enterprise is unique. Input your constraints and instantly generate a customized AI platform architecture blueprint.
          </p>
        </div>

        <div className="max-w-4xl mx-auto min-h-[400px] flex flex-col justify-center">
          
          <AnimatePresence mode="wait">
            
            {/* Step Configuration */}
            {!isGenerating && !showResult && (
              <motion.div
                key={`step-${currentStep}`}
                initial={{ opacity: 0.4, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-surface border border-border rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
              >
                
                {/* Progress Indicators */}
                <div className="flex justify-between items-center mb-12">
                  <div className="flex items-center gap-2">
                    {steps.map((_, i) => (
                      <div key={i} className={cn("w-8 h-1.5 rounded-full transition-colors duration-300", i <= currentStep ? "bg-[#00E5FF]" : "bg-surface-elevated")} />
                    ))}
                  </div>
                  <div className="text-xs font-bold text-text-muted uppercase tracking-widest">
                    Step {currentStep + 1} of {steps.length}
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 rounded-xl bg-[#00E5FF]/10 text-accent-secondary">
                    {React.createElement(steps[currentStep].icon, { size: 32 })}
                  </div>
                  <h3 className="text-3xl font-space font-bold text-text-primary">Select {steps[currentStep].label}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {steps[currentStep].options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelect(option)}
                      className="p-6 rounded-xl border border-border bg-surface-elevated hover:bg-[#00E5FF]/5 hover:border-[#00E5FF]/30 text-left transition-all duration-300 group flex items-center justify-between"
                    >
                      <span className="text-lg font-medium text-text-primary group-hover:text-[#00E5FF]">{option}</span>
                      <ArrowRight size={18} className="text-transparent group-hover:text-[#00E5FF] -translate-x-4 group-hover:translate-x-0 transition-all" />
                    </button>
                  ))}
                </div>

              </motion.div>
            )}

            {/* Generating State */}
            {isGenerating && (
              <motion.div
                key="generating"
                initial={{ opacity: 0.4, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="relative w-32 h-32 mb-8">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-t-2 border-primary-accent" />
                  <motion.div animate={{ rotate: -360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-4 rounded-full border-b-2 border-[#00E5FF]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={32} className="text-text-primary animate-spin" />
                  </div>
                </div>
                <h3 className="text-2xl font-space font-bold text-text-primary mb-2">Compiling Architecture...</h3>
                <div className="text-text-muted font-mono text-sm flex flex-col items-center gap-1">
                  <motion.span animate={{ opacity: [0,1] }} transition={{ delay: 0.5 }}>Analyzing {selections.industry} workflows...</motion.span>
                  <motion.span animate={{ opacity: [0,1] }} transition={{ delay: 1.2 }}>Mapping {selections.erp} connectors...</motion.span>
                  <motion.span animate={{ opacity: [0,1] }} transition={{ delay: 1.8 }}>Applying {selections.compliance} security constraints...</motion.span>
                </div>
              </motion.div>
            )}

            {/* Result State */}
            {showResult && (
              <motion.div
                key="result"
                initial={{ opacity: 0.4, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface border border-primary-accent/30 rounded-3xl shadow-[0_0_50px_rgba(0,245,122,0.1)] overflow-hidden"
              >
                
                {/* Result Header */}
                <div className="bg-primary-accent/10 p-8 border-b border-primary-accent/20 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-accent/20 border border-primary-accent/50 rounded-full text-[10px] font-bold text-primary-accent uppercase tracking-widest mb-3">
                      <CheckCircle2 size={12} /> Blueprint Generated
                    </div>
                    <h3 className="text-2xl font-space font-bold text-text-primary">Recommended Enterprise Stack</h3>
                    <p className="text-sm text-text-secondary mt-1">Optimized for {selections.industry} • {selections.cloud} Deployment</p>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none px-6 py-3 bg-surface-elevated border border-border text-text-primary text-xs font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:bg-surface hover:text-text-primary transition-colors">
                      <Download size={14} /> PDF
                    </button>
                    <button className="flex-1 md:flex-none px-6 py-3 bg-primary-accent text-text-primary text-xs font-bold uppercase tracking-widest rounded-lg flex items-center justify-center hover:bg-surface transition-colors shadow-lg">
                      Book Strategy
                    </button>
                  </div>
                </div>

                {/* Result Body */}
                <div className="p-8 grid md:grid-cols-2 gap-8">
                  
                  {/* Left: Recommended Products */}
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-text-muted font-bold mb-4 flex items-center gap-2">
                      <LayoutTemplate size={14} /> Core Modules
                    </h4>
                    <div className="space-y-3">
                      {["Knowledge Hub (RAG Base)", "AgentOS (Workflow Gen)", "Quantiva ERP Layer"].map((prod, i) => (
                        <div key={i} className="p-4 rounded-xl border border-border bg-surface-elevated flex items-center gap-4">
                          <div className="w-8 h-8 rounded bg-primary-accent/20 text-primary-accent flex items-center justify-center shrink-0">
                            <CheckCircle2 size={16} />
                          </div>
                          <span className="text-text-primary font-medium">{prod}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Architecture & ROI */}
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-text-muted font-bold mb-4 flex items-center gap-2">
                        <Network size={14} /> Deployment Topology
                      </h4>
                      <div className="p-4 rounded-xl border border-[#00E5FF]/20 bg-[#00E5FF]/5 text-sm text-accent-secondary">
                        Virtual Private Cloud peering with {selections.cloud}. Data rests entirely in your infrastructure enforcing {selections.compliance} standards.
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-border bg-surface-elevated">
                        <div className="text-text-muted text-[10px] uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><Calendar size={12}/> Timeline</div>
                        <div className="text-text-primary font-space font-bold text-xl">90 Days</div>
                      </div>
                      <div className="p-4 rounded-xl border border-border bg-surface-elevated">
                        <div className="text-text-muted text-[10px] uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><DollarSign size={12}/> Expected ROI</div>
                        <div className="text-primary-accent font-space font-bold text-xl">250%+</div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Reset */}
                <div className="p-4 border-t border-border bg-surface-elevated text-center">
                  <button onClick={reset} className="text-xs text-text-muted hover:text-text-primary transition-colors underline underline-offset-4">
                    Reconfigure Architecture
                  </button>
                </div>

              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </div>
    </section>
  );
};

import { CheckCircle2 } from "lucide-react";
