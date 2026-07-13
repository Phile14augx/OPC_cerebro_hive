"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeading } from '../ui/SectionHeading';
import { ArrowRight, BookOpen, BrainCircuit, Code, Database, Globe, Network, Shield, Cpu, Binary, Cloud, Workflow, Eye, Lightbulb, Target, Zap } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { allResearchData } from '@/lib/content/research';
import { ResearchDomain } from '@/lib/content/research/types';
import { LucideIcon } from 'lucide-react';

const domainsList: { name: ResearchDomain, icon: LucideIcon }[] = [
  { name: "AI Foundations", icon: Binary },
  { name: "Enterprise AI", icon: BrainCircuit },
  { name: "Agentic AI", icon: Network },
  { name: "Knowledge Systems", icon: Database },
  { name: "LLMs", icon: BookOpen },
  { name: "Computer Vision", icon: Eye },
  { name: "Multimodal AI", icon: Globe },
  { name: "Data Engineering", icon: Database },
  { name: "Software Engineering", icon: Code },
  { name: "Cloud & Infrastructure", icon: Cloud },
  { name: "Security", icon: Shield },
  { name: "Governance", icon: Target },
  { name: "Optimization", icon: Workflow },
  { name: "Decision Intelligence", icon: Lightbulb },
  { name: "Robotics", icon: Cpu },
  { name: "Emerging AI", icon: Zap } // Using a placeholder for Zap since it wasn't imported, let me just add it or use an alternative.
];

export const ResearchDomains = () => {
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);

  // Helper to count publications for a domain
  const getCount = (domain: string) => {
    return allResearchData.filter(r => r.domain === domain).length;
  };

  // Helper to get latest pub for a domain
  const getLatest = (domain: string) => {
    const pubs = allResearchData.filter(r => r.domain === domain);
    if (pubs.length === 0) return null;
    return pubs.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())[0];
  };

  return (
    <section className="section-pad border-b border-border bg-surface">
      <div className="container-wide">
        <SectionHeading 
          label="Taxonomy" 
          title="Research Domains" 
          description="Explore our growing library of technical research across 16 core disciplines." 
        />
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mt-16">
          {domainsList.map((domain, i) => {
            const count = getCount(domain.name);
            const latest = getLatest(domain.name);
            const isHovered = hoveredDomain === domain.name;

            return (
              <Link 
                key={domain.name}
                href={`/research?domain=${encodeURIComponent(domain.name)}`}
                onMouseEnter={() => setHoveredDomain(domain.name)}
                onMouseLeave={() => setHoveredDomain(null)}
                className="relative p-6 rounded-xl border border-border bg-background flex flex-col items-start gap-4 transition-all duration-300 hover:border-primary-accent/40 group overflow-hidden"
              >
                {/* Background glow on hover */}
                <div className="absolute inset-0 bg-primary-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-text-secondary group-hover:text-primary-accent group-hover:border-primary-accent/20 transition-colors">
                  <domain.icon size={20} />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-sm font-space font-bold text-text-primary group-hover:text-primary-accent transition-colors">{domain.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-text-muted">{count} Publications</span>
                  </div>
                </div>

                <AnimatePresence>
                  {isHovered && latest && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="w-full pt-4 mt-2 border-t border-border overflow-hidden"
                    >
                      <span className="text-[9px] uppercase tracking-widest text-primary-accent font-bold mb-1 block">Latest</span>
                      <p className="text-xs text-text-secondary line-clamp-2">{latest.title}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
