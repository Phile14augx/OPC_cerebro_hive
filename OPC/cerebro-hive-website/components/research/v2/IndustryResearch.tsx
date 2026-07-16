"use client";

import React, { useState } from "react";
import { Activity, ShieldCheck, Factory, ArrowRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const industries = [
  {
    id: "healthcare",
    icon: Activity,
    label: "Healthcare & Life Sciences",
    desc: "AI research focused on HIPAA-compliant agentic workflows for clinical documentation.",
    papers: ["Clinical Note Parsing via Local LLMs", "Federated Learning for Patient Outcome Prediction"]
  },
  {
    id: "finance",
    icon: ShieldCheck,
    label: "Financial Services",
    desc: "Low-latency reasoning models for fraud detection and automated compliance auditing.",
    papers: ["Zero-Shot Anomaly Detection in Transaction Streams", "Agentic RFP Generation for Asset Management"]
  },
  {
    id: "manufacturing",
    icon: Factory,
    label: "Manufacturing & Supply Chain",
    desc: "Multi-agent systems for predictive maintenance and dynamic inventory routing.",
    papers: ["Reinforcement Learning for Warehouse Routing", "Computer Vision Defect Detection on the Edge"]
  }
];

export const IndustryResearch = () => {
  const [active, setActive] = useState(industries[0].id);

  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-4">Research by Industry</h2>
          <p className="text-text-secondary max-w-2xl mx-auto font-inter">
            We conduct targeted research to solve the specific bottlenecks holding back AI adoption in highly regulated sectors.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {industries.map(ind => {
            const isActive = active === ind.id;
            return (
              <div 
                key={ind.id}
                onMouseEnter={() => setActive(ind.id)}
                className={cn(
                  "p-8 rounded-2xl border transition-all cursor-pointer h-full flex flex-col",
                  isActive 
                    ? "bg-surface border-primary-accent/50 shadow-[0_0_20px_rgba(0,245,122,0.1)]" 
                    : "bg-surface border-border hover:border-white/20"
                )}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                    isActive ? "bg-primary-accent/10 text-primary-accent" : "bg-white/5 text-text-muted"
                  )}>
                    <ind.icon size={24} />
                  </div>
                  <h3 className={cn("text-xl font-space font-bold transition-colors", isActive ? "text-text-primary" : "text-text-secondary")}>
                    {ind.label}
                  </h3>
                </div>
                
                <p className="text-sm text-text-muted mb-6 flex-1">
                  {ind.desc}
                </p>

                <div className={cn("space-y-3 transition-opacity", isActive ? "opacity-100" : "opacity-50")}>
                  <div className="text-[10px] uppercase tracking-widest text-accent-secondary font-bold">Key Papers</div>
                  {ind.papers.map((paper, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-text-primary hover:text-primary-accent transition-colors">
                      <BookOpen size={14} className="mt-0.5 shrink-0" />
                      <span>{paper}</span>
                    </div>
                  ))}
                  <button className="mt-4 text-xs font-bold text-primary-accent flex items-center gap-2 hover:text-white transition-colors">
                    Explore Industry <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
