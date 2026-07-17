"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Cpu, Database, Network, Shield, Settings, Lightbulb, Box } from "lucide-react";
import { platformCategories, platformCapabilities } from "@/lib/data/platform";
import Link from "next/link";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { SectionHeading } from "@/components/ui/SectionHeading";

// Helper to map icon string to Lucide component
const getIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    Cpu, Database, Network, Shield, Settings, Lightbulb, Box
  };
  return icons[iconName] || Settings;
};

export default function PlatformOverviewPage() {
  return (
    <div className="bg-background min-h-screen pt-24 font-inter">
      {/* Hero Section */}
      <section className="section-pad relative overflow-hidden border-b border-border">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-accent/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container-wide relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary-accent animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">The Engine</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-space font-bold text-text-primary leading-[1.1] tracking-tight mb-6 max-w-4xl">
            Cerebro AgentOS™ <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-[#00E5FF]">Enterprise AI Platform</span>
          </h1>
          
          <p className="text-xl text-text-secondary leading-relaxed max-w-3xl mb-10">
            The foundation of our enterprise offering. A unified architecture tying together multi-agent execution, enterprise memory, governance, knowledge, and observability into one coherent operating system.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <TrackedLink href="/platform/architecture" analyticsEvent="cta_click" analyticsCategory="navigation" analyticsLabel="View Architecture - Platform" className="px-8 py-4 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg transition-transform hover:-translate-y-1 shadow-elevated flex items-center justify-center gap-3">
              Explore Interactive Architecture <ArrowRight size={16} />
            </TrackedLink>
          </div>
        </div>
      </section>

      {/* Capabilities Organized by Category */}
      <section className="section-pad bg-surface-elevated">
        <div className="container-wide">
          <SectionHeading 
            label="Capabilities" 
            title="The 15 Core Capabilities" 
            description="Brandable, defensible pieces of infrastructure that power every product and service we deliver." 
          />

          <div className="mt-16 flex flex-col gap-20">
            {platformCategories.map(category => {
              const caps = platformCapabilities.filter(c => c.category === category.name);
              if (caps.length === 0) return null;

              return (
                <div key={category.id} className="relative">
                  <h3 className="text-3xl font-space font-bold text-text-primary mb-2 border-b border-border pb-4">{category.name}</h3>
                  <p className="text-text-secondary mb-8">{category.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {caps.map(cap => {
                      const Icon = getIcon(cap.iconName || "Settings");
                      return (
                        <Link key={cap.id} href={`/platform/${cap.slug}`} className="group p-6 rounded-2xl bg-background border border-border shadow-sm flex flex-col hover:border-primary-accent/50 hover:shadow-md transition-all">
                          <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-text-primary group-hover:text-primary-accent transition-colors mb-6">
                            <Icon size={24} />
                          </div>
                          <h4 className="text-xl font-space font-bold text-text-primary mb-2">{cap.title}</h4>
                          <p className="text-sm text-text-secondary leading-relaxed mb-6 flex-1">{cap.summary}</p>
                          <div className="flex flex-wrap gap-2 mt-auto">
                            {cap.features.slice(0, 2).map((feat, i) => (
                              <span key={i} className="px-2 py-1 bg-surface-elevated text-[10px] font-bold tracking-widest uppercase text-text-muted rounded border border-border">{feat}</span>
                            ))}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
