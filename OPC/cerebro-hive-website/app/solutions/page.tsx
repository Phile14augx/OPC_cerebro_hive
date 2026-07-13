"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { InteractiveSolutionExplorer } from '@/components/solutions/InteractiveSolutionExplorer';
import { ROICalculator } from '@/components/solutions/ROICalculator';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

export default function SolutionsIndexPage() {
  return (
    <div className="bg-background min-h-screen selection:bg-primary-accent/30">
      
      {/* Hero */}
      <section className="relative pt-40 pb-24 md:pt-52 md:pb-32 overflow-hidden flex flex-col items-center text-center">
        {/* Abstract Mesh Background */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-accent/20 via-background to-background" />
        
        <div className="container-wide relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 backdrop-blur-sm shadow-sm">
             <span className="w-2 h-2 rounded-full bg-primary-accent animate-pulse" />
             <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Outcome-Driven Architecture</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-space font-bold text-text-primary leading-[1.1] tracking-tight mb-6 max-w-4xl">
            Enterprise AI Solutions <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-text-secondary to-text-muted">Built for Business Outcomes</span>
          </h1>
          
          <p className="text-lg md:text-xl text-text-secondary font-inter max-w-2xl leading-relaxed mb-10">
            Transform operations, automate workflows, and accelerate growth with AI-native platforms designed for enterprise scale.
          </p>

          <div className="flex gap-4">
             <AnimatedButton variant="primary" size="lg">
               Explore Solutions
             </AnimatedButton>
             <button className="px-8 py-4 bg-surface border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg hover:border-primary-accent/50 hover:bg-surface-elevated transition-all duration-300">
               Book Strategy Workshop
             </button>
          </div>
        </div>
      </section>

      <InteractiveSolutionExplorer />
      
      <ROICalculator />

    </div>
  );
}
