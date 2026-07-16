"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { engineeringFramework } from "@/lib/content/company/engineering";
import { SectionMetadata } from "@/components/ui/SectionMetadata";
import { MetricChip } from "@/components/ui/MetricChip";
import { NeuralOrb } from "@/components/ui/NeuralOrb";
import { motionPresets } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

export const EngineeringCulture = () => {
  // Default to the first framework phase
  const [activePhaseId, setActivePhaseId] = useState<string>(engineeringFramework.framework[0].id);

  const activePhase = engineeringFramework.framework.find(p => p.id === activePhaseId) || engineeringFramework.framework[0];

  return (
    <section id="engineering" className="section-pad relative overflow-hidden bg-background border-t border-border">
      
      {/* 1. Ambient Environment */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Engineering Blueprint Grid */}
        <div className="absolute inset-0 opacity-[0.06]" 
             style={{ 
               backgroundImage: `linear-gradient(rgba(0, 245, 122, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 245, 122, 0.4) 1px, transparent 1px)`, 
               backgroundSize: '40px 40px',
               maskImage: 'radial-gradient(circle at 70% 50%, black 40%, transparent 80%)',
               WebkitMaskImage: 'radial-gradient(circle at 70% 50%, black 40%, transparent 80%)'
             }} 
        />
        {/* Radial Lights */}
        <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-[#00E5FF]/5 rounded-full blur-[150px] mix-blend-screen -translate-y-1/2" />
        <div className="absolute top-1/4 right-0 w-[800px] h-[800px] bg-primary-accent/5 rounded-full blur-[180px] mix-blend-screen" />
      </div>

      <div className="container-wide relative z-10">
        
        <motion.div 
          variants={motionPresets.stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col lg:flex-row gap-12 lg:gap-8 items-stretch"
        >
          
          {/* ==========================================
              LEFT PANEL: Narrative & Framework (40%)
             ========================================== */}
          <div className="lg:w-[40%] flex flex-col pt-8">
            <SectionMetadata 
              sectionNumber={engineeringFramework.narrative.metadata.section} 
              title={engineeringFramework.narrative.metadata.title} 
              version={engineeringFramework.narrative.metadata.version} 
            />

            <motion.h3 variants={motionPresets.fadeUp} className="text-4xl md:text-5xl font-space font-bold text-text-primary tracking-tight leading-[1.1] mb-6">
              {engineeringFramework.narrative.headline}
            </motion.h3>
            
            <motion.p variants={motionPresets.fadeUp} className="text-lg text-text-secondary font-inter leading-relaxed mb-12 border-l-2 border-border pl-6">
              {engineeringFramework.narrative.description}
            </motion.p>

            {/* Interactive Engineering Framework Timeline */}
            <motion.div variants={motionPresets.fadeUp} className="relative mb-16">
              <div className="absolute left-[15px] top-6 bottom-6 w-[2px] bg-white/5" />
              
              <div className="flex flex-col gap-6">
                {engineeringFramework.framework.map((phase) => {
                  const isActive = activePhaseId === phase.id;
                  return (
                    <div 
                      key={phase.id}
                      id={`engineering-${phase.id}`}
                      className="relative z-10 flex items-center gap-6 cursor-pointer group"
                      onMouseEnter={() => setActivePhaseId(phase.id)}
                    >
                      {/* Node Indicator */}
                      <div className="z-10 bg-[#040d1a] rounded-full shrink-0">
                        <NeuralOrb 
                          size="sm" 
                          color={phase.color as any} 
                          state={isActive ? "active" : "idle"}
                        />
                      </div>
                      
                      {/* Node Label */}
                      <span className={cn(
                        "text-sm font-space font-bold tracking-[0.15em] uppercase transition-colors duration-300",
                        isActive ? "text-text-primary" : "text-text-muted group-hover:text-text-secondary"
                      )}>
                        {phase.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Engineering Proof (Built Around) */}
            <motion.div variants={motionPresets.fadeUp} className="mt-auto bg-white/5 border border-border rounded-2xl p-6 backdrop-blur-md">
              <h4 className="text-[10px] font-space uppercase tracking-widest text-text-muted mb-4">
                Built Around
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                {engineeringFramework.narrative.proofs.map((proof, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-primary-accent opacity-70" />
                    <span className="text-xs font-mono text-text-secondary">{proof}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

          </div>

          {/* ==========================================
              RIGHT PANEL: The Control Center (60%)
             ========================================== */}
          <motion.div variants={motionPresets.fadeUp} className="lg:w-[60%] flex flex-col">
            <div className="relative w-full h-[600px] lg:h-full min-h-[600px] bg-[#070a0f] border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col group">
              
              {/* Glass Header */}
              <div className="h-12 border-b border-border bg-white/[0.02] backdrop-blur-md flex items-center px-6 justify-between shrink-0">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-error/80" />
                  <div className="w-3 h-3 rounded-full bg-warning/80" />
                  <div className="w-3 h-3 rounded-full bg-success/80" />
                </div>
                <div className="text-[10px] font-mono text-text-muted uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  Live Methodology
                </div>
              </div>

              {/* Code Backdrop (Reacts to active phase) */}
              <div className="flex-grow relative p-6 md:p-10 font-mono text-xs md:text-sm text-primary-accent/70 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePhase.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="whitespace-pre-wrap leading-relaxed"
                  >
                    {activePhase.codeSnippet}
                  </motion.div>
                </AnimatePresence>
                
                {/* Code Overlay Gradient to fade out bottom */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#070a0f] to-transparent pointer-events-none" />
              </div>

              {/* Floating Telemetry Dashboard */}
              <div className="absolute bottom-6 right-6 left-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {activePhase.telemetry.map((metric, i) => (
                    <motion.div
                      key={`${activePhase.id}-${i}`}
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                    >
                      <MetricChip 
                        label={metric.label} 
                        initialValue={metric.value} 
                        status={metric.status as any} 
                        simulateUpdates={true} 
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

            </div>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
};

