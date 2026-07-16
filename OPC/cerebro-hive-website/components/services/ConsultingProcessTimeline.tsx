"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const processSteps = [
  {
    phase: "Assess",
    description: "Evaluate enterprise readiness, data maturity, and security posture.",
    color: "#00E5FF"
  },
  {
    phase: "Discover",
    description: "Identify high-ROI use cases and operational bottlenecks.",
    color: "#00F57A"
  },
  {
    phase: "Strategy",
    description: "Design a board-approved, prioritized implementation roadmap.",
    color: "#FF8A00"
  },
  {
    phase: "Architecture",
    description: "Engineer scalable, secure system designs and data pipelines.",
    color: "#7B61FF"
  },
  {
    phase: "Build",
    description: "Develop custom models, agents, and integration microservices.",
    color: "#FF2ED1"
  },
  {
    phase: "Deploy",
    description: "Launch to production with strict human-in-the-loop safeguards.",
    color: "#00C8FF"
  },
  {
    phase: "Govern",
    description: "Implement continuous compliance monitoring and risk management.",
    color: "#00E5FF"
  },
  {
    phase: "Scale",
    description: "Expand capabilities across business units and optimize performance.",
    color: "#00F57A"
  }
];

export function ConsultingProcessTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use scroll position to animate the progress line
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  // We want the line to fill up as we scroll through the section
  const lineHeight = useTransform(scrollYProgress, [0.2, 0.8], ["0%", "100%"]);

  return (
    <section ref={containerRef} className="section-pad bg-background relative z-10 border-b border-border">
      <div className="container-wide max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-space font-bold text-text-primary mb-6">
            The Enterprise Engagement Model
          </h2>
          <p className="text-lg text-text-secondary font-inter max-w-2xl mx-auto">
            A structured, repeatable process designed to de-risk AI adoption and guarantee alignment with business objectives.
          </p>
        </div>

        <div className="relative pl-8 md:pl-0">
          {/* Center Line for Desktop, Left Line for Mobile */}
          <div className="absolute top-0 bottom-0 left-8 md:left-1/2 w-px bg-border -translate-x-1/2 z-0" />
          
          <motion.div 
            className="absolute top-0 left-8 md:left-1/2 w-[3px] bg-gradient-to-b from-primary-accent via-secondary-accent to-primary-accent -translate-x-1/2 z-0 origin-top"
            style={{ height: lineHeight }}
          />

          {processSteps.map((step, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={step.phase}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-12 last:mb-0 ${isEven ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Connector Dot */}
                <div className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full border-4 border-background -translate-x-1/2 mt-1.5 md:mt-0 transition-transform duration-300 hover:scale-150 shadow-sm" style={{ backgroundColor: step.color }} />

                {/* Content */}
                <div className={`w-full md:w-5/12 pl-10 md:pl-0 ${isEven ? 'md:text-left' : 'md:text-right'}`}>
                  <div className="p-6 rounded-2xl bg-surface-elevated border border-border shadow-sm hover:shadow-elevated hover:border-text-muted/30 transition-all duration-300">
                    <span className="text-[10px] font-bold tracking-widest uppercase mb-2 block" style={{ color: step.color }}>
                      Phase 0{index + 1}
                    </span>
                    <h3 className="text-xl font-space font-bold text-text-primary mb-3">
                      {step.phase}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Spacer for the other side */}
                <div className="hidden md:block w-5/12" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
