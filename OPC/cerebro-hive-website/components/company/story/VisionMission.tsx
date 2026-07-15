"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { visionMission } from "@/lib/content/company/company";
import { NeuralOrb } from "@/components/ui/NeuralOrb";
import { motionPresets } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { 
  ArrowRight, ChevronRight, User, Target, Code, Rocket, TrendingUp, Clock, BookOpen, Quote,
  Globe2, Building2, BarChart3, Coins, Network, GitBranch, ShieldCheck, Cpu
} from "lucide-react";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
const getThemeColors = (theme: string) => {
  switch (theme) {
    case "blue": return { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]", line: "bg-blue-500" };
    case "emerald": return { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]", line: "bg-emerald-500" };
    case "purple": return { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", glow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]", line: "bg-purple-500" };
    case "gold": return { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", glow: "hover:shadow-[0_0_30px_rgba(234,179,8,0.15)]", line: "bg-yellow-500" };
    case "cyan": return { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", glow: "hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]", line: "bg-cyan-500" };
    default: return { text: "text-white", bg: "bg-white/10", border: "border-white/20", glow: "hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]", line: "bg-white" };
  }
};

const getIcon = (iconName: string) => {
  switch(iconName) {
    case "globe": return Globe2;
    case "building": return Building2;
    case "trending-up": return TrendingUp;
    case "bar-chart": return BarChart3;
    case "coins": return Coins;
    default: return Target;
  }
};

const frameworkIcons: Record<string, React.ReactNode> = {
  vision: <User size={14} />,
  strategy: <Target size={14} />,
  engineering: <Code size={14} />,
  deployment: <Rocket size={14} />,
  value: <TrendingUp size={14} />
};

// ============================================================================
// BACKGROUND COMPONENT
// ============================================================================
const EnterpriseBackground = () => (
  <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
    <div className="absolute inset-0 opacity-[0.03]">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <pattern id="network-mesh" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
          <circle cx="60" cy="60" r="1.5" fill="currentColor" className="text-white" />
          <path d="M 60 60 L 180 180 M 60 60 L -60 180 M 60 60 L 180 -60 M 60 60 L -60 -60" stroke="currentColor" className="text-white" strokeWidth="0.5" />
        </pattern>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#network-mesh)" />
      </svg>
    </div>
    
    {/* Soft, intelligent glows instead of noisy blobs */}
    <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] mix-blend-screen" />
    <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] mix-blend-screen" />
  </div>
);

// ============================================================================
// NARRATIVE BEAM COMPONENT
// ============================================================================
const NarrativeBeam = () => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className="w-full flex flex-col items-center justify-center py-32 relative">
      <div className="w-[1px] h-48 md:h-64 bg-white/5 relative flex justify-center">
        {!prefersReducedMotion && (
          <motion.div 
            className="absolute top-0 w-full bg-gradient-to-b from-blue-500 via-emerald-500 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            initial={{ height: 0, opacity: 0 }}
            whileInView={{ height: "100%", opacity: 1 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        )}
        {prefersReducedMotion && (
          <div className="absolute top-0 w-full h-full bg-gradient-to-b from-blue-500 via-emerald-500 to-transparent opacity-50" />
        )}

        {/* Floating Narrative Labels */}
        <div className="absolute top-[25%] bg-background px-4">
          <span className="text-[10px] font-mono uppercase text-blue-400">Strategy</span>
        </div>
        <div className="absolute top-[75%] bg-background px-4">
          <span className="text-[10px] font-mono uppercase text-emerald-400">Execution</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export const VisionMission = () => {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  return (
    <section ref={containerRef} className="section-pad py-24 md:py-32 relative overflow-hidden bg-background">
      
      <EnterpriseBackground />

      <div className="container-wide relative z-10 flex flex-col gap-12 md:gap-24">
        
        {/* ==========================================
            A. PURPOSE SECTION (Why we exist)
           ========================================== */}
        <div id="company-purpose" className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-start pt-12">
          
          {/* Left Narrative */}
          <motion.div variants={prefersReducedMotion ? {} : motionPresets.fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="lg:col-span-7 pr-0 lg:pr-12">
            <h2 className="text-4xl md:text-5xl lg:text-[64px] font-space font-bold text-white tracking-tight leading-[1.05] mb-10">
              Building Production AI, <br />
              <span className="text-text-muted">Not PowerPoint AI.</span>
            </h2>
            <p className="text-xl md:text-2xl text-text-secondary font-inter leading-[1.8] max-w-[55ch] border-l-2 border-primary-accent pl-6 mb-16">
              {visionMission.purpose.description}
            </p>

            <div className="bg-white/[0.02] border border-white/10 p-8 rounded-2xl relative overflow-hidden">
              <Quote size={120} className="absolute -top-6 -left-6 text-white/5 -rotate-12" aria-hidden="true" />
              <p className="relative z-10 text-lg font-space italic text-text-primary leading-relaxed">
                "Our goal is not merely to deploy AI models. It is to fundamentally transform how entire enterprise divisions operate, measure, and scale."
              </p>
            </div>
          </motion.div>

          {/* Right Interactive Transformation Roadmap */}
          <motion.div variants={prefersReducedMotion ? {} : motionPresets.fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="lg:col-span-5 relative mt-12 lg:mt-0">
            <div className="bg-surface/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
              
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
                <div className="flex items-center gap-2 text-[10px] font-space font-bold uppercase tracking-widest text-text-muted">
                  <BookOpen size={14} aria-hidden="true" /> Transformation Journey
                </div>
              </div>
              
              <div className="relative z-10 flex flex-col gap-0">
                <div className="absolute left-[15px] top-[24px] bottom-[24px] w-[2px] bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="w-full bg-primary-accent rounded-full"
                    style={{ height: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]) }}
                  />
                </div>

                {visionMission.purpose.evidence.framework.map((node, index) => {
                  const isActive = activeNode === node.id;
                  
                  return (
                    <div 
                      key={node.id} 
                      className="relative group cursor-pointer"
                      onMouseEnter={() => setActiveNode(node.id)}
                      onMouseLeave={() => setActiveNode(null)}
                      onFocus={() => setActiveNode(node.id)}
                      onBlur={() => setActiveNode(null)}
                      tabIndex={0}
                    >
                      <div className="flex items-center gap-4 py-4">
                        <div className="z-10 bg-[#040d1a] rounded-full shrink-0">
                          <NeuralOrb size="sm" color="green" state={isActive ? "active" : "idle"}>
                            <div className={cn("transition-colors duration-300", isActive ? "text-primary-accent" : "text-text-muted group-hover:text-white")}>
                              {frameworkIcons[node.id] || <User size={14} aria-hidden="true" />}
                            </div>
                          </NeuralOrb>
                        </div>
                        <span className={cn("text-sm font-space font-bold uppercase tracking-wider transition-colors duration-300", isActive ? "text-white" : "text-text-secondary group-hover:text-text-primary")}>
                          {node.label}
                        </span>
                      </div>

                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="overflow-hidden pl-12"
                          >
                            <div className="flex flex-col gap-1.5 pb-5 pt-1">
                              {node.details.map((detail, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <div className="w-1 h-1 rounded-full bg-primary-accent/50" />
                                  <span className="text-xs font-inter text-text-muted">{detail}</span>
                                </div>
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
            B. SECTION HEADER (Our Foundation)
           ========================================== */}
        <div className="w-full flex items-center justify-center mt-24 md:mt-32 opacity-60">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20" />
          <div className="px-8 text-center">
            <div className="text-[12px] font-space font-bold tracking-[0.2em] uppercase text-text-muted mb-2">
              {visionMission.sectionMetadata.label}
            </div>
            <div className="text-sm font-inter text-text-secondary">
              {visionMission.sectionMetadata.preamble}
            </div>
          </div>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20" />
        </div>

        {/* ==========================================
            C. VISION (Where we are going)
           ========================================== */}
        <motion.div 
          className="max-w-5xl mx-auto rounded-[32px] bg-[#040d1a]/60 border border-white/5 p-12 lg:p-20 relative overflow-hidden group shadow-2xl backdrop-blur-md"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Light Glass Reflection */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent opacity-80" />
          
          <div className="grid lg:grid-cols-12 gap-16 relative z-10">
            {/* Vision Content */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 rounded-2xl border border-blue-500/20 bg-blue-500/10 flex items-center justify-center">
                  {React.createElement(getIcon(visionMission.vision.presentation.icon), { size: 20, className: "text-blue-400", "aria-hidden": "true" })}
                </div>
                <span className="text-[10px] font-space font-bold uppercase tracking-[0.2em] text-blue-400">Our Vision</span>
              </div>
              
              <h3 className="text-4xl md:text-[56px] font-space font-bold text-white leading-[1.15] mb-12">
                {visionMission.vision.content.headline}
              </h3>
              
              {/* Strategic Focus */}
              <div className="space-y-5">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest border-b border-white/10 pb-2 block w-full max-w-xs">
                  Strategic Focus
                </span>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                  {visionMission.vision.content.focusAreas.map((area, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-inter text-text-secondary group-hover:text-white transition-colors">
                      <div className="w-1.5 h-1.5 bg-blue-500/60 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" /> {area}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strategic Roadmap */}
            <div className="lg:col-span-5 lg:border-l lg:border-white/10 lg:pl-16 flex flex-col justify-center">
              <span className="text-[10px] font-mono text-blue-400/80 uppercase tracking-widest mb-10 block">Strategic Roadmap</span>
              <div className="relative border-l border-white/10 ml-2 space-y-12">
                {visionMission.vision.content.roadmap.map((step, i) => (
                  <div key={i} className="relative pl-8 group/step">
                    <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-white/20 border border-white/30 transition-all duration-300 group-hover/step:bg-blue-500 group-hover/step:border-blue-400 group-hover/step:shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
                    <div className="text-sm font-space font-bold text-white mb-1 transition-colors">{step.year}</div>
                    <div className="text-xs font-mono text-text-secondary group-hover/step:text-blue-300 transition-colors">{step.milestone}</div>
                  </div>
                ))}
                
                {/* Active Progress Traversal */}
                {!prefersReducedMotion && (
                  <motion.div 
                    className="absolute left-[-1px] top-0 w-[2px] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                    initial={{ height: 0 }}
                    whileInView={{ height: "40%" }} // Indicating progress between year 1 and 2 roughly
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                  />
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ==========================================
            D. THE NARRATIVE BEAM
           ========================================== */}
        <NarrativeBeam />

        {/* ==========================================
            E. MISSION (How we get there)
           ========================================== */}
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="text-center mb-20">
            <span className="text-[10px] font-space font-bold uppercase tracking-[0.2em] text-emerald-400 block mb-6">Our Mission</span>
            <h3 className="text-4xl md:text-[56px] font-space font-bold text-white leading-[1.1] max-w-4xl mx-auto">
              {visionMission.mission.content.headline}
            </h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {visionMission.mission.content.principles.map((principle, i) => {
              const Icon = getIcon(principle.presentation.icon);
              const theme = getThemeColors(principle.presentation.theme);
              
              return (
                <motion.div 
                  key={principle.id}
                  className={cn(
                    "group relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden transition-all duration-300",
                    theme.glow, "hover:bg-surface-elevated hover:border-white/10 cursor-default"
                  )}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  tabIndex={0}
                >
                  {/* Light Glass Reflection Top Edge */}
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-8 transition-colors", theme.bg, theme.border, "border")}>
                    <Icon size={20} className={theme.text} aria-hidden="true" />
                  </div>
                  
                  <h4 className="text-xl font-space font-bold text-white mb-4">{principle.title}</h4>
                  <p className="text-sm font-inter text-text-secondary leading-relaxed mb-10 h-12">
                    {principle.description}
                  </p>

                  <div className="pt-6 border-t border-white/5 mt-auto relative">
                    <span className="text-[10px] font-mono text-text-muted uppercase block mb-2">Key Metric</span>
                    <span className={cn("text-xs font-mono font-bold tracking-widest uppercase", theme.text)}>{principle.metric}</span>
                  </div>

                  {/* Hover Reveal (The teaching moment) */}
                  <div className="absolute inset-0 bg-[#040d1a]/98 backdrop-blur-xl p-8 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <h4 className={cn("text-[10px] font-space font-bold uppercase tracking-[0.2em] mb-4", theme.text)}>{principle.title} Philosophy</h4>
                    <p className="text-sm font-inter text-white/90 leading-relaxed border-l-2 border-white/10 pl-4">
                      {principle.hoverDescription}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ==========================================
            F. MICRO METRICS & OUTCOME
           ========================================== */}
        <motion.div 
          className="max-w-6xl mx-auto mt-20 md:mt-32 grid lg:grid-cols-2 gap-16 lg:gap-24 border-t border-white/10 pt-16 md:pt-24"
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1 }}
          viewport={{ once: true }}
        >
          {/* Micro Metrics */}
          <div className="grid grid-cols-2 gap-10">
            {visionMission.microMetrics.map((metric, i) => (
              <div key={i}>
                <div className="text-4xl font-space font-bold text-white mb-2">{metric.value}</div>
                <div className="text-xs font-mono uppercase tracking-widest text-text-muted">{metric.label}</div>
              </div>
            ))}
          </div>

          {/* Expected Outcome */}
          <div className="lg:border-l lg:border-white/10 lg:pl-16">
            <span className="text-[10px] font-space font-bold uppercase tracking-[0.2em] text-emerald-400 block mb-8">
              {visionMission.expectedOutcome.headline}
            </span>
            <div className="flex flex-wrap gap-4">
              {visionMission.expectedOutcome.traits.map((trait, i) => (
                <div key={i} className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/90 hover:bg-white/10 hover:border-white/20 transition-colors cursor-default">
                  {trait}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
