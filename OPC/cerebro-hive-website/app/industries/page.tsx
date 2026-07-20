"use client";

import React, { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndustryExplorerProvider, useIndustryExplorer } from '@/components/industries/IndustryExplorerContext';
import { InteractiveIndustryExplorer } from '@/components/industries/InteractiveIndustryExplorer';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AnimatedButton as Button } from '@/components/ui/AnimatedButton';
import { Grid, Layers, BrainCircuit, Box, Search, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

function IndustriesPageContent() {
  return (
    <div className="bg-background min-h-screen relative overflow-hidden">
      
      {/* 1. Hero & Interactive Explorer */}
      <section className="relative min-h-screen flex flex-col items-center justify-start pt-12 pb-16">
        <div className="container-wide relative z-10 w-full flex flex-col items-center text-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 backdrop-blur-sm shadow-sm">
             <span className="w-2 h-2 rounded-full bg-primary-accent animate-pulse" />
             <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Platform Taxonomy</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-space font-bold text-text-primary leading-[1.1] tracking-tight mb-6 max-w-4xl">
            Enterprise Knowledge <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-[#00E5FF]">Graph</span>
          </h1>
          
          <p className="text-lg text-text-secondary font-inter max-w-2xl leading-relaxed mb-12">
            Explore 100+ interconnected industry architectures, compliance frameworks, and AI agents. Select a domain below to see its reference ecosystem.
          </p>

          <InteractiveIndustryExplorer />
          
        </div>
      </section>

      {/* 2. Global Scale Metrics */}
      <section className="section-pad border-t border-border bg-surface-elevated relative z-10">
        <div className="container-wide">
          <SectionHeading label="Scale" title="Platform Capabilities" description="Enterprise infrastructure deployed globally." />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-16">
            {[
              { metric: "100+", label: "Industry Verticals", icon: Grid },
              { metric: "350+", label: "Enterprise Use Cases", icon: Search },
              { metric: "45+", label: "Reference Architectures", icon: Layers },
              { metric: "25+", label: "Solution Blueprints", icon: Box },
              { metric: "10", label: "Proprietary Frameworks", icon: ShieldCheck },
              { metric: "50+", label: "Domain AI Agents", icon: BrainCircuit }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center p-8 bg-surface border border-border rounded-2xl group hover:border-primary-accent/50 transition-colors">
                <stat.icon size={28} className="text-text-muted group-hover:text-primary-accent mb-4 transition-colors" />
                <span className="text-4xl md:text-5xl font-space font-bold text-text-primary mb-2">{stat.metric}</span>
                <span className="text-xs uppercase tracking-widest text-text-muted font-bold text-center">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

export default function IndustriesIndexPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <IndustryExplorerProvider>
        <IndustriesPageContent />
      </IndustryExplorerProvider>
    </Suspense>
  );
}
