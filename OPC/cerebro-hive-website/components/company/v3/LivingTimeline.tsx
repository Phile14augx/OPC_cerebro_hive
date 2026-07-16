"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const milestones = [
  { year: "2024", label: "Foundation", title: "The Thesis", desc: "CerebroHive is founded on the premise that enterprise AI requires systems engineering, not just prompt engineering." },
  { year: "2024", label: "Research", title: "Architectural Blueprints", desc: "Published our first core frameworks for deterministic routing and secure agentic workflows." },
  { year: "2025", label: "Platform", title: "AgentOS Beta", desc: "Deployed the first iterations of our enterprise platform to select design partners." },
  { year: "2025", label: "Scale", title: "Enterprise Expansion", desc: "Scaling deployments across Fortune 500 clients in Financial Services and Healthcare." },
  { year: "Future", label: "Vision", title: "The Autonomous Enterprise", desc: "Transitioning organizations from human-orchestrated AI to fully autonomous knowledge graphs." }
];

export default function LivingTimeline() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        
        <div className="text-center mb-24">
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-6">Our Trajectory</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-inter">
            A living record of our research, our engineering, and where we are taking the enterprise next.
          </p>
        </div>

        {/* Timeline Desktop */}
        <div className="hidden md:block relative max-w-5xl mx-auto mb-16">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-surface-elevated -translate-y-1/2" />
          <div className="flex justify-between relative z-10">
            {milestones.map((m, i) => (
              <button 
                key={i}
                onClick={() => setActiveIndex(i)}
                className="flex flex-col items-center gap-4 group w-32"
              >
                <div className={`text-xs font-bold uppercase tracking-widest transition-colors ${activeIndex === i ? 'text-text-primary' : 'text-text-muted group-hover:text-text-secondary'}`}>
                  {m.year}
                </div>
                <div className={`w-4 h-4 rounded-full border-2 transition-all ${activeIndex === i ? 'bg-[#00E5FF] border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.5)] scale-150' : 'bg-background border-border group-hover:border-border-default'}`} />
                <div className={`text-xs font-bold uppercase tracking-widest transition-colors ${activeIndex === i ? 'text-accent-secondary' : 'text-transparent'}`}>
                  {m.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Display Area */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-surface border border-border rounded-2xl p-8 md:p-12 min-h-[250px] relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="relative z-10 text-center"
              >
                <div className="text-xs font-bold uppercase tracking-widest text-accent-secondary mb-4">
                  {milestones[activeIndex].year} • {milestones[activeIndex].label}
                </div>
                <h3 className="text-2xl md:text-3xl font-space font-bold text-text-primary mb-4">
                  {milestones[activeIndex].title}
                </h3>
                <p className="text-lg text-text-secondary font-inter">
                  {milestones[activeIndex].desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Timeline Mobile */}
        <div className="md:hidden mt-12 flex justify-center gap-2">
          {milestones.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${activeIndex === i ? 'bg-[#00E5FF]' : 'bg-surface-elevated'}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
