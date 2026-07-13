"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { proprietaryFrameworksData } from '@/lib/data/products';
import { SectionHeading } from '../ui/SectionHeading';
import { ArrowRight, BookOpen, Fingerprint, LineChart, Target, Workflow } from 'lucide-react';
import Link from 'next/link';

// Map specific icons to frameworks based on slugs
const getFrameworkIcon = (slug: string) => {
  if (slug.includes('sphere')) return Fingerprint;
  if (slug.includes('flow')) return Workflow;
  if (slug.includes('score') || slug.includes('matrix')) return LineChart;
  if (slug.includes('dna')) return Target;
  return BookOpen;
};

export const FrameworkExplorer = () => {
  const [activeSlug, setActiveSlug] = useState(proprietaryFrameworksData[0].slug);
  const activeFramework = proprietaryFrameworksData.find(f => f.slug === activeSlug) || proprietaryFrameworksData[0];

  return (
    <section className="section-pad border-b border-border bg-surface-elevated">
      <div className="container-wide">
        <SectionHeading 
          label="Proprietary IP" 
          title="Enterprise Consulting Frameworks" 
          description="Repeatable, proprietary methodologies and operating models for executing AI transformation at scale." 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-16">
          
          {/* Left Panel: Frameworks List */}
          <div className="col-span-1 lg:col-span-4 flex flex-col gap-2 h-[650px] overflow-y-auto pr-4 custom-scrollbar">
            {proprietaryFrameworksData.map((fw) => {
              const isActive = activeSlug === fw.slug;
              return (
                <button
                  key={fw.slug}
                  onMouseEnter={() => setActiveSlug(fw.slug)}
                  onClick={() => setActiveSlug(fw.slug)}
                  className={`flex flex-col text-left p-4 rounded-xl border transition-all duration-300 ${
                    isActive 
                      ? 'bg-surface border-primary-accent shadow-sm' 
                      : 'bg-background border-border hover:border-primary-accent/30'
                  }`}
                >
                  <span className={`text-sm font-space font-bold ${isActive ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {fw.name}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest font-bold mt-1" style={{ color: isActive ? 'var(--primary-accent)' : 'var(--text-muted)' }}>
                    {fw.tagline}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Panel: Framework Details */}
          <div className="col-span-1 lg:col-span-8 h-[650px] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFramework.slug}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 p-8 rounded-2xl bg-surface border border-border shadow-sm flex flex-col overflow-hidden"
              >
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-accent/5 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-3xl font-space font-bold text-text-primary mb-3">{activeFramework.name}</h3>
                    <p className="text-sm text-text-secondary max-w-xl leading-relaxed">{activeFramework.description}</p>
                  </div>
                  <Link href={`/products/${activeFramework.slug}`}>
                    <div className="w-12 h-12 rounded-full bg-primary-accent text-black flex items-center justify-center hover:scale-110 transition-transform">
                      <ArrowRight size={20} />
                    </div>
                  </Link>
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 mt-4">
                  
                  {/* Left Column: Components & Deliverables */}
                  <div className="flex flex-col gap-6">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-3 border-b border-border pb-2">
                        Core Components
                      </span>
                      <ul className="flex flex-col gap-2">
                        {activeFramework.components.map((comp, i) => (
                          <li key={i} className="text-xs font-bold text-text-primary flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-primary-accent" />
                            {comp}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-3 border-b border-border pb-2">
                        Key Deliverables
                      </span>
                      <ul className="flex flex-col gap-2">
                        {activeFramework.deliverables.map((del, i) => (
                          <li key={i} className="text-xs text-text-secondary flex items-center gap-2">
                            <ArrowRight size={10} className="text-primary-accent" />
                            {del}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right Column: Visual Methodology Representation */}
                  <div className="bg-background rounded-xl border border-border p-6 flex flex-col justify-center relative overflow-hidden group">
                     <span className="absolute top-4 left-4 text-[10px] uppercase tracking-widest text-text-muted font-bold z-10">
                       Methodology Flow
                     </span>
                     
                     <div className="flex flex-col items-center justify-center gap-2 pt-6 w-full">
                       {activeFramework.phases.map((phase, i) => (
                         <React.Fragment key={i}>
                           <motion.div 
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: i * 0.1 }}
                             className="w-full bg-surface border border-border p-2 rounded text-center text-xs font-bold text-text-primary group-hover:border-primary-accent/30 transition-colors"
                           >
                             {phase}
                           </motion.div>
                           {i < activeFramework.phases.length - 1 && (
                             <div className="h-4 w-px bg-border group-hover:bg-primary-accent/30 transition-colors" />
                           )}
                         </React.Fragment>
                       ))}
                     </div>
                  </div>

                </div>

                <div className="relative z-10 mt-8 pt-6 border-t border-border flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {activeFramework.industries.slice(0, 3).map((ind, i) => (
                      <span key={i} className="text-[9px] uppercase tracking-widest text-text-muted bg-background px-2 py-1 rounded border border-border">
                        {ind}
                      </span>
                    ))}
                    {activeFramework.industries.length > 3 && (
                      <span className="text-[9px] uppercase tracking-widest text-text-muted bg-background px-2 py-1 rounded border border-border">
                        +{activeFramework.industries.length - 3} More
                      </span>
                    )}
                  </div>
                  
                  <Link href={`/products/${activeFramework.slug}`} className="text-xs font-bold text-primary-accent hover:underline flex items-center gap-1">
                    Explore Framework <ArrowRight size={12} />
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
