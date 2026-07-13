"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { solutionsData } from '@/lib/data/solutions';
import { SectionHeading } from '../ui/SectionHeading';
import { ArrowRight, Cpu, Network, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export const InteractiveSolutionExplorer = () => {
  const [activeSlug, setActiveSlug] = useState(solutionsData[0].slug);

  const activeSolution = solutionsData.find(s => s.slug === activeSlug) || solutionsData[0];

  return (
    <section className="py-24 border-b border-border">
      <div className="container-wide">
        <SectionHeading 
          label="Explorer" 
          title="Interactive Solution Catalog" 
          description="Select a business challenge to explore our enterprise architecture and expected outcomes." 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-16">
          
          {/* Left Panel: Solutions List */}
          <div className="col-span-1 lg:col-span-4 flex flex-col gap-2 h-[600px] overflow-y-auto pr-4 custom-scrollbar">
            {solutionsData.map((sol) => {
              const isActive = activeSlug === sol.slug;
              return (
                <button
                  key={sol.slug}
                  onMouseEnter={() => setActiveSlug(sol.slug)}
                  onClick={() => setActiveSlug(sol.slug)}
                  className={`flex flex-col text-left p-5 rounded-xl border transition-all duration-300 ${
                    isActive 
                      ? 'bg-surface-elevated border-primary-accent shadow-sm' 
                      : 'bg-background border-border hover:border-primary-accent/50'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: isActive ? 'var(--primary-accent)' : 'var(--text-muted)' }}>
                    {sol.category}
                  </span>
                  <span className={`text-sm font-bold ${isActive ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {sol.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Panel: Solution Details */}
          <div className="col-span-1 lg:col-span-8 h-[600px] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSolution.slug}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 p-8 rounded-2xl bg-surface border border-border shadow-sm flex flex-col"
              >
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-space font-bold text-text-primary mb-3">{activeSolution.name}</h3>
                    <p className="text-sm text-text-secondary max-w-xl leading-relaxed">{activeSolution.overview}</p>
                  </div>
                  <Link href={`/solutions/${activeSolution.slug}`}>
                    <div className="w-12 h-12 rounded-full bg-primary-accent/10 border border-primary-accent/20 flex items-center justify-center text-primary-accent hover:bg-primary-accent hover:text-black transition-colors">
                      <ArrowRight size={20} />
                    </div>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                  
                  {/* ROI Highlight */}
                  <div className="p-6 rounded-xl bg-background border border-border flex flex-col justify-center">
                    <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-4">Primary Metric</span>
                    <span className="text-5xl font-space font-bold text-primary-accent mb-2">
                      {activeSolution.roi?.[0]?.metric || "40%"}
                    </span>
                    <span className="text-sm font-bold text-text-primary mb-1">
                      {activeSolution.roi?.[0]?.label || "Operational Efficiency"}
                    </span>
                    <p className="text-xs text-text-secondary">
                      {activeSolution.roi?.[0]?.description || "Significant improvement across core business processes."}
                    </p>
                  </div>

                  {/* Capabilities */}
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">Core Capabilities</span>
                    {activeSolution.capabilities?.slice(0, 3).map((cap, i) => (
                      <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-background border border-border">
                        <CheckCircle2 size={16} className="text-primary-accent mt-0.5 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-text-primary">{cap.name}</span>
                          <span className="text-[10px] text-text-secondary mt-1">{cap.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-text-muted">
                      <Network size={14} />
                      <span className="text-[10px] uppercase tracking-widest font-bold">Enterprise Architecture</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-muted">
                      <Cpu size={14} />
                      <span className="text-[10px] uppercase tracking-widest font-bold">Agent Swarm</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-muted">
                      <ShieldCheck size={14} />
                      <span className="text-[10px] uppercase tracking-widest font-bold">SOC2 / ISO27001</span>
                    </div>
                  </div>
                  
                  <Link href={`/solutions/${activeSolution.slug}`} className="text-xs font-bold text-primary-accent hover:underline flex items-center gap-1">
                    View Full Solution <ArrowRight size={12} />
                  </Link>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};
