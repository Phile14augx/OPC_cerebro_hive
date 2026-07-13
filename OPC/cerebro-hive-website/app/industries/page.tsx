"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { industriesData } from '@/lib/data/industries';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ArrowRight, Globe, BarChart3, TrendingUp } from 'lucide-react';

export default function IndustriesIndexPage() {
  return (
    <div className="bg-background min-h-screen selection:bg-primary-accent/30 transition-colors duration-500">
      
      {/* Premium Hero */}
      <section className="relative pt-40 pb-24 md:pt-52 md:pb-32 overflow-hidden flex flex-col items-center text-center">
        {/* Placeholder for Interactive Globe */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex items-center justify-center">
          <Globe size={800} className="text-primary-accent animate-[spin_120s_linear_infinite]" />
        </div>
        
        <div className="container-wide relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 backdrop-blur-sm shadow-sm">
             <span className="w-2 h-2 rounded-full bg-primary-accent animate-pulse" />
             <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Global Impact</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-space font-bold text-text-primary leading-[1.1] tracking-tight mb-6 max-w-4xl">
            Enterprise AI Across <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-[#00E5FF]">Every Industry</span>
          </h1>
          
          <p className="text-lg md:text-xl text-text-secondary font-inter max-w-2xl leading-relaxed mb-16">
            From healthcare diagnostics to financial fraud prevention, CerebroHive builds intelligent systems that solve domain-specific enterprise challenges.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-5xl">
            {industriesData.map((ind) => (
              <Link key={ind.slug} href={`/industries/${ind.slug}`}>
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="px-6 py-8 rounded-2xl bg-surface-elevated border border-border flex flex-col items-center justify-center gap-3 transition-colors hover:border-primary-accent/50 group cursor-pointer"
                >
                  <span className="text-sm font-bold text-text-primary group-hover:text-primary-accent transition-colors">{ind.name}</span>
                  <ArrowRight size={14} className="text-text-muted group-hover:text-primary-accent opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Global Statistics */}
      <section className="py-24 border-t border-border bg-surface-elevated">
        <div className="container-wide">
          <SectionHeading label="Scale" title="Measurable Transformation" description="Driving efficiency and intelligence globally." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {[
              { metric: "$1.2B+", label: "Value Generated", icon: BarChart3 },
              { metric: "40M+", label: "Inferences Daily", icon: TrendingUp },
              { metric: "12", label: "Industry Verticals", icon: Globe }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center p-10 bg-surface border border-border rounded-2xl">
                <stat.icon size={32} className="text-primary-accent mb-6" />
                <span className="text-5xl font-space font-bold text-text-primary mb-2">{stat.metric}</span>
                <span className="text-sm uppercase tracking-widest text-text-muted font-bold">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
