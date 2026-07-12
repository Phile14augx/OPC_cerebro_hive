import React from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";

const cases = [
  { company: "Global FinTech", metric: "85%", desc: "Reduction in manual compliance checks using Agentic AI." },
  { company: "Manufacturing Co", metric: "$4M", desc: "Saved annually via predictive maintenance knowledge graph." }
];

export default function CaseStudies() {
  return (
    <section className="section-pad bg-primary">
      <div className="container-wide">
        <SectionHeading 
          label="Impact"
          title="Proven Outcomes"
          description="We measure our success by the measurable business value we deliver to our partners."
          className="mb-16"
        />

        <div className="grid md:grid-cols-2 gap-8">
          {cases.map((c, idx) => (
            <div key={idx} className="group p-8 md:p-12 bg-[#0E131A] rounded-3xl border border-white/5 hover:border-white/20 transition-all cursor-pointer">
              <span className="text-sm font-space text-text-muted mb-8 block">{c.company}</span>
              
              <div className="text-6xl md:text-7xl font-bold font-mono text-white mb-6 group-hover:text-primary-accent transition-colors">
                {c.metric}
              </div>
              
              <p className="text-xl md:text-2xl font-inter text-text-muted">
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
