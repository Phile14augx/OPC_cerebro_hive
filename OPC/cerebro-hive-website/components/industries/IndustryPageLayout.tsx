"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Industry } from '@/lib/data/industries/types';
import { industriesData } from '@/lib/data/industries';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArchitectureCanvas } from '../architecture/ArchitectureCanvas';
import { SectionHeading } from '../ui/SectionHeading';
import { CheckCircle2, ChevronRight, Activity, Cpu, ShieldCheck } from 'lucide-react';

// Sticky Navigator
const IndustryNavigator = ({ currentSlug }: { currentSlug: string }) => {
  return (
    <div className="sticky top-20 z-40 bg-background/90 backdrop-blur-xl border-y border-border py-4 hidden lg:block shadow-elevated">
      <div className="container-wide flex justify-center gap-8 overflow-x-auto no-scrollbar">
        {industriesData.map(s => {
          const isActive = currentSlug === s.slug;
          return (
            <Link 
              key={s.slug} 
              href={`/industries/${s.slug}`}
              className={cn(
                "text-xs font-bold tracking-widest uppercase transition-all duration-300 relative py-2 whitespace-nowrap",
                isActive ? "text-text-primary" : "text-text-muted hover:text-text-secondary"
              )}
            >
              {s.name}
              {isActive && (
                <motion.div 
                  layoutId="ind-nav-indicator"
                  className="absolute -bottom-4 left-0 w-full h-[2px] rounded-t-full bg-primary-accent"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default function IndustryPageLayout({ industry }: { industry: Industry }) {
  
  // Dynamic Background style simulation based on slug
  const bgGradient = industry.slug === 'healthcare' 
    ? 'from-[#00E5FF]/5 via-transparent to-[#00E5FF]/5'
    : industry.slug === 'finance'
    ? 'from-[#7B61FF]/5 via-transparent to-[#7B61FF]/5'
    : 'from-primary-accent/5 via-transparent to-primary-accent/5';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={industry.slug}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="bg-background min-h-screen transition-colors duration-500 relative"
      >
        {/* Dynamic Abstract Background */}
        <div className={cn("absolute inset-0 pointer-events-none z-0 bg-gradient-to-b opacity-50", bgGradient)} />

        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden z-10">
          <div className="container-wide flex flex-col items-center">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 backdrop-blur-sm shadow-sm">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: industry.color }} />
                <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">{industry.hero.subtitle}</span>
             </div>
             
             <h1 className="text-5xl md:text-7xl font-space font-bold text-text-primary leading-[1.1] tracking-tight mb-6 max-w-4xl">
               {industry.hero.title}
             </h1>
             
             <p className="text-lg md:text-xl text-text-secondary font-inter max-w-2xl leading-relaxed mb-10">
               {industry.hero.description}
             </p>

             <div className="flex gap-4">
                <button className="px-8 py-4 bg-primary-accent text-black font-space font-bold text-sm uppercase tracking-widest rounded-lg transition-transform hover:-translate-y-1">
                  {industry.hero.primaryCta}
                </button>
             </div>
          </div>
        </section>

        <IndustryNavigator currentSlug={industry.slug} />

        <div className="relative z-10">
          
          {/* Overview & Challenges Bento */}
          <section className="section-pad border-b border-border">
            <div className="container-wide">
              <SectionHeading label="Overview" title="The State of the Industry" description="Current landscape and critical bottlenecks." />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-16">
                
                {/* Maturity Score */}
                <div className="p-8 rounded-2xl bg-surface-elevated border border-border flex flex-col justify-center items-center text-center h-full">
                   <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-4">AI Maturity Score</span>
                   <div className="relative w-32 h-32 flex items-center justify-center">
                     <svg className="w-full h-full -rotate-90">
                       <circle cx="64" cy="64" r="60" className="stroke-surface fill-none" strokeWidth="8" />
                       <circle cx="64" cy="64" r="60" className="fill-none transition-all duration-1000" strokeWidth="8" strokeDasharray="377" strokeDashoffset={377 - (377 * industry.overview.maturityScore) / 100} style={{ stroke: industry.color }} strokeLinecap="round" />
                     </svg>
                     <span className="absolute text-3xl font-space font-bold text-text-primary">{industry.overview.maturityScore}</span>
                   </div>
                   <p className="text-sm text-text-secondary mt-6">Below enterprise average.</p>
                </div>

                {/* Challenges Grid */}
                <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {industry.challenges.map((c, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between group hover:border-primary-accent/50 transition-colors">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-2">{c.businessImpact}</span>
                        <h4 className="text-lg font-bold text-text-primary mb-3">{c.title}</h4>
                        <p className="text-sm text-text-secondary leading-relaxed">{c.pain}</p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-border">
                        <span className="text-xs font-mono text-primary-accent font-bold">{c.cost}</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </section>

          {/* AI Opportunity Matrix */}
          <section className="py-24 border-b border-border bg-surface-elevated">
            <div className="container-wide">
              <SectionHeading label="Matrix" title="AI Opportunity Matrix" description="High ROI use-cases categorized by readiness." />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                 {['High', 'Medium', 'Emerging'].map((level) => (
                   <div key={level} className="flex flex-col gap-4">
                     <div className="p-3 border-b border-border">
                       <h5 className="text-sm font-bold text-text-primary uppercase tracking-widest">{level} ROI</h5>
                     </div>
                     {industry.opportunityMatrix.filter(o => o.roi === level).map((o, i) => (
                       <div key={i} className="p-5 rounded-xl bg-surface border border-border hover:shadow-elevated transition-shadow">
                         <h6 className="text-sm font-bold text-text-primary mb-2">{o.name}</h6>
                         <p className="text-xs text-text-secondary leading-relaxed">{o.description}</p>
                       </div>
                     ))}
                   </div>
                 ))}
              </div>
            </div>
          </section>

          {/* Interactive Architecture (React Flow) */}
          <section className="section-pad border-b border-border">
            <div className="container-wide flex flex-col gap-8">
              <SectionHeading label="Architecture" title="Reference Architecture" description="Standardized deployment model." />
              {industry.architecture.nodes.length > 0 ? (
                 <ArchitectureCanvas 
                   initialNodes={industry.architecture.nodes} 
                   initialEdges={industry.architecture.edges} 
                   direction="LR"
                 />
              ) : (
                <div className="w-full h-[400px] bg-surface border border-border rounded-xl flex items-center justify-center text-text-muted text-sm font-mono">
                  [ Architecture Data Pending ]
                </div>
              )}
            </div>
          </section>

          {/* Workflows (React Flow) */}
          <section className="py-24 border-b border-border bg-surface-elevated">
            <div className="container-wide flex flex-col gap-8">
              <SectionHeading label="Workflows" title="Enterprise Workflows" description="Automated business processes." />
              {industry.workflows.nodes.length > 0 ? (
                 <ArchitectureCanvas 
                   initialNodes={industry.workflows.nodes} 
                   initialEdges={industry.workflows.edges} 
                   direction="LR"
                   className="h-[400px]"
                 />
              ) : (
                <div className="w-full h-[300px] bg-surface border border-border rounded-xl flex items-center justify-center text-text-muted text-sm font-mono">
                  [ Workflow Data Pending ]
                </div>
              )}
            </div>
          </section>

          {/* Business Outcomes */}
          <section className="section-pad border-b border-border">
            <div className="container-wide">
               <SectionHeading label="Outcomes" title="Business Impact" description="Measurable results from AI adoption." />
               <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
                 {industry.outcomes.map((out, i) => (
                   <div key={i} className="flex flex-col border-l border-border pl-6">
                     <span className="text-4xl md:text-5xl font-space font-bold text-text-primary mb-2">{out.metric}</span>
                     <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3" style={{ color: industry.color }}>{out.label}</span>
                     <p className="text-sm text-text-secondary leading-relaxed">{out.description}</p>
                   </div>
                 ))}
               </div>
            </div>
          </section>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
