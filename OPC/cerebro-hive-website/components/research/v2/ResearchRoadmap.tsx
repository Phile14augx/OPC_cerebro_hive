"use client";

import React from "react";
import { CheckCircle2, CircleDashed, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const phases = [
  {
    title: "Current Research",
    color: "text-accent-primary",
    border: "border-[#00F57A]",
    bg: "bg-accent-primary/10",
    items: ["Agentic Retrieval-Augmented Generation", "Multi-Agent Planning Protocols", "Knowledge Graph Construction"]
  },
  {
    title: "Validation",
    color: "text-accent-secondary",
    border: "border-[#00E5FF]",
    bg: "bg-[#00E5FF]/10",
    items: ["Deterministic Fact-Checking", "Cross-Domain Federation", "Edge Deployment Models"]
  },
  {
    title: "Enterprise Adoption",
    color: "text-primary-accent",
    border: "border-primary-accent",
    bg: "bg-primary-accent/10",
    items: ["AgentOS Scale out", "Quantiva ERP Auto-remediation"]
  },
  {
    title: "Platform Integration",
    color: "text-text-primary",
    border: "border-border-default",
    bg: "bg-surface-elevated",
    items: ["Autonomous Organizations", "World Simulation Models"]
  }
];

export const ResearchRoadmap = () => {
  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide max-w-5xl">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-4">Innovation Roadmap</h2>
          <p className="text-text-secondary max-w-2xl mx-auto font-inter">
            How our research translates from theoretical concepts into validated enterprise platform integrations.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {phases.map((phase, i) => (
            <div key={i} className="flex-1 flex flex-col relative group">
              
              <div className="mb-6 relative z-10 flex items-center justify-center">
                <div className={cn("w-4 h-4 rounded-full border-4 bg-background", phase.border)} />
              </div>
              
              {/* Connector */}
              {i < phases.length - 1 && (
                <div className="hidden md:block absolute top-2 left-1/2 right-[-50%] h-0.5 bg-surface-elevated" />
              )}
              {i < phases.length - 1 && (
                <div className="md:hidden absolute top-4 bottom-[-100%] left-1/2 w-0.5 -translate-x-1/2 bg-surface-elevated" />
              )}

              <div className={cn("bg-surface border rounded-xl p-6 h-full transition-colors", phase.bg.replace('/10', '/5'), phase.border.replace('border-', 'border-').replace(/\]$/, ']/20'))}>
                <h3 className={cn("text-lg font-space font-bold mb-4 text-center", phase.color)}>{phase.title}</h3>
                <ul className="space-y-3">
                  {phase.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-text-secondary">
                      {i === 0 ? (
                        <CheckCircle2 size={16} className={cn("shrink-0 mt-0.5", phase.color)} />
                      ) : (
                        <CircleDashed size={16} className="shrink-0 mt-0.5 text-text-muted" />
                      )}
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
