"use client";

import React from "react";
import { ArrowDown, BrainCircuit, Search, Cpu, Database, Network } from "lucide-react";

export const ResearchToProductBridge = () => {
  return (
    <section className="py-24 border-b border-border bg-background relative">
      <div className="container-wide">
        
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-3 block">Applied Translation</span>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-4">Research That Builds Products</h2>
          <p className="text-text-secondary max-w-2xl mx-auto font-inter text-center">
            Our papers do not collect dust. We ensure every theoretical advance is aggressively evaluated, optimized, and pushed into the CerebroHive product suite.
          </p>
        </div>

        <div className="max-w-3xl mx-auto flex flex-col items-center">
          
          {/* Research Box */}
          <div className="w-full bg-surface border border-border rounded-2xl p-8 text-center relative z-10 shadow-xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-secondary mb-4">
              <BrainCircuit size={16} /> Research Paper
            </div>
            <h3 className="text-2xl font-space font-bold text-text-primary">Dynamic Task Planning for ERP Automation</h3>
          </div>

          <div className="flex flex-col items-center py-4">
            <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">Used By</div>
            <div className="h-16 w-px bg-gradient-to-b from-[#00E5FF] to-primary-accent" />
            <ArrowDown size={20} className="text-primary-accent -mt-2" />
          </div>

          {/* Product Cards Container */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full relative z-10">
            
            <div className="bg-background border border-[#00F57A]/20 rounded-xl p-6 text-center hover:bg-[#00F57A]/5 transition-colors">
              <div className="w-12 h-12 mx-auto rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center mb-4">
                <Search size={24} />
              </div>
              <h4 className="text-lg font-space font-bold text-text-primary mb-2">Knowledge Hub</h4>
              <p className="text-xs text-text-secondary">Powers semantic task routing.</p>
            </div>

            <div className="bg-background border border-[#00E5FF]/20 rounded-xl p-6 text-center hover:bg-[#00E5FF]/5 transition-colors">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#00E5FF]/10 text-accent-secondary flex items-center justify-center mb-4">
                <Cpu size={24} />
              </div>
              <h4 className="text-lg font-space font-bold text-text-primary mb-2">AgentOS</h4>
              <p className="text-xs text-text-secondary">Core reasoning engine.</p>
            </div>

            <div className="bg-background border border-[#FFB300]/20 rounded-xl p-6 text-center hover:bg-[#FFB300]/5 transition-colors">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#FFB300]/10 text-warning flex items-center justify-center mb-4">
                <Database size={24} />
              </div>
              <h4 className="text-lg font-space font-bold text-text-primary mb-2">Quantiva ERP</h4>
              <p className="text-xs text-text-secondary">Automated action execution.</p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
