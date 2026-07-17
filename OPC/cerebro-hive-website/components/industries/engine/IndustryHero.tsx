"use client";

import React from 'react';
import { IndustryHero as IHero, EngineConfig } from '@/lib/data/industries/types';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { motion } from 'framer-motion';

export function IndustryHero({ hero, config }: { hero: IHero, config: EngineConfig }) {
  return (
    <section className="relative min-h-screen flex flex-col items-start justify-center pt-32 pb-16">
      <div className="container-wide relative z-10 w-full lg:w-1/2 flex flex-col items-start">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 backdrop-blur-sm shadow-sm"
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: config.primaryColor }} />
          <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">{hero.subtitle}</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-6xl lg:text-7xl font-space font-bold text-text-primary leading-[1.1] tracking-tight mb-6"
        >
          {hero.title.split(' ').map((word, i) => {
            // Apply gradient to words like "Intelligence" or specific keywords if needed. 
            // The user had "AI-Native Financial Intelligence" with "Intelligence" gradient.
            if (word === 'Intelligence' || word === 'Transformation') {
              return (
                <span key={i} className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${config.primaryColor}, ${config.secondaryColor})` }}>
                  {word}{" "}
                </span>
              );
            }
            return <span key={i}>{word} </span>;
          })}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-text-secondary font-inter max-w-lg leading-relaxed mb-10"
        >
          {hero.description}
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <AnimatedButton variant="primary">{hero.primaryCta}</AnimatedButton>
          <AnimatedButton variant="outline">{hero.secondaryCta}</AnimatedButton>
        </motion.div>
      </div>
    </section>
  );
}
