"use client";

import React from "react";
import { Network, Database, BrainCircuit, Box, Factory, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const graphPath = [
  { step: "Research", icon: BrainCircuit, label: "Agentic RAG Paper", color: "text-accent-secondary", bg: "bg-[#00E5FF]/10", border: "border-[#00E5FF]/30" },
  { step: "Framework", icon: Network, label: "Cerebro-RAG Core", color: "text-accent-primary", bg: "bg-accent-primary/10", border: "border-accent-primary/30" },
  { step: "Architecture", icon: Database, label: "Distributed Graph-Vector Hybrid", color: "text-warning", bg: "bg-[#FFB300]/10", border: "border-[#FFB300]/30" },
  { step: "Products", icon: Box, label: "Knowledge Hub", color: "text-text-primary", bg: "bg-white/10", border: "border-border" },
  { step: "Industries", icon: Factory, label: "Healthcare & Finance", color: "text-text-secondary", bg: "bg-black/40", border: "border-border" },
  { step: "Outcomes", icon: TrendingUp, label: "80% Faster Discovery", color: "text-primary-accent", bg: "bg-primary-accent/10", border: "border-primary-accent/30" }
];

export const KnowledgeGraphView = () => {
  return (
    <section className="py-24 border-b border-border bg-background overflow-hidden">
      <div className="container-wide">
        
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent-secondary mb-3 block flex items-center justify-center gap-2">
            <Network size={14} /> The Navigation System
          </span>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-4">Research Knowledge Graph</h2>
          <p className="text-text-secondary max-w-2xl mx-auto font-inter">
            Explore the connective tissue of our organization. See exactly how an abstract research paper propagates into a measurable business outcome.
          </p>
        </div>

        <div className="max-w-6xl mx-auto relative py-12">
          
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#00E5FF] via-[#00F57A] to-primary-accent opacity-20 -translate-y-1/2 hidden lg:block" />

          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 relative z-10">
            {graphPath.map((node, i) => (
              <div key={i} className="flex flex-col items-center group relative cursor-pointer">
                
                <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-4">
                  {node.step}
                </div>

                <div className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm border shadow-lg relative z-10",
                  node.bg, node.border, node.color,
                  "group-hover:scale-110 group-hover:bg-opacity-20"
                )}>
                  <node.icon size={32} />
                </div>

                <div className="mt-6 text-center">
                  <div className="text-sm font-space font-bold text-text-primary group-hover:text-[#00E5FF] transition-colors">{node.label}</div>
                </div>

                {/* Mobile connector */}
                {i < graphPath.length - 1 && (
                  <div className="lg:hidden h-8 w-px bg-white/10 my-2" />
                )}

              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
