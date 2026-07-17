"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { softwarePlatformsData } from '@/lib/data/products';
import { SectionHeading } from '../ui/SectionHeading';
import { ArrowRight, Box, Cpu, Network, Search, Database, Zap } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Helper to map slugs to specific visual layouts/icons
const getIcon = (slug: string) => {
  switch(slug) {
    case 'quantiva-erp': return Database;
    case 'cerebro-ai-enterprise': return Box;
    case 'agentos': return Cpu;
    case 'automation-studio': return Network;
    case 'knowledge-hub': return Search;
    case 'cerebro-analytics': return Zap;
    default: return Box;
  }
}

export const SoftwarePlatformsBento = () => {
  return (
    <section className="section-pad border-b border-border bg-background">
      <div className="container-wide">
        <SectionHeading 
          label="Software Platforms" 
          title="Enterprise AI Platforms" 
          description="Scalable, AI-native software platforms designed to modernize core business operations." 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[300px] gap-4 mt-16">
          
          {softwarePlatformsData.map((platform, i) => {
            const Icon = getIcon(platform.slug);
            
            // Make the first two items span 2 columns for the "Hero" bento effect
            const isLarge = i === 0 || i === 1;

            return (
              <Link 
                key={platform.slug} 
                href={`/products/${platform.slug}`}
                className={cn(
                  "group relative rounded-3xl overflow-hidden bg-surface border border-border flex flex-col justify-between p-8 transition-all duration-500 hover:border-primary-accent/50 hover:shadow-xl hover:shadow-primary-accent/5",
                  isLarge ? "lg:col-span-2" : "col-span-1"
                )}
              >
                {/* Background Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center group-hover:bg-primary-accent/10 group-hover:border-primary-accent/20 transition-colors duration-300">
                    <Icon size={24} className="text-text-muted group-hover:text-primary-accent transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-space font-bold text-text-primary mb-2 group-hover:text-primary-accent transition-colors">{platform.name}</h3>
                    <p className="text-sm text-text-secondary line-clamp-2">{platform.tagline}</p>
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between mt-8">
                  <div className="flex gap-2">
                    {isLarge && platform.features.slice(0,2).map((feat, idx) => (
                       <span key={idx} className="text-[10px] uppercase tracking-widest font-bold text-text-muted bg-background px-2 py-1 rounded-md border border-border">
                         {feat}
                       </span>
                    ))}
                    {!isLarge && (
                      <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted bg-background px-2 py-1 rounded-md border border-border">
                         {platform.features[0]}
                      </span>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center group-hover:bg-primary-accent group-hover:text-text-primary transition-all transform group-hover:translate-x-2">
                    <ArrowRight size={14} />
                  </div>
                </div>

                {/* Decorative Abstract Architecture Element that animates on hover */}
                {isLarge && (
                  <div className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 group-hover:opacity-30 group-hover:-translate-y-4 group-hover:-translate-x-4 transition-all duration-700 pointer-events-none flex flex-col gap-2">
                    <div className="h-4 w-full border border-primary-accent rounded-sm" />
                    <div className="flex gap-2">
                      <div className="h-12 w-12 border border-primary-accent rounded-sm" />
                      <div className="h-12 flex-1 border border-primary-accent rounded-sm" />
                    </div>
                    <div className="h-8 w-3/4 border border-primary-accent rounded-sm" />
                  </div>
                )}
              </Link>
            );
          })}
          
        </div>
      </div>
    </section>
  );
};
