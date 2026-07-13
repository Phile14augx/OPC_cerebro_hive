import React from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

const papers = [
  { title: "Agentic Orchestration in ERP Systems", type: "Research Paper", date: "Jul 2026" },
  { title: "Optimizing Vector DB Latency for RAG", type: "Benchmark", date: "Jun 2026" },
  { title: "Stateful Knowledge Graphs", type: "Architecture Guide", date: "May 2026" },
];

export default function ResearchSection() {
  return (
    <section className="section-pad bg-secondary">
      <div className="container-wide grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <SectionHeading 
            label="Thought Leadership"
            title="CerebroHive Research"
            description="We open-source our benchmarks, publish whitepapers, and share our architectural blueprints to advance the field of enterprise AI."
            align="left"
            className="mb-8"
          />
          <AnimatedButton variant="outline">
            Browse Library
          </AnimatedButton>
        </div>

        <div className="flex flex-col gap-4">
          {papers.map((paper, idx) => (
            <div 
              key={idx}
              className="p-6 bg-surface border border-border rounded-2xl hover:border-primary-accent/40 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-space text-secondary-accent uppercase tracking-wider">{paper.type}</span>
                  <span className="text-xs text-text-muted">{paper.date}</span>
                </div>
                <h4 className="text-lg md:text-xl font-space font-medium text-text-primary group-hover:text-primary-accent transition-colors">
                  {paper.title}
                </h4>
              </div>
              
              <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-muted group-hover:border-primary-accent group-hover:text-primary-accent transition-all shrink-0">
                <svg className="w-4 h-4 -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
