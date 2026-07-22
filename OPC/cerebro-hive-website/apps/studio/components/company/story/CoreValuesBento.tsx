"use client";

import React from "react";
import { motion } from "framer-motion";
import { coreValues } from "@/lib/content/company/values";
import { CultureCard } from "./CultureCard";
import { cn } from "@/lib/utils";

export const CoreValuesBento = () => {
  return (
    <section id="culture-code" className="section-pad relative bg-background overflow-hidden border-t border-border">
      
      {/* 1. Ambient Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Subtle Grid */}
        <div className="absolute inset-0 opacity-[0.15]" 
             style={{ 
               backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`, 
               backgroundSize: '40px 40px',
               maskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 80%)',
               WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 80%)'
             }} 
        />
        {/* Blurred Blobs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-accent/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }} />
        {/* Moving Noise */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      </div>

      <div className="container-wide relative z-10">
        
        {/* 2. Dramatic Section Header */}
        <div className="max-w-4xl mb-20 md:mb-28">
          <motion.div 
            initial={{ opacity: 0.4, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-[1px] w-8 bg-primary-accent" />
            <h2 className="text-[10px] font-space font-bold tracking-[0.2em] uppercase text-primary-accent">
              OUR CULTURE
            </h2>
          </motion.div>
          
          <motion.h3 
            initial={{ opacity: 0.4, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-space font-bold text-text-primary tracking-tight leading-[1.1] mb-8"
          >
            Built Like an Engineering Organization, <br className="hidden md:block"/> 
            <span className="text-text-muted">Not a Consultancy.</span>
          </motion.h3>
          
          <motion.p 
            initial={{ opacity: 0.4, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-text-secondary font-inter max-w-2xl leading-relaxed"
          >
            Six principles that govern every engagement, every decision, and every line of code we ship.
          </motion.p>
        </div>

        {/* 3. Asymmetric Bento Layout */}
        {/* 
          Desktop layout grid:
          Row 1: [Engineering (col-span-2)] [Honesty (col-span-1)]
          Row 2: [Outcome (col-span-1)] [Partnership (col-span-2)]
          Row 3: [Innovation (col-span-2)] [Responsible (col-span-1)]
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1400px]">
          {coreValues.map((value, index) => {
            // Determine column span based on index to break symmetry
            // 0: Engineering (2)
            // 1: Outcome (1) -> Wait, we want row 1 to be [0 (span 2)] [2 (span 1)]
            
            // Let's explicitly map them by index for the visual arrangement:
            // The user wanted:
            // ┌──────────────┬───────────┐
            // │ Engineering  │ Honesty   │
            // ├───────┬──────┴───────────┤
            // │Outcome│ Partnership      │
            // ├───────┼──────────────────┤
            // │Innovat│ Responsible      │ -> User showed Innovation (1), Responsible (2) actually in sketch: │Innovation │ Responsible  │ (meaning innovation span 1 or 2). Let's do a repeating pattern: 2/1, 1/2, 2/1
            
            let colSpanClass = "lg:col-span-1";
            if (index === 0) colSpanClass = "lg:col-span-2"; // Engineering
            if (index === 1) colSpanClass = "lg:col-span-1"; // Outcome
            if (index === 2) colSpanClass = "lg:col-span-1 lg:row-start-1 lg:col-start-3"; // Honesty (move to top right)
            if (index === 3) colSpanClass = "lg:col-span-2"; // Partnership
            if (index === 4) colSpanClass = "lg:col-span-2"; // Innovation
            if (index === 5) colSpanClass = "lg:col-span-1"; // Responsible
            
            // Reordering array logically to fit CSS Grid naturally without explicit row-start:
            // If we keep the array order:
            // 0 (Eng) -> span 2
            // 2 (Honesty) -> span 1
            // 1 (Outcome) -> span 1
            // 3 (Partnership) -> span 2
            // 4 (Innovation) -> span 1
            // 5 (Responsible) -> span 2
            // Let's apply this logic dynamically.
            
            let spanClass = "lg:col-span-1";
            if (index === 0 || index === 3 || index === 5) {
              spanClass = "lg:col-span-2";
            }
            
            return (
              <CultureCard 
                key={value.id} 
                value={value} 
                index={index} 
                className={cn(
                  "min-h-[400px] w-full",
                  // Mobile: All span 1. Tablet: All span 1 (or 2 col grid). Desktop: Asymmetric
                  spanClass
                )} 
              />
            );
          })}
        </div>

      </div>
    </section>
  );
};

