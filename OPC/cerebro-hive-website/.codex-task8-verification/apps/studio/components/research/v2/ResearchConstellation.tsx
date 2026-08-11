"use client";

import React from "react";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

const layers = [
  {
    title: "Foundational Research",
    desc: "Advancing the core capabilities of artificial intelligence.",
    color: "text-accent-secondary",
    bg: "bg-[#00E5FF]/5",
    border: "border-[#00E5FF]/20",
    nodes: ["Reasoning", "Memory", "Planning", "Agents", "Evaluation"]
  },
  {
    title: "Applied Research",
    desc: "Translating capabilities into domain-specific paradigms.",
    color: "text-accent-primary",
    bg: "bg-[#00F57A]/5",
    border: "border-[#00F57A]/20",
    nodes: ["Healthcare AI", "Manufacturing AI", "Financial AI", "Legal AI"]
  },
  {
    title: "Production Systems",
    desc: "Operationalized research embedded into enterprise products.",
    color: "text-primary-accent",
    bg: "bg-primary-accent/5",
    border: "border-primary-accent/20",
    nodes: ["Knowledge Hub", "AgentOS", "Quantiva ERP", "Automation Studio"]
  }
];

export const ResearchConstellation = () => {
  return (
    <section className="py-24 border-b border-border bg-background relative">
      <div className="container-wide max-w-5xl">
        
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent-secondary mb-3 block">Translation Pipeline</span>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-4">From Lab to Enterprise</h2>
          <p className="text-text-secondary max-w-2xl mx-auto font-inter text-center">
            Our research architecture operates across three distinct layers, ensuring that theoretical breakthroughs become measurable business outcomes.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          {layers.map((layer, index) => (
            <React.Fragment key={index}>
              <div className={cn(
                "w-full rounded-2xl border p-8 flex flex-col md:flex-row items-center justify-between gap-8 transition-all hover:bg-surface",
                layer.bg, layer.border
              )}>
                <div className="text-center md:text-left md:w-1/3">
                  <h3 className={cn("text-xl font-space font-bold mb-2", layer.color)}>{layer.title}</h3>
                  <p className="text-sm text-text-secondary">{layer.desc}</p>
                </div>
                
                <div className="flex-1 flex flex-wrap justify-center md:justify-end gap-3">
                  {layer.nodes.map((node, i) => (
                    <span key={i} className={cn("px-4 py-2 rounded-lg border bg-surface-secondary text-sm font-medium text-text-primary transition-colors hover:border-border-strong", layer.border)}>
                      {node}
                    </span>
                  ))}
                </div>
              </div>

              {index < layers.length - 1 && (
                <div className="py-2">
                  <ArrowDown size={24} className="text-text-muted" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

      </div>
    </section>
  );
};
