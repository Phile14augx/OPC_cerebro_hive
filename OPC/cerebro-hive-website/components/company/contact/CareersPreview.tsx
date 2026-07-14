"use client";

import React, { useState } from "react";
import { careerDomains, CareerDomain } from "@/lib/content/company/careers";
import { ArrowRight, Briefcase, Network, Atom, Cpu, Cloud, LayoutGrid, X, CheckCircle2, ChevronRight, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NeuralOrb } from "@/components/ui/NeuralOrb";
import { cn } from "@/lib/utils";

// Icon Mapper
const IconMap: Record<string, React.ElementType> = {
  Network,
  Atom,
  Cpu,
  Cloud,
  LayoutGrid
};

// Theme Config
const themeConfig = {
  cyan: { border: "border-cyan-500/30", hover: "hover:border-cyan-500/60", text: "text-cyan-500", bg: "bg-cyan-500/10" },
  purple: { border: "border-purple-500/30", hover: "hover:border-purple-500/60", text: "text-purple-500", bg: "bg-purple-500/10" },
  blue: { border: "border-blue-500/30", hover: "hover:border-blue-500/60", text: "text-blue-500", bg: "bg-blue-500/10" },
  teal: { border: "border-teal-500/30", hover: "hover:border-teal-500/60", text: "text-teal-500", bg: "bg-teal-500/10" },
  orange: { border: "border-orange-500/30", hover: "hover:border-orange-500/60", text: "text-orange-500", bg: "bg-orange-500/10" }
};

export const CareersPreview = () => {
  const [activeDomain, setActiveDomain] = useState<CareerDomain | null>(null);

  // Close inspector when clicking outside
  const handleClose = () => setActiveDomain(null);

  return (
    <section id="careers" className="section-pad bg-background border-t border-border relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-accent/5 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="container-wide relative z-10">
        
        <div className="flex flex-col lg:flex-row gap-16 xl:gap-24 items-start max-w-7xl mx-auto">
          
          {/* ==========================================
              LEFT: ASPIRATIONAL MISSION
             ========================================== */}
          <div className="lg:w-[35%] sticky top-[120px]">
            <h2 className="text-xs font-space font-bold tracking-widest uppercase text-text-muted mb-6 flex items-center gap-2">
              <Briefcase size={14} /> Join The Mission
            </h2>
            <h3 className="text-4xl md:text-5xl font-space font-bold text-white tracking-tight mb-8 leading-tight">
              Build the systems that will define how enterprises adopt AI over the next decade.
            </h3>
            
            <p className="text-lg text-text-secondary font-inter mb-10 pl-4 border-l-2 border-primary-accent/50 leading-relaxed">
              We don't ship demos. We build production AI. If you want to solve the hardest execution problems in enterprise intelligence, we want to talk.
            </p>

            {/* How We Work Principles */}
            <div className="mb-12">
              <h4 className="text-[10px] font-space font-bold tracking-widest uppercase text-text-muted mb-4">How We Work</h4>
              <ul className="flex flex-col gap-3">
                {['Build for production', 'Measure everything', 'Research before implementation', 'Design for enterprise scale'].map((principle, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-inter text-text-primary">
                    <CheckCircle2 size={14} className="text-primary-accent opacity-70" />
                    {principle}
                  </li>
                ))}
              </ul>
            </div>

            {/* Employee Impact Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-12 py-6 border-t border-b border-border/50">
              <div className="flex flex-col">
                <span className="text-2xl font-space font-bold text-white">145</span>
                <span className="text-[10px] font-mono uppercase text-text-muted">Engineers</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-space font-bold text-white">12</span>
                <span className="text-[10px] font-mono uppercase text-text-muted">R&D Teams</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-space font-bold text-white">34</span>
                <span className="text-[10px] font-mono uppercase text-text-muted">AI Projects</span>
              </div>
            </div>

            <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-accent/50 transition-all text-sm font-space font-bold text-white uppercase tracking-wider group">
              Explore Opportunities <ArrowRight size={16} className="text-primary-accent group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* ==========================================
              RIGHT: TALENT DOMAINS GRID
             ========================================== */}
          <div className="lg:w-[65%] w-full relative">
            <div className="columns-1 md:columns-2 gap-4 space-y-4">
              {careerDomains.map((domain, index) => {
                const Icon = IconMap[domain.iconName] || Briefcase;
                const theme = themeConfig[domain.theme];
                const isSelected = activeDomain?.id === domain.id;

                return (
                  <motion.div 
                    key={domain.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onClick={() => setActiveDomain(domain)}
                    className={cn(
                      "break-inside-avoid relative p-6 lg:p-8 rounded-3xl bg-surface-elevated border flex flex-col items-start cursor-pointer group transition-all duration-300 overflow-hidden",
                      isSelected ? "border-primary-accent shadow-[0_0_30px_rgba(0,245,122,0.15)] scale-[1.02]" : "border-border hover:-translate-y-1 shadow-lg",
                      theme.hover
                    )}
                  >
                    {/* Hover Gradient Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br from-white to-transparent" />
                    
                    <div className="relative z-10 w-full flex flex-col h-full">
                      
                      {/* Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border", theme.bg, theme.border, theme.text)}>
                          <Icon size={20} />
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Status Badge */}
                          <div className={cn("px-2 py-1 rounded-full border text-[9px] font-mono uppercase tracking-widest flex items-center gap-1.5", theme.border, theme.bg, theme.text)}>
                            <NeuralOrb size="sm" color={domain.theme as any} state="active" />
                            {domain.hiringStatus}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <h4 className="text-2xl font-space font-bold text-white mb-2 group-hover:text-primary-accent transition-colors">
                        {domain.domain}
                      </h4>
                      <p className="text-sm text-text-secondary font-inter mb-8 line-clamp-2">
                        {domain.description}
                      </p>

                      {/* Footer Metrics */}
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-border w-full">
                        <div className="flex gap-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-mono text-text-muted uppercase">Roles</span>
                            <span className="text-sm font-space font-bold text-white">{domain.openRoles}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-mono text-text-muted uppercase">Level</span>
                            <span className="text-sm font-space font-bold text-white truncate max-w-[100px]">{domain.seniority}</span>
                          </div>
                        </div>
                        
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary-accent group-hover:text-black transition-colors">
                          <ArrowRight size={14} className={cn("transition-transform", isSelected ? "rotate-45" : "-rotate-45")} />
                        </div>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* ==========================================
          CONTEXTUAL INSPECTOR (SLIDE OVER)
         ========================================== */}
      <AnimatePresence>
        {activeDomain && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden" // Only dim on mobile/tablet where it covers the screen
            />

            {/* Inspector Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#05080f] border-l border-white/10 z-50 overflow-y-auto custom-scrollbar shadow-2xl flex flex-col"
            >
              {/* Inspector Header */}
              <div className="sticky top-0 bg-[#05080f]/90 backdrop-blur-md border-b border-white/10 p-6 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", themeConfig[activeDomain.theme].bg, themeConfig[activeDomain.theme].border, themeConfig[activeDomain.theme].text)}>
                    {React.createElement(IconMap[activeDomain.iconName] || Briefcase, { size: 16 })}
                  </div>
                  <h3 className="text-lg font-space font-bold text-white">{activeDomain.domain}</h3>
                </div>
                <button onClick={handleClose} className="p-2 rounded-full hover:bg-white/10 transition-colors text-text-muted hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {/* Inspector Body */}
              <div className="p-6 flex flex-col gap-10">
                
                {/* Meta */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/5 p-3 rounded-lg flex flex-col gap-1">
                    <span className="text-[10px] font-mono uppercase text-text-muted flex items-center gap-1.5"><MapPin size={10}/> Location</span>
                    <span className="text-sm font-space text-white">{activeDomain.location}</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-3 rounded-lg flex flex-col gap-1">
                    <span className="text-[10px] font-mono uppercase text-text-muted">Seniority</span>
                    <span className="text-sm font-space text-white">{activeDomain.seniority}</span>
                  </div>
                </div>

                {/* What You'll Build */}
                <section>
                  <h4 className="text-xs font-space font-bold uppercase tracking-widest text-primary-accent mb-3">What You'll Build</h4>
                  <p className="text-sm text-text-secondary font-inter leading-relaxed bg-[#0a0f18] p-4 rounded-xl border border-white/5">
                    {activeDomain.impact}
                  </p>
                </section>

                {/* Engineering Problems */}
                <section>
                  <h4 className="text-xs font-space font-bold uppercase tracking-widest text-text-muted mb-3">Problems We're Solving</h4>
                  <ul className="flex flex-col gap-2">
                    {activeDomain.problems.map((problem, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/90">
                        <ChevronRight size={16} className="text-primary-accent shrink-0 mt-0.5" />
                        {problem}
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Career Path */}
                <section>
                  <h4 className="text-xs font-space font-bold uppercase tracking-widest text-text-muted mb-4">Career Trajectory</h4>
                  <div className="flex flex-col relative pl-2">
                    <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-white/10" />
                    {activeDomain.careerPath.map((path, i) => (
                      <div key={i} className="flex items-center gap-4 py-2 relative z-10">
                        <div className="w-2 h-2 rounded-full bg-[#05080f] border-2 border-white/30" />
                        <span className={cn("text-sm font-space", i === activeDomain.careerPath.length - 1 ? "text-primary-accent font-bold" : "text-text-secondary")}>
                          {path}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Tech Stack */}
                <section>
                  <h4 className="text-xs font-space font-bold uppercase tracking-widest text-text-muted mb-3">Technology Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeDomain.technologies.map((tech, i) => (
                      <span key={i} className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-white/80">
                        {tech}
                      </span>
                    ))}
                  </div>
                </section>

              </div>

              {/* Inspector Footer */}
              <div className="mt-auto p-6 border-t border-white/10 bg-[#020306]">
                <button className={cn(
                  "w-full py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-space font-bold uppercase tracking-widest transition-colors border",
                  themeConfig[activeDomain.theme].bg, themeConfig[activeDomain.theme].border, themeConfig[activeDomain.theme].text, "hover:bg-white/10 hover:text-white"
                )}>
                  View {activeDomain.openRoles} Open Roles <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </section>
  );
};
