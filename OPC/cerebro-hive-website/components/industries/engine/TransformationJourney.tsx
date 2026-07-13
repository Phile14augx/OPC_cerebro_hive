"use client";

import React from 'react';
import { RoadmapPhase, EngineConfig } from '@/lib/data/industries/types';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { motion } from 'framer-motion';

export function TransformationJourney({ roadmap, config }: { roadmap: RoadmapPhase[], config: EngineConfig }) {
  if (!roadmap || roadmap.length === 0) return null;

  return (
    <section className="section-pad border-t border-border bg-background relative z-10">
      <div className="container-wide">
        <SectionHeading label="Roadmap" title="Transformation Journey" description="A structured, risk-mitigated path to enterprise AI adoption." />
        
        <div className="relative mt-20 max-w-4xl mx-auto">
          {/* Connecting Line */}
          <div className="absolute top-0 bottom-0 left-8 md:left-1/2 w-px bg-border -translate-x-1/2" />
          
          <div className="flex flex-col gap-12">
            {roadmap.map((phase, idx) => {
              const isEven = idx % 2 === 0;
              
              return (
                <div key={idx} className={`relative flex items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}>
                  
                  {/* Timeline Dot */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full border-4 border-background bg-surface-elevated -translate-x-1/2 z-10"
                    style={{ backgroundColor: config.primaryColor }}
                  />
                  
                  {/* Content Card */}
                  <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12 text-left'}`}>
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-6 rounded-2xl bg-surface-elevated border border-border group hover:border-border transition-colors relative"
                    >
                      <div 
                        className={`absolute top-0 w-1 h-full rounded-full transition-colors opacity-0 group-hover:opacity-100 ${isEven ? 'right-0' : 'left-0'}`} 
                        style={{ backgroundColor: config.secondaryColor }} 
                      />
                      <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">{phase.phase}</span>
                      <h4 className="text-xl font-bold text-text-primary mt-1 mb-2">{phase.name}</h4>
                      <p className="text-sm text-text-secondary">{phase.description}</p>
                    </motion.div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
