"use client";

import React, { useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

const pipeline = [
  "Data Sources",
  "Lakehouse",
  "Knowledge Graph",
  "Vector DB",
  "LLM Core",
  "Agent Swarm",
  "Workflow Orchestration",
  "Enterprise Dashboard"
];

export default function ArchitectureSection() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <section className="section-pad bg-primary border-y border-white/5">
      <div className="container-wide">
        <SectionHeading 
          label="Architecture"
          title="The AI-Native Blueprint"
          description="How we structure modern enterprise intelligence, from raw data to autonomous action."
          className="mb-16"
        />

        <div className="bg-card border border-white/10 rounded-3xl p-8 md:p-16 overflow-x-auto relative">
          <div className="min-w-[800px] flex items-center justify-between relative z-10">
            {pipeline.map((step, idx) => (
              <React.Fragment key={idx}>
                <div 
                  className={cn(
                    "relative flex-shrink-0 w-32 h-32 rounded-xl flex items-center justify-center p-4 text-center text-sm font-space font-medium border transition-all duration-300 cursor-pointer",
                    activeStep === idx 
                      ? "bg-primary-accent/10 border-primary-accent text-white shadow-[0_0_20px_rgba(0,245,122,0.2)] scale-110" 
                      : "bg-[#0E131A] border-white/10 text-text-muted hover:border-white/30 hover:text-white"
                  )}
                  onMouseEnter={() => setActiveStep(idx)}
                  onMouseLeave={() => setActiveStep(null)}
                >
                  {step}
                  {activeStep === idx && (
                    <div className="absolute -bottom-2 w-12 h-1 bg-primary-accent rounded-full blur-[2px]" />
                  )}
                </div>
                
                {idx < pipeline.length - 1 && (
                  <div className="flex-grow h-[2px] bg-white/10 relative">
                    <div 
                      className={cn(
                        "absolute top-0 left-0 h-full bg-primary-accent transition-all duration-500",
                        activeStep !== null && (activeStep >= idx) ? "w-full" : "w-0"
                      )} 
                    />
                    {/* Arrow head */}
                    <div className={cn(
                      "absolute right-0 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-[6px] transition-colors duration-500",
                      activeStep !== null && (activeStep > idx) ? "border-l-primary-accent" : "border-l-white/20"
                    )} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
