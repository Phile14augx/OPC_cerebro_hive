"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Animated counter component for metrics
const Counter = ({ value, label }: { value: string, label: string }) => (
  <div className="flex flex-col items-center">
    <span className="text-3xl md:text-4xl font-space font-bold text-text-primary mb-1">{value}</span>
    <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">{label}</span>
  </div>
);

export const ResearchHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yPos = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section 
      ref={containerRef} 
      className="relative w-full min-h-[90vh] flex flex-col items-center justify-center bg-background border-b border-border"
    >
      {/* Abstract Blueprint / Mathematical SVG Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeWidth="1"/>
            </pattern>
            <pattern id="grid-large" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M 200 0 L 0 0 0 200" fill="none" stroke="var(--color-border)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <rect width="100%" height="100%" fill="url(#grid-large)" />
          
          {/* Subtle math / architecture elements */}
          <g stroke="var(--color-border)" strokeWidth="1" fill="none">
            <circle cx="80%" cy="30%" r="150" strokeDasharray="4 4" />
            <circle cx="80%" cy="30%" r="100" />
            <path d="M 70% 20% L 90% 40%" />
            <path d="M 20% 70% Q 30% 60% 40% 70% T 60% 70%" />
          </g>
        </svg>
      </div>

      {/* Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div style={{ y: yPos, opacity }} className="relative z-10 w-full max-w-[1200px] mx-auto px-6 flex flex-col items-center pt-32 pb-16">
        
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <span className="text-[10px] uppercase tracking-widest text-primary-accent font-bold px-3 py-1.5 border border-primary-accent/20 rounded-sm bg-primary-accent/5 backdrop-blur-sm inline-block">
            CerebroHive Labs
          </span>
          
          <h1 className="text-5xl md:text-7xl font-space font-bold text-text-primary tracking-tight leading-[1.1]">
            Advancing Enterprise AI Through <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-text-secondary to-text-muted">Applied Research</span>
          </h1>
          
          <p className="text-text-secondary text-lg md:text-xl font-inter max-w-2xl mx-auto text-center">
            Explore original research, enterprise frameworks, reference architectures, and vendor-neutral benchmarking.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
             <Link href="#publications" className="px-8 py-4 bg-surface text-text-primary font-space font-bold text-sm rounded-sm transition-transform hover:-translate-y-1 flex items-center justify-center gap-2">
               Explore Publications <ArrowRight size={16} />
             </Link>
             <button className="px-8 py-4 bg-transparent border border-border text-text-primary font-space font-bold text-sm rounded-sm transition-colors hover:bg-surface flex items-center justify-center gap-2">
               <Download size={16} /> Download Library
             </button>
          </div>
        </div>

        {/* Research Metrics */}
        <div className="w-full max-w-4xl mx-auto mt-24 grid grid-cols-2 md:grid-cols-5 gap-8 border-t border-border pt-12">
          <Counter value="42" label="Publications" />
          <Counter value="86" label="Architectures" />
          <Counter value="18" label="Benchmarks" />
          <Counter value="10" label="Frameworks" />
          <Counter value="12K+" label="Downloads" />
        </div>

      </motion.div>
    </section>
  );
};
