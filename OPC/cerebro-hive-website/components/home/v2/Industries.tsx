import React from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";

const industries = [
  { name: "Finance", metric: "3.2x", desc: "Faster compliance audits" },
  { name: "Healthcare", metric: "40%", desc: "Reduction in admin overhead" },
  { name: "Manufacturing", metric: "99.9%", desc: "Predictive maintenance accuracy" },
  { name: "Retail", metric: "2.5x", desc: "Increase in personalization ROI" },
  { name: "Energy", metric: "15%", desc: "Grid optimization efficiency" },
  { name: "Government", metric: "Zero", desc: "Data residency violations" },
];

export default function Industries() {
  return (
    <section className="section-pad bg-primary relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/5 opacity-20 animate-[spin_60s_linear_infinite]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5 opacity-30 animate-[spin_40s_linear_infinite_reverse]" />
      
      <div className="container-wide relative z-10">
        <SectionHeading 
          label="Industries"
          title="Sector-Specific Intelligence"
          description="We build AI systems that understand the unique data, regulations, and workflows of your industry."
          className="mb-16"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((ind, idx) => (
            <GlassCard key={idx} interactive className="p-8 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-accent/10 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:bg-primary-accent/20 transition-colors duration-500" />
              
              <h3 className="text-2xl font-space font-bold mb-6">{ind.name}</h3>
              
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-mono text-white group-hover:text-primary-accent transition-colors">
                  {ind.metric}
                </span>
              </div>
              <p className="text-sm font-inter text-text-muted">
                {ind.desc}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
