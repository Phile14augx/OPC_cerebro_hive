"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Search, FileBarChart, Lightbulb, TrendingUp, Settings, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

const comparisons = [
  { current: "Manual workflows", future: "Intelligent automation", label: "Operations" },
  { current: "Fragmented knowledge", future: "Unified AI knowledge layer", label: "Data" },
  { current: "Reactive decisions", future: "Predictive insights", label: "Intelligence" },
  { current: "Isolated tools", future: "Integrated AI platform", label: "Architecture" },
];

const phases = [
  { id: "discover", title: "Discover", icon: Search, desc: "Identify high-impact AI opportunities aligned with strategic business goals." },
  { id: "assess", title: "Assess", icon: FileBarChart, desc: "Evaluate data readiness, technical feasibility, and expected ROI." },
  { id: "pilot", title: "Pilot", icon: Lightbulb, desc: "Rapidly prototype and deploy a bounded use-case to validate value." },
  { id: "scale", title: "Scale", icon: TrendingUp, desc: "Expand the architecture securely across departments and workflows." },
  { id: "operate", title: "Operate", icon: Settings, desc: "Manage models, monitor performance, and ensure governance." },
  { id: "optimize", title: "Optimize", icon: BarChart2, desc: "Continuously tune systems based on real-world usage and new AI capabilities." },
];

export function AITransformationJourney() {
  const [activePhase, setActivePhase] = useState(0);

  return (
    <section className="py-24 bg-surface border-y border-border relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00E5FF]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="container-wide relative z-10">
        
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-[10px] uppercase tracking-widest text-primary-accent font-bold mb-3 block">Methodology</span>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-6">The AI Transformation Journey</h2>
          <p className="text-text-secondary text-lg">
            We move organizations from fragmented experiments to enterprise-wide intelligent operations using a structured, risk-mitigated methodology.
          </p>
        </div>

        {/* Current vs Future State Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24 max-w-5xl mx-auto">
          {/* Current State */}
          <div className="bg-background border border-border rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><X size={100} /></div>
            <h3 className="text-xl font-space font-bold text-text-primary mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Current State
            </h3>
            <ul className="space-y-6 relative z-10">
              {comparisons.map((c, i) => (
                <li key={i} className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-1">{c.label}</span>
                  <div className="flex items-start gap-3">
                    <X size={18} className="text-red-500 shrink-0 mt-0.5" />
                    <span className="text-text-secondary">{c.current}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Future State */}
          <div className="bg-surface-elevated border border-primary-accent/30 rounded-2xl p-8 relative overflow-hidden shadow-elevated">
            <div className="absolute top-0 right-0 p-4 opacity-5"><Check size={100} className="text-primary-accent" /></div>
            <h3 className="text-xl font-space font-bold text-text-primary mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-accent animate-pulse" /> Autonomous Enterprise
            </h3>
            <ul className="space-y-6 relative z-10">
              {comparisons.map((c, i) => (
                <li key={i} className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-primary-accent/70 font-bold mb-1">{c.label}</span>
                  <div className="flex items-start gap-3">
                    <Check size={18} className="text-primary-accent shrink-0 mt-0.5" />
                    <span className="text-text-primary font-medium">{c.future}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Interactive Timeline */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-sm font-space font-bold uppercase tracking-widest text-text-muted mb-8 text-center">Consulting Methodology</h3>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2 hidden md:block" />
            
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {phases.map((phase, i) => {
                const isActive = activePhase === i;
                const isPast = activePhase > i;
                
                return (
                  <div 
                    key={phase.id}
                    onMouseEnter={() => setActivePhase(i)}
                    className="relative flex flex-col items-center cursor-pointer group"
                  >
                    {/* Connection Node (Desktop) */}
                    <div className={cn(
                      "hidden md:flex w-4 h-4 rounded-full border-2 items-center justify-center relative z-10 mb-6 transition-colors duration-300 bg-surface",
                      isActive ? "border-primary-accent" : isPast ? "border-primary-accent/50" : "border-border"
                    )}>
                      {isActive && <motion.div layoutId="activeNode" className="w-1.5 h-1.5 bg-primary-accent rounded-full" />}
                    </div>

                    {/* Content Box */}
                    <div className={cn(
                      "w-full p-5 rounded-xl border transition-all duration-300 h-full flex flex-col",
                      isActive 
                        ? "bg-surface-elevated border-primary-accent shadow-[0_0_20px_rgba(0,245,122,0.1)] -translate-y-1" 
                        : "bg-background border-border hover:border-text-muted"
                    )}>
                      <div className="flex items-center gap-3 mb-3 md:mb-4">
                        <phase.icon size={16} className={isActive ? "text-primary-accent" : "text-text-muted"} />
                        <span className={cn("font-space font-bold text-sm", isActive ? "text-text-primary" : "text-text-muted")}>
                          0{i + 1}. {phase.title}
                        </span>
                      </div>
                      
                      <p className={cn(
                        "text-xs leading-relaxed transition-colors duration-300",
                        isActive ? "text-text-secondary" : "text-text-muted opacity-0 md:opacity-100 hidden md:block"
                      )}>
                        {phase.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
