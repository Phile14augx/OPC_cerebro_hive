"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Scale, PenTool, Rocket, ShieldCheck, ArrowRight, FileText, FileSpreadsheet, FileBox, Cpu, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const phases = [
  { 
    id: "discover", 
    label: "1. Discover", 
    icon: Compass, 
    desc: "We analyze your business goals, bottlenecks, and data landscape.", 
    deliverable: "AI Opportunity Report",
    deliverableIcon: FileText
  },
  { 
    id: "assess", 
    label: "2. Assess", 
    icon: Scale, 
    desc: "Evaluate technical debt, data quality, and team capabilities.", 
    deliverable: "Readiness Score",
    deliverableIcon: FileSpreadsheet
  },
  { 
    id: "architect", 
    label: "3. Architect", 
    icon: PenTool, 
    desc: "Design the cloud infrastructure, agent workflows, and API layers.", 
    deliverable: "Solution Blueprint",
    deliverableIcon: FileBox
  },
  { 
    id: "build", 
    label: "4. Build", 
    icon: Rocket, 
    desc: "Deploy the platform, integrate with ERP, and train custom agents.", 
    deliverable: "Production Platform",
    deliverableIcon: Cpu
  },
  { 
    id: "operate", 
    label: "5. Operate", 
    icon: ShieldCheck, 
    desc: "Continuous monitoring, ROI tracking, and security governance.", 
    deliverable: "Governance Dashboard",
    deliverableIcon: Activity
  }
];

export const MethodologyVisualizer = () => {
  const [activePhase, setActivePhase] = useState(0);

  return (
    <section className="py-24 border-b border-border bg-[#0A0D14] relative overflow-hidden">
      <div className="container-wide relative z-10">
        
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#00E5FF] mb-3 block">Proven Methodology</span>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-white mb-4">How We Deliver</h2>
          <p className="text-text-secondary max-w-2xl mx-auto font-inter">
            A deterministic engineering approach to enterprise AI transformation. Every phase produces a tangible, measurable deliverable.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          
          {/* Desktop Timeline */}
          <div className="hidden lg:flex justify-between relative mb-12">
            <div className="absolute top-6 left-12 right-12 h-1 bg-white/5" />
            <div className="absolute top-6 left-12 h-1 bg-[#00E5FF] transition-all duration-500 ease-in-out" style={{ width: `calc(${(activePhase / (phases.length - 1)) * 100}% - 3rem)` }} />
            
            {phases.map((phase, i) => {
              const isActive = i === activePhase;
              const isPast = i < activePhase;
              
              return (
                <div key={phase.id} className="relative z-10 flex flex-col items-center cursor-pointer group w-1/5" onClick={() => setActivePhase(i)}>
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 mb-4",
                    isActive ? "bg-[#00E5FF] text-black shadow-[0_0_20px_rgba(0,229,255,0.4)] scale-125" : 
                    isPast ? "bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30" : "bg-surface border border-white/10 text-text-muted group-hover:border-white/30"
                  )}>
                    <phase.icon size={isActive ? 24 : 20} />
                  </div>
                  <div className={cn("text-xs font-space font-bold uppercase tracking-widest text-center transition-colors", isActive ? "text-white" : "text-text-secondary")}>
                    {phase.label.split(". ")[1]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Phase Details */}
          <div className="bg-surface border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#00E5FF]" />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activePhase}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col md:flex-row gap-8 items-center md:items-start justify-between"
              >
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-3xl font-space font-bold text-white mb-4">{phases[activePhase].label}</h3>
                  <p className="text-text-secondary text-lg mb-8 leading-relaxed max-w-lg">
                    {phases[activePhase].desc}
                  </p>
                  
                  {/* Mobile nav controls */}
                  <div className="flex items-center justify-center md:justify-start gap-4 lg:hidden mb-8">
                    <button 
                      onClick={() => setActivePhase(Math.max(0, activePhase - 1))}
                      disabled={activePhase === 0}
                      className="p-2 border border-white/10 rounded-lg text-text-muted hover:text-white disabled:opacity-30"
                    >
                      <ArrowRight size={20} className="rotate-180" />
                    </button>
                    <span className="text-xs font-bold text-text-secondary">{activePhase + 1} / {phases.length}</span>
                    <button 
                      onClick={() => setActivePhase(Math.min(phases.length - 1, activePhase + 1))}
                      disabled={activePhase === phases.length - 1}
                      className="p-2 border border-white/10 rounded-lg text-text-muted hover:text-white disabled:opacity-30"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>

                {/* The Deliverable */}
                <div className="w-full md:w-auto">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3 text-center md:text-left">Phase Output</div>
                  <div className="bg-black/40 border border-white/10 rounded-xl p-6 flex items-center gap-4 min-w-[280px] group hover:border-[#00E5FF]/50 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center shrink-0">
                      {React.createElement(phases[activePhase].deliverableIcon, { size: 24 })}
                    </div>
                    <div>
                      <div className="text-xs font-mono text-[#00E5FF] mb-1">Generated Deliverable</div>
                      <div className="font-space font-bold text-white group-hover:text-[#00E5FF] transition-colors">
                        {phases[activePhase].deliverable}
                      </div>
                    </div>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>

          </div>
        </div>
      </div>
    </section>
  );
};
