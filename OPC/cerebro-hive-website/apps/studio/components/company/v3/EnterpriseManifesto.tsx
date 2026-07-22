"use client";

import React from "react";
import { motion } from "framer-motion";

const statements = [
  "Knowledge should become infrastructure.",
  "AI should reason.",
  "Automation should compound.",
  "Architecture should endure.",
  "Research should become products.",
  "The enterprise should become intelligent."
];

export default function EnterpriseManifesto() {
  return (
    <section className="py-32 border-b border-border bg-background relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-full max-w-[800px] h-full bg-[#00F57A]/5 blur-[150px] rounded-full" />
      </div>

      <div className="container-wide relative z-10 text-center">

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-[10px] uppercase tracking-widest text-accent-primary font-bold mb-16">
          The Manifesto
        </div>

        <div className="flex flex-col gap-8 md:gap-12 max-w-4xl mx-auto">
          {statements.map((statement, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0.4, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl md:text-5xl lg:text-6xl font-space font-bold text-text-primary tracking-tighter"
            >
              {statement}
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0.4 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-24 pt-12 border-t border-border max-w-2xl mx-auto text-xl text-text-secondary font-inter"
        >
          That future is what CerebroHive exists to build.
        </motion.div>

      </div>
    </section>
  );
}
