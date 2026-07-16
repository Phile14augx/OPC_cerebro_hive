"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Mail, ScanLine, Search, Cpu, Database, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: "email", label: "Email Received", icon: Mail, detail: "Vendor Invoice PDF", color: "text-white" },
  { id: "ocr", label: "OCR Extraction", icon: ScanLine, detail: "Digitizing contents", color: "text-primary-accent" },
  { id: "knowledge", label: "Knowledge Match", icon: Search, detail: "Checking Vendor DB", color: "text-[#00F57A]" },
  { id: "agent", label: "Agent Reasoner", icon: Cpu, detail: "Validating line items", color: "text-[#00E5FF]" },
  { id: "erp", label: "ERP Entry", icon: Database, detail: "Posting to Quantiva", color: "text-[#FFB300]" }
];

export const PlatformActionDemo = () => {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % (steps.length + 1)); // +1 to allow a "completed" state briefly
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isInView]);

  const progress = Math.min(100, (activeStep / (steps.length - 1)) * 100);

  return (
    <section className="py-24 border-b border-border bg-background" ref={containerRef}>
      <div className="container-wide">
        
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-3 block">Live Execution</span>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-white mb-4">Platform in Action</h2>
          <p className="text-text-secondary max-w-2xl mx-auto font-inter">
            Watch how CerebroOS handles an unstructured invoice, applies reasoning, and updates your financial system autonomously.
          </p>
        </div>

        <div className="max-w-5xl mx-auto bg-surface-elevated border border-border rounded-2xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
          
          {/* Progress Bar Background */}
          <div className="absolute top-1/2 left-12 right-12 h-1 bg-border -translate-y-1/2 hidden md:block" />
          
          {/* Animated Progress Bar */}
          <div className="absolute top-1/2 left-12 h-1 bg-primary-accent -translate-y-1/2 hidden md:block transition-all duration-500 ease-linear shadow-[0_0_10px_#00F57A]" style={{ width: `calc(${progress}% - 3rem)` }} />

          <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-0">
            {steps.map((step, index) => {
              const isPast = activeStep > index;
              const isCurrent = activeStep === index;
              
              return (
                <div key={step.id} className="flex flex-col items-center relative group">
                  
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 z-10",
                    isCurrent ? "bg-primary-accent/20 border-2 border-primary-accent shadow-[0_0_20px_rgba(0,245,122,0.3)] scale-110" : 
                    isPast ? "bg-surface border-2 border-primary-accent/50" : "bg-black/50 border-2 border-white/10"
                  )}>
                    {isPast && !isCurrent ? (
                      <CheckCircle2 size={24} className="text-primary-accent" />
                    ) : (
                      <step.icon size={24} className={isCurrent ? step.color : "text-text-muted"} />
                    )}
                  </div>
                  
                  <div className="mt-6 text-center">
                    <div className={cn("text-sm font-space font-bold mb-1 transition-colors", isCurrent ? "text-white" : "text-text-secondary")}>
                      {step.label}
                    </div>
                    <div className={cn("text-[10px] uppercase tracking-widest transition-colors", isCurrent ? step.color : "text-text-muted")}>
                      {isCurrent ? step.detail : "..."}
                    </div>
                  </div>

                  {/* Mobile connector */}
                  {index < steps.length - 1 && (
                    <div className="md:hidden mt-4 text-border flex justify-center">
                      <ArrowRight size={20} className={isPast ? "text-primary-accent" : ""} />
                    </div>
                  )}

                  {/* Pulsing indicator when active */}
                  {isCurrent && (
                    <motion.div 
                      className="absolute top-8 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl border-2 border-primary-accent"
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Completion State */}
          <AnimatePresence>
            {activeStep >= steps.length && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-surface/90 backdrop-blur-sm flex flex-col items-center justify-center z-20"
              >
                <div className="w-20 h-20 bg-primary-accent/20 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={40} className="text-primary-accent" />
                </div>
                <h3 className="text-3xl font-space font-bold text-white mb-2">Workflow Completed</h3>
                <p className="text-text-secondary">Time elapsed: 1.2 seconds</p>
                <button 
                  onClick={() => setActiveStep(0)}
                  className="mt-6 px-6 py-2 border border-primary-accent/50 text-primary-accent rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary-accent/10"
                >
                  Replay Simulation
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </section>
  );
};
