"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export default function CompanyRoadmap() {
  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-6">Strategic Vision</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-inter text-center">
            We are not building for what AI can do today. We are building the infrastructure for what enterprises will require tomorrow.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            
            <div className="flex-1 p-8 rounded-2xl bg-surface border border-border relative overflow-hidden group">
              <div className="text-xs font-bold uppercase tracking-widest text-text-muted mb-6">Today</div>
              <h3 className="text-2xl font-space font-bold text-text-primary mb-4 group-hover:text-[#00E5FF] transition-colors">Enterprise Platform</h3>
              <p className="text-sm text-text-secondary">
                Deploying AgentOS and Quantiva ERP to standardize AI operations and integrate siloed knowledge.
              </p>
            </div>

            <div className="hidden md:flex items-center justify-center text-text-muted shrink-0">
              <ArrowRight size={24} />
            </div>

            <div className="flex-1 p-8 rounded-2xl bg-surface border border-border relative overflow-hidden group">
              <div className="text-xs font-bold uppercase tracking-widest text-text-muted mb-6">Near-Term Focus</div>
              <h3 className="text-2xl font-space font-bold text-text-primary mb-4 group-hover:text-[#00F57A] transition-colors">AI Operating System</h3>
              <p className="text-sm text-text-secondary">
                Abstracting LLMs entirely so that the enterprise operates through a continuous, self-optimizing semantic layer.
              </p>
            </div>

            <div className="hidden md:flex items-center justify-center text-text-muted shrink-0">
              <ArrowRight size={24} />
            </div>

            <div className="flex-1 p-8 rounded-2xl bg-surface border border-[#7B61FF]/30 relative overflow-hidden group shadow-[0_0_30px_rgba(123,97,255,0.05)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#7B61FF]/5 to-transparent pointer-events-none" />
              <div className="text-xs font-bold uppercase tracking-widest text-[#7B61FF] mb-6 relative z-10">Long-Term Direction</div>
              <h3 className="text-2xl font-space font-bold text-text-primary mb-4 relative z-10">The Autonomous Enterprise</h3>
              <p className="text-sm text-text-secondary relative z-10">
                A fully realized intelligence network where routine operational decisions are made autonomously within hard guardrails.
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
