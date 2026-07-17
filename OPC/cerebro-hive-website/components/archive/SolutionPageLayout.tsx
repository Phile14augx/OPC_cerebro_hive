"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Solution } from '@/lib/data/solutions/types';
import { cn } from '@/lib/utils';
import { SectionHeading } from '../ui/SectionHeading';
import { ArchitectureCanvas } from '../architecture/ArchitectureCanvas';
import { CheckCircle2, ChevronRight, Activity, Cpu, ShieldCheck, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SolutionPageLayout({ solution }: { solution: Solution }) {
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={solution.slug}
        initial={{ opacity: 0.4, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="bg-background min-h-screen transition-colors duration-500 relative"
      >
        {/* Dynamic Abstract Background */}
        <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-b opacity-50 from-primary-accent/5 via-transparent to-primary-accent/5" />

        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col items-center justify-center z-10 border-b border-border">
          <div className="container-wide flex flex-col items-center">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 backdrop-blur-sm shadow-sm">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: solution.color }} />
                <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">{solution.hero.subtitle}</span>
             </div>
             
             <h1 className="text-5xl md:text-7xl font-space font-bold text-text-primary leading-[1.1] tracking-tight mb-6 max-w-4xl">
               {solution.hero.title}
             </h1>
             
             <p className="text-lg md:text-xl text-text-secondary font-inter max-w-2xl leading-relaxed mb-10">
               {solution.hero.description}
             </p>

             <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
                <button className="w-full sm:w-auto px-8 py-4 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg transition-transform hover:-translate-y-1 shadow-elevated">
                  {solution.hero.primaryCta}
                </button>
                <button className="w-full sm:w-auto px-8 py-4 bg-surface border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg hover:border-primary-accent/50 hover:bg-surface-elevated transition-all duration-300">
                  {solution.hero.secondaryCta}
                </button>
             </div>
          </div>
        </section>

        <div className="relative z-10">
          
          {/* Overview & Business Problems */}
          <section className="section-pad border-b border-border bg-surface-elevated">
            <div className="container-wide">
              <SectionHeading label="Business Case" title="The Enterprise Challenge" description={solution.overview} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
                {solution.businessProblems.map((bp, i) => (
                  <div key={i} className="p-8 rounded-2xl bg-surface border border-border flex flex-col justify-between group hover:border-primary-accent/50 transition-colors shadow-sm">
                    <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-4">Problem</span>
                    <h4 className="text-lg font-bold text-text-primary mb-6">{bp.problem}</h4>
                    <div className="pt-4 border-t border-border">
                      <span className="text-xs font-mono text-primary-accent font-bold uppercase tracking-wider block mb-1">Business Impact</span>
                      <span className="text-sm text-text-secondary">{bp.impact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Interactive Architecture (React Flow) */}
          <section className="section-pad border-b border-border">
            <div className="container-wide flex flex-col gap-8">
              <SectionHeading label="Architecture" title="Reference Architecture" description="Standardized deployment model." />
              {solution.architecture.nodes.length > 0 ? (
                 <ArchitectureCanvas 
                   initialNodes={solution.architecture.nodes} 
                   initialEdges={solution.architecture.edges} 
                   direction="LR"
                 />
              ) : (
                <div className="w-full h-[400px] bg-surface-elevated border border-border rounded-xl flex items-center justify-center text-text-muted text-sm font-mono shadow-sm">
                  [ Architecture Data Pending ]
                </div>
              )}
            </div>
          </section>

          {/* AI Agents Ecosystem */}
          {solution.agents && solution.agents.length > 0 && (
             <section className="section-pad border-b border-border bg-surface-elevated">
               <div className="container-wide flex flex-col gap-8">
                 <SectionHeading label="AI Ecosystem" title="Digital Workforce" description="Specialized agents working in orchestration." />
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    {solution.agents.map((agent, i) => (
                      <div key={i} className="p-6 rounded-2xl bg-surface border border-border shadow-sm flex flex-col gap-4 group">
                        <div className="w-12 h-12 rounded-full bg-primary-accent/10 border border-primary-accent/20 flex items-center justify-center">
                          <Cpu size={24} className="text-primary-accent" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-text-primary mb-2">{agent.name}</h4>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3 block">{agent.role}</span>
                          <p className="text-sm text-text-secondary leading-relaxed">{agent.description}</p>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
             </section>
          )}

          {/* Business Outcomes */}
          <section className="section-pad border-b border-border">
            <div className="container-wide">
               <SectionHeading label="ROI" title="Measurable Outcomes" description="Realized business value." />
               <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
                 {solution.roi.map((out, i) => (
                   <div key={i} className="flex flex-col border-l border-border pl-6">
                     <span className="text-4xl md:text-5xl font-space font-bold text-text-primary mb-2">{out.metric}</span>
                     <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-3">{out.label}</span>
                     <p className="text-sm text-text-secondary leading-relaxed">{out.description}</p>
                   </div>
                 ))}
               </div>
            </div>
          </section>

          {/* Resources */}
          <section className="section-pad border-b border-border bg-surface-elevated">
            <div className="container-wide">
               <SectionHeading label="Resources" title="Further Reading" description="Deep dives and documentation." />
               <div className="flex flex-col gap-4 mt-16">
                 {solution.resources.map((res, i) => (
                   <Link key={i} href={res.link} className="flex items-center justify-between p-6 rounded-2xl bg-surface border border-border shadow-sm hover:border-primary-accent/50 transition-colors group">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border">
                         <FileText size={16} className="text-text-muted group-hover:text-primary-accent transition-colors" />
                       </div>
                       <div className="flex flex-col">
                         <span className="text-sm font-bold text-text-primary">{res.title}</span>
                         <span className="text-xs text-text-muted uppercase tracking-widest font-bold mt-1">{res.type}</span>
                       </div>
                     </div>
                     <ArrowRight size={20} className="text-text-muted group-hover:text-primary-accent transition-colors transform group-hover:translate-x-2" />
                   </Link>
                 ))}
               </div>
            </div>
          </section>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
