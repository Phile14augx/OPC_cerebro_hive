"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndustryExplorerProvider, useIndustryExplorer } from '@/components/industries/IndustryExplorerContext';
import { InteractiveIndustryGlobe } from '@/components/industries/InteractiveIndustryGlobe';
import { IndustryDetailView } from '@/components/industries/IndustryDetailView';
import { AICapabilityMatrix } from '@/components/industries/AICapabilityMatrix';
import { getIndustryBySlug } from '@/lib/data/industries';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AnimatedButton as Button } from '@/components/ui/AnimatedButton';
import { Grid, Layers, BrainCircuit, Box, Search, ShieldCheck } from 'lucide-react';

function IndustriesPageContent() {
  const { activeIndustry } = useIndustryExplorer();
  const industry = activeIndustry ? getIndustryBySlug(activeIndustry) : null;
  const themeColor = industry?.color || 'var(--accent-primary)';

  return (
    <div className="bg-background min-h-screen transition-colors duration-1000 relative">
      
      {/* Dynamic Background Blur that shifts based on active industry */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] transition-colors duration-1000 z-0" 
        style={{ backgroundColor: themeColor }}
      />

      {/* 1. Hero & Interactive Globe (Split Layout) */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-16 overflow-hidden">
        <div className="container-wide relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Text & CTA */}
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 backdrop-blur-sm shadow-sm">
               <span className="w-2 h-2 rounded-full bg-primary-accent animate-pulse" />
               <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Enterprise Transformation</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-space font-bold text-text-primary leading-[1.1] tracking-tight mb-6">
              Industry <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-[#00E5FF]">Intelligence</span>
            </h1>
            
            <p className="text-lg text-text-secondary font-inter max-w-lg leading-relaxed mb-8">
              Explore how CerebroHive transforms entire industries through AI. 
              Select an industry from the globe to see custom reference architectures, AI agents, and business outcomes.
            </p>
            
            <div className="flex gap-4">
              <Button variant="primary">Talk to an Architect</Button>
            </div>
          </div>

          {/* Right: Interactive Globe */}
          <div className="relative w-full h-[500px] lg:h-[700px] flex items-center justify-center">
            {/* The globe overlaps slightly with the hero space visually */}
            <div className="absolute inset-[-20%]">
              <InteractiveIndustryGlobe />
            </div>
          </div>

        </div>
      </section>

      {/* 2. Capability Matrix */}
      <section className="section-pad border-t border-border bg-surface-elevated relative z-10">
        <div className="container-wide">
          <AICapabilityMatrix />
        </div>
      </section>

      {/* 3. Industry Explorer / Detail View */}
      <section className="section-pad relative z-10" id="industry-detail">
        <div className="container-wide">
          <IndustryDetailView />
        </div>
      </section>

      {/* 4. Global Scale Metrics (Replaced) */}
      <section className="section-pad border-t border-border bg-surface-elevated relative z-10">
        <div className="container-wide">
          <SectionHeading label="Scale" title="Platform Capabilities" description="Enterprise infrastructure deployed globally." />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-16">
            {[
              { metric: "12", label: "Industry Verticals", icon: Grid },
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
    <IndustryExplorerProvider>
      <IndustriesPageContent />
    </IndustryExplorerProvider>
  );
}
