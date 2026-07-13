"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { solutionsData } from '@/lib/data/solutions';
import { SectionHeading } from '../ui/SectionHeading';
import { 
  ArrowRight, Search, ChevronDown, ChevronRight, CheckCircle2, 
  Cpu, Network, ShieldCheck, Box, Workflow, Layers, 
  FileText, Download, Target, Users, Zap
} from 'lucide-react';
import Link from 'next/link';
import { SVGArchitecturePipeline } from './SVGArchitecturePipeline';
import { Solution } from '@/lib/data/solutions/types';

export const InteractiveSolutionExplorer = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSlug, setActiveSlug] = useState(solutionsData[0].slug);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "AI & Generative AI": true,
    "Enterprise Automation": true,
  });
  
  // Track expanded capabilities
  const [expandedCapabilityIndex, setExpandedCapabilityIndex] = useState<number | null>(null);

  // Group and filter solutions
  const groupedSolutions = useMemo(() => {
    const query = searchQuery.toLowerCase();
    
    // Filter first
    const filtered = solutionsData.filter(sol => 
      sol.name.toLowerCase().includes(query) || 
      sol.tagline?.toLowerCase().includes(query) ||
      sol.category.toLowerCase().includes(query) ||
      sol.industries?.some(i => i.toLowerCase().includes(query))
    );
    
    // Group
    const groups: Record<string, typeof solutionsData> = {};
    filtered.forEach(sol => {
      if (!groups[sol.category]) groups[sol.category] = [];
      groups[sol.category].push(sol);
    });
    
    return groups;
  }, [searchQuery]);

  const activeSolution = useMemo(() => 
    solutionsData.find(s => s.slug === activeSlug) || solutionsData[0],
  [activeSlug]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Reset expanded capability when solution changes
  useEffect(() => {
    setExpandedCapabilityIndex(null);
  }, [activeSlug]);

  return (
    <section className="py-24 border-b border-border relative overflow-hidden">
      
      {/* Morphing Background */}
      <div className="absolute inset-0 z-0 pointer-events-none transition-colors duration-1000" style={{ backgroundColor: 'var(--color-background)' }}>
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] opacity-[0.03] transition-all duration-1000 ease-in-out"
          style={{ backgroundColor: activeSolution.color }}
        />
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02]" />
      </div>

      <div className="container-wide relative z-10">
        <SectionHeading 
          label="Explorer" 
          title="Interactive Solution Design Studio" 
          description="Select a business challenge to explore our enterprise architecture, expected outcomes, and technical stack." 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
          
          {/* ========================================== */}
          {/* LEFT PANEL: Navigator (3 Cols)             */}
          {/* ========================================== */}
          <div className="col-span-1 lg:col-span-3 flex flex-col h-[850px]">
            
            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search solutions, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-border focus:border-primary-accent rounded-lg pl-10 pr-4 py-3 text-sm text-text-primary focus:outline-none transition-colors shadow-sm"
              />
            </div>

            {/* Accordion List */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
              {Object.entries(groupedSolutions).map(([category, solutions]) => {
                const isExpanded = expandedCategories[category] !== false; // Default true for matching ones
                return (
                  <div key={category} className="flex flex-col rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
                    {/* Category Header */}
                    <button 
                      onClick={() => toggleCategory(category)}
                      className="flex items-center justify-between p-4 bg-surface-elevated/50 hover:bg-surface-elevated transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-text-primary">
                          {category}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-background border border-border text-[9px] font-bold text-text-muted">
                          {solutions.length}
                        </span>
                      </div>
                      <ChevronDown size={14} className={`text-text-muted transition-transform duration-300 ${isExpanded ? '' : '-rotate-90'}`} />
                    </button>
                    
                    {/* Solutions List */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="flex flex-col border-t border-border overflow-hidden"
                        >
                          {solutions.map((sol) => {
                            const isActive = activeSlug === sol.slug;
                            return (
                              <button
                                key={sol.slug}
                                onClick={() => setActiveSlug(sol.slug)}
                                className={`flex items-center gap-3 p-3 text-left transition-all border-l-2 relative overflow-hidden group ${
                                  isActive 
                                    ? 'bg-background border-l-transparent text-text-primary' 
                                    : 'bg-surface border-l-transparent text-text-secondary hover:bg-background'
                                }`}
                                style={{ borderLeftColor: isActive ? sol.color : 'transparent' }}
                              >
                                {isActive && (
                                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none" style={{ backgroundImage: `linear-gradient(to right, ${sol.color}15, transparent)` }} />
                                )}
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${isActive ? 'scale-100' : 'scale-50 opacity-50 group-hover:scale-100 group-hover:opacity-100'}`} style={{ backgroundColor: sol.color }} />
                                <span className={`text-xs font-bold ${isActive ? '' : 'font-medium'}`}>
                                  {sol.name}
                                </span>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
              
              {Object.keys(groupedSolutions).length === 0 && (
                <div className="text-center py-8 text-sm text-text-muted">
                  No solutions found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>

          {/* ========================================== */}
          {/* CENTER PANEL: Solution Story (6 Cols)      */}
          {/* ========================================== */}
          <div className="col-span-1 lg:col-span-6 h-[850px] relative rounded-2xl bg-surface border border-border shadow-sm overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSolution.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col overflow-y-auto custom-scrollbar"
              >
                {/* 1. Solution Header */}
                <div className="p-8 border-b border-border bg-surface-elevated/30">
                  <div className="flex gap-2 flex-wrap mb-4">
                    <span className="px-2 py-1 rounded text-[9px] uppercase tracking-widest font-bold bg-background border border-border text-text-primary flex items-center gap-1">
                      <StarRating score={5} color={activeSolution.color} /> {activeSolution.readiness}
                    </span>
                    <span className="px-2 py-1 rounded text-[9px] uppercase tracking-widest font-bold bg-background border border-border text-text-muted">
                      Difficulty: {activeSolution.difficulty}
                    </span>
                    <span className="px-2 py-1 rounded text-[9px] uppercase tracking-widest font-bold bg-background border border-border text-text-muted">
                      {activeSolution.implementationWeeks}
                    </span>
                  </div>
                  <h3 className="text-3xl font-space font-bold text-text-primary mb-2">{activeSolution.name}</h3>
                  <p className="text-sm text-text-secondary font-bold mb-4" style={{ color: activeSolution.color }}>{activeSolution.tagline}</p>
                  <p className="text-sm text-text-muted leading-relaxed">{activeSolution.overview}</p>
                  
                  {/* Industry Chips */}
                  {activeSolution.industries && activeSolution.industries.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {activeSolution.industries.map(ind => (
                        <span key={ind} className="text-[10px] px-2 py-0.5 rounded-full bg-surface-elevated border border-border text-text-secondary">
                          {ind}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Business Challenges */}
                {activeSolution.businessProblems && activeSolution.businessProblems.length > 0 && (
                  <div className="p-8 border-b border-border">
                    <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-4 flex items-center gap-2">
                      <Target size={14} /> Business Challenges Addressed
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeSolution.businessProblems.map((prob, i) => (
                        <div key={i} className="p-4 rounded-xl bg-background border border-border group hover:border-text-muted transition-colors relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-red-500/20 group-hover:bg-red-500/50 transition-colors" />
                          <h4 className="text-xs font-bold text-text-primary mb-2">{prob.problem}</h4>
                          <p className="text-[10px] text-text-muted leading-relaxed">{prob.impact}</p>
                          {prob.aiSolution && (
                            <div className="mt-3 pt-3 border-t border-border border-dashed">
                              <span className="text-[9px] uppercase text-text-primary font-bold block mb-1" style={{ color: activeSolution.color }}>AI Solution</span>
                              <p className="text-[10px] text-text-secondary">{prob.aiSolution}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Reference Architecture Pipeline */}
                <div className="p-8 border-b border-border bg-background/50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold flex items-center gap-2">
                      <Network size={14} /> Reference Architecture
                    </span>
                    <Link href={`/solutions/${activeSolution.slug}`} className="text-[10px] uppercase tracking-widest font-bold text-text-primary hover:underline flex items-center gap-1">
                      Full Diagram <ArrowRight size={12} />
                    </Link>
                  </div>
                  <SVGArchitecturePipeline pipeline={activeSolution.pipeline} color={activeSolution.color} />
                </div>

                {/* 4. Horizontal Workflow */}
                {activeSolution.workflowSteps && activeSolution.workflowSteps.length > 0 && (
                  <div className="p-8 border-b border-border overflow-x-auto custom-scrollbar">
                     <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-6 flex items-center gap-2">
                      <Workflow size={14} /> Implementation Workflow
                    </span>
                    <div className="flex items-start min-w-max">
                      {activeSolution.workflowSteps.map((step, i) => (
                        <div key={i} className="flex items-center">
                          <div className="flex flex-col items-center gap-3 w-32">
                            <div className="w-8 h-8 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-xs font-bold text-text-primary relative z-10">
                              {step.step}
                            </div>
                            <div className="text-center">
                              <span className="text-[11px] font-bold text-text-primary block">{step.name}</span>
                              <span className="text-[9px] text-text-muted">{step.description}</span>
                            </div>
                          </div>
                          {i < activeSolution.workflowSteps.length - 1 && (
                            <div className="w-16 h-px bg-border -mt-8 relative">
                               <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t border-r border-border rotate-45" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4.5 Deliverables & Engagement */}
                {(activeSolution.deliverables || activeSolution.engagementModels) && (
                  <div className="p-8 border-b border-border bg-surface-elevated/20 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {activeSolution.deliverables && activeSolution.deliverables.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-4 flex items-center gap-2">
                          <FileText size={14} /> Expected Deliverables
                        </span>
                        <ul className="flex flex-col gap-2">
                          {activeSolution.deliverables.map((item, i) => (
                            <li key={i} className="text-xs font-bold text-text-secondary flex items-start gap-2">
                              <CheckCircle2 size={14} className="text-primary-accent shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {activeSolution.engagementModels && activeSolution.engagementModels.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-4 flex items-center gap-2">
                          <Users size={14} /> Engagement Models
                        </span>
                        <div className="flex flex-col gap-2">
                          {activeSolution.engagementModels.map((item, i) => (
                            <div key={i} className="p-3 rounded-lg border border-border bg-background text-xs font-bold text-text-secondary">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Core Capabilities (Expandable) */}
                <div className="p-8 pb-12">
                   <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-4 flex items-center gap-2">
                    <Layers size={14} /> Core Capabilities
                  </span>
                  <div className="flex flex-col gap-3">
                    {activeSolution.capabilities?.map((cap, i) => {
                      const isExpanded = expandedCapabilityIndex === i;
                      return (
                        <div key={i} className="rounded-xl border border-border bg-background overflow-hidden transition-all duration-300">
                          <button 
                            onClick={() => setExpandedCapabilityIndex(isExpanded ? null : i)}
                            className="w-full flex items-center justify-between p-4 hover:bg-surface-elevated/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <CheckCircle2 size={16} className="shrink-0" style={{ color: activeSolution.color }} />
                              <span className="text-sm font-bold text-text-primary">{cap.name}</span>
                            </div>
                            <ChevronDown size={16} className={`text-text-muted transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                          
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-4 pt-0 border-t border-border mt-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <p className="text-xs text-text-secondary leading-relaxed mb-3 mt-3">{cap.description}</p>
                                    {cap.benefits && cap.benefits.length > 0 && (
                                      <ul className="flex flex-col gap-1.5">
                                        {cap.benefits.map((ben, bi) => (
                                          <li key={bi} className="text-[10px] text-text-muted flex items-start gap-1.5">
                                            <span className="w-1 h-1 rounded-full bg-text-muted shrink-0 mt-1.5" />
                                            {ben}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                  <div className="bg-surface p-3 rounded-lg border border-border self-start mt-3">
                                    <span className="text-[9px] uppercase tracking-widest font-bold text-text-primary block mb-2">Technologies Used</span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {cap.techUsed?.map((tech, ti) => (
                                        <span key={ti} className="text-[10px] px-2 py-0.5 rounded bg-background border border-border text-text-secondary">
                                          {tech}
                                        </span>
                                      )) || <span className="text-[10px] text-text-muted">Platform Native</span>}
                                    </div>
                                  </div>
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
            </AnimatePresence>
          </div>

          {/* ========================================== */}
          {/* RIGHT PANEL: Executive View (3 Cols)       */}
          {/* ========================================== */}
          <div className="col-span-1 lg:col-span-3 flex flex-col gap-6">
            
            {/* KPI Dashboard */}
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-4">Expected Outcomes</span>
              <div className="grid grid-cols-2 gap-4">
                {activeSolution.roi?.slice(0,4).map((roiItem, i) => (
                  <div key={i} className="flex flex-col p-3 rounded-xl bg-background border border-border text-center justify-center">
                    <span className="text-2xl font-space font-bold mb-1" style={{ color: activeSolution.color }}>
                      {roiItem.metric}
                    </span>
                    <span className="text-[10px] font-bold text-text-primary">{roiItem.label}</span>
                  </div>
                ))}
                
                {/* Fallback if less than 4 ROI items provided */}
                {Array.from({ length: Math.max(0, 4 - (activeSolution.roi?.length || 0)) }).map((_, i) => (
                   <div key={`fallback-${i}`} className="flex flex-col p-3 rounded-xl bg-background border border-border border-dashed text-center justify-center opacity-50">
                    <span className="text-xl font-space font-bold mb-1 text-text-muted">-</span>
                    <span className="text-[10px] font-bold text-text-muted">Metric</span>
                 </div>
                ))}
              </div>
            </div>

            {/* Tech Stack Chips */}
            {activeSolution.techStackFlat && activeSolution.techStackFlat.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-4 flex items-center gap-2">
                  <Box size={14} /> Technology Stack
                </span>
                <div className="flex flex-col gap-2">
                  {activeSolution.techStackFlat.map((tech, i) => (
                    <div key={i} className="flex flex-col px-3 py-2 rounded-lg bg-background border border-border group hover:border-text-muted transition-colors">
                      <span className="text-xs font-bold text-text-primary">{tech.name}</span>
                      <span className="text-[9px] text-text-muted">{tech.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Featured Case Study */}
            {activeSolution.featuredCaseStudy && (
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <FileText size={48} />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-2">Featured Case Study</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-background border border-border text-text-secondary inline-block mb-3">
                  {activeSolution.featuredCaseStudy.industry}
                </span>
                <h4 className="text-sm font-bold text-text-primary mb-2 pr-8">{activeSolution.featuredCaseStudy.title}</h4>
                <p className="text-[11px] text-text-secondary mb-4 line-clamp-3">{activeSolution.featuredCaseStudy.description}</p>
                
                <div className="flex justify-between items-end border-t border-border pt-4 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-text-muted font-bold uppercase">Primary Outcome</span>
                    <span className="text-base font-space font-bold text-text-primary">{activeSolution.featuredCaseStudy.metric}</span>
                  </div>
                  <Link href={`/case-studies`} className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-text-primary group-hover:bg-text-primary group-hover:text-background transition-colors">
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}

            {/* Sticky Action Panel */}
            <div className="rounded-2xl border border-border bg-surface p-1 shadow-sm sticky top-24 mt-auto">
               <div className="flex flex-col gap-1">
                  <Link href="/contact">
                    <button className="w-full flex items-center justify-between p-4 rounded-xl bg-text-primary text-background hover:brightness-110 transition-all font-bold text-xs">
                      Book Strategy Workshop
                      <ArrowRight size={14} />
                    </button>
                  </Link>
                  <button className="w-full flex items-center justify-between p-4 rounded-xl bg-background border border-border hover:bg-surface-elevated transition-colors text-xs font-bold text-text-primary">
                    Download Architecture
                    <Download size={14} />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 rounded-xl bg-background border border-border hover:bg-surface-elevated transition-colors text-xs font-bold text-text-primary">
                    Estimate ROI
                    <Zap size={14} />
                  </button>
               </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

// Simple star rating component
const StarRating = ({ score, color }: { score: number, color: string }) => {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="8" height="8" viewBox="0 0 24 24" fill={i < score ? color : "transparent"} stroke={i < score ? color : "var(--color-text-muted)"} strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
};
