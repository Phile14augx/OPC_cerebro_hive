"use client";

import React from "react";
import { motion } from "framer-motion";
import { Target } from "lucide-react";

export function ExecutiveSummary() {
  return (
    <section className="section-pad-sm relative z-10 border-b border-border bg-background">
      <div className="container-wide max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0.4, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated border border-border mb-8 shadow-sm">
            <Target size={14} className="text-primary-accent" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">
              How We Help
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-space font-bold text-text-primary leading-tight mb-8">
            From AI Strategy to Enterprise Scale
          </h2>
          
          <p className="text-lg md:text-xl text-text-secondary font-inter leading-relaxed max-w-4xl mx-auto">
            We partner with executive teams to identify high-impact AI opportunities, 
            design production-ready architectures, implement secure intelligent systems, 
            and establish governance frameworks for long-term business value.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
