"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { visionMission } from "@/lib/content/company/company";
import { PrincipleBadge } from "@/components/ui/PrincipleBadge";
import { motionPresets } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronRight } from "lucide-react";

export const VisionMission = () => {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  return (
    <section className="section-pad relative overflow-hidden bg-[#05070a]">
      
      {/* 1. Ambient Background (Restrained) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.08]" 
             style={{ 
               backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`, 
               backgroundSize: '80px 80px',
             }} 
        />
        {/* Subtle Noise */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
        {/* Blurred Radial Light */}
        <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-primary-accent/5 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <div className="container-wide relative z-10">
        
        {/* Top Metadata */}
        <div className="flex items-center gap-4 mb-16 md:mb-24">
          <div className="h-[1px] w-12 bg-white/10" />
          <span className="text-[10px] font-space font-bold tracking-widest uppercase text-text-muted">
            {visionMission.sectionMetadata.number} / {visionMission.sectionMetadata.label}
          </span>
        </div>

        {/* Narrative Flow Container */}
        <motion.div 
          variants={motionPresets.stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col gap-24"
        >
          
          {/* ==========================================
              A. PURPOSE HERO (60% Visual Weight)
             ========================================== */}
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            
            {/* Left Narrative */}
            <motion.div variants={motionPresets.fadeUp} className="lg:col-span-7 pr-0 lg:pr-12">
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-space font-bold text-white tracking-tight leading-[1.05] mb-8">
                Building Production AI, <br />
                <span className="text-text-muted">Not PowerPoint AI.</span>
              </h2>
              <p className="text-xl md:text-2xl text-text-secondary font-inter leading-relaxed max-w-2xl border-l-2 border-primary-accent pl-6">
                {visionMission.purpose.description}
              </p>
            </motion.div>

            {/* Right Interactive Transformation Diagram */}
            <motion.div variants={motionPresets.fadeUp} className="lg:col-span-5 relative mt-12 lg:mt-0">
              <div className="bg-surface-elevated border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden">
                {/* Internal Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-accent/5 to-transparent opacity-50" />
                
                <div className="relative z-10 flex flex-col gap-1">
                  {visionMission.purpose.evidence.framework.map((node, index) => {
                    const isLast = index === visionMission.purpose.evidence.framework.length - 1;
                    const isActive = activeNode === node.id;
                    
                    return (
                      <div 
                        key={node.id} 
                        className="relative group cursor-default"
                        onMouseEnter={() => setActiveNode(node.id)}
                        onMouseLeave={() => setActiveNode(null)}
                      >
                        {/* Node Container */}
                        <div className="flex items-center gap-4 py-3">
                          {/* Circle Indicator */}
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 z-10 bg-surface-elevated",
                            isActive ? "border-primary-accent shadow-[0_0_15px_rgba(0,245,122,0.3)]" : "border-white/20 group-hover:border-white/50"
                          )}>
                            <div className={cn(
                              "w-2 h-2 rounded-full transition-all duration-300",
                              isActive ? "bg-primary-accent scale-100" : "bg-white/20 scale-0 group-hover:scale-100 group-hover:bg-white/50"
                            )} />
                          </div>
                          
                          {/* Label */}
                          <span className={cn(
                            "text-sm font-space font-bold uppercase tracking-wider transition-colors duration-300",
                            isActive ? "text-white" : "text-text-secondary group-hover:text-text-primary"
                          )}>
                            {node.label}
                          </span>
                        </div>

                        {/* Connecting Line (Vertical) */}
                        {!isLast && (
                          <div className="absolute left-[15px] top-[36px] w-[2px] h-[32px] bg-white/10 overflow-hidden">
                            {/* Animated Progression Dot */}
                            <motion.div 
                              className="w-full h-[8px] bg-primary-accent/50 rounded-full"
                              animate={{ y: [ -8, 32 ] }}
                              transition={{ 
                                duration: 1.5, 
                                repeat: Infinity, 
                                ease: "linear",
                                delay: index * 1.5 // Staggered delays for sequential flow
                              }}
                            />
                          </div>
                        )}

                        {/* Interactive Details Expansion */}
                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden pl-12"
                            >
                              <div className="flex flex-wrap gap-2 pb-4 pt-1">
                                {node.details.map((detail, i) => (
                                  <span key={i} className="text-[10px] font-mono text-text-muted bg-white/5 px-2 py-1 rounded-md border border-white/5">
                                    {detail}
                                  </span>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
            
          </div>

          {/* ==========================================
              B. VISION & MISSION (Asymmetric Presentation)
             ========================================== */}
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-0 relative">
            
            {/* Visual Connector (Purpose -> Vision) */}
            <div className="hidden lg:block absolute -top-16 left-[20%] w-[1px] h-16 bg-gradient-to-b from-primary-accent/50 to-transparent" />
            
            {/* 1. VISION CARD (Aspirational, 25% relative weight, spans 7 cols) */}
            <motion.div 
              variants={motionPresets.fadeUp} 
              className="lg:col-span-7 lg:pr-12 relative z-10"
            >
              <div className="group relative h-full bg-[#030b14] border border-[#00B8FF]/20 rounded-3xl p-10 md:p-14 overflow-hidden shadow-2xl backdrop-blur-md flex flex-col justify-between transition-all duration-500 hover:border-[#00B8FF]/40">
                
                {/* Animated Top Accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00B8FF] to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* 2030 Watermark */}
                <div className="absolute -bottom-12 -right-12 text-[180px] font-space font-bold text-[#00B8FF] opacity-[0.03] pointer-events-none select-none tracking-tighter transition-transform duration-700 group-hover:scale-105">
                  {visionMission.vision.horizon}
                </div>
                
                {/* Deep Radial Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#00B8FF]/10 via-transparent to-transparent opacity-50" />

                <div className="relative z-10 mb-12">
                  <div className="w-10 h-10 rounded-lg border border-[#00B8FF]/30 flex items-center justify-center mb-8 relative overflow-hidden bg-[#00B8FF]/5 group-hover:bg-[#00B8FF]/10 transition-colors">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-50" />
                    <ChevronRight size={18} className="text-[#00B8FF] relative z-10 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-xs font-space font-bold uppercase tracking-[0.2em] text-[#00B8FF] mb-6">
                    Our Vision
                  </h3>
                  <p className="text-3xl md:text-4xl font-space font-bold text-white leading-tight max-w-xl">
                    {visionMission.vision.headline}
                  </p>
                </div>

                {/* Footer Anchor */}
                <div className="relative z-10 mt-auto border-t border-white/10 pt-6 flex items-center justify-between">
                  <span className="text-xs font-space text-text-muted uppercase tracking-widest">
                    {visionMission.vision.footer}
                  </span>
                  <span className="text-sm font-mono font-bold text-[#00B8FF]">
                    {visionMission.vision.horizon}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* 2. MISSION CARD (Operational, 15% relative weight, spans 6 cols, overlaps left by 1 col) */}
            <motion.div 
              variants={motionPresets.fadeUp} 
              className="lg:col-span-6 lg:-ml-12 mt-6 lg:mt-24 relative z-20"
            >
              <div className="group relative h-full bg-[#0a0f12] border border-primary-accent/20 rounded-3xl p-10 md:p-12 overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl flex flex-col justify-between transition-all duration-500 hover:border-primary-accent/40">
                
                {/* Subtle Grid Background */}
                <div className="absolute inset-0 opacity-[0.05]" 
                     style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />

                <div className="relative z-10 mb-10">
                  <h3 className="text-xs font-space font-bold uppercase tracking-[0.2em] text-primary-accent mb-6">
                    Our Mission
                  </h3>
                  <p className="text-2xl md:text-3xl font-space font-bold text-white leading-snug mb-8">
                    {visionMission.mission.headline}
                  </p>

                  {/* Operational Keywords Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {visionMission.mission.keywords.map((keyword, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-lg px-3 py-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-accent/50" />
                        <span className="text-xs font-mono text-text-secondary">{keyword}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Anchor */}
                <div className="relative z-10 mt-auto border-t border-white/10 pt-6 flex items-center justify-between">
                  <span className="text-xs font-space text-text-muted uppercase tracking-widest">
                    {visionMission.mission.footer}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-primary-accent shadow-[0_0_8px_rgba(0,245,122,0.5)] animate-pulse" />
                </div>
              </div>
            </motion.div>

          </div>

          {/* ==========================================
              C. STRATEGIC PILLARS (Badges)
             ========================================== */}
          <motion.div variants={motionPresets.fadeUp} className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-12 border-t border-white/5">
            <span className="text-[10px] font-space font-bold uppercase tracking-[0.2em] text-text-muted mr-4 hidden md:block">
              Strategic Pillars
            </span>
            {visionMission.pillars.map((pillar, i) => (
              <PrincipleBadge 
                key={i}
                title={pillar.title}
                variant={pillar.variant as any}
              />
            ))}
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
};

