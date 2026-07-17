"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cpu, ArrowRight, Terminal } from "lucide-react";
import { withBasePath } from "@/lib/utils";
import { pyramidTiers } from "@/lib/data/products/agentos-pyramid";

export const AgentOSHero = () => {
  return (
    <section className="relative min-h-[92vh] pt-32 pb-20 border-b border-border bg-background flex flex-col justify-center overflow-hidden">
      {/* Background ambience */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-primary-accent/5 rounded-full blur-[160px] mix-blend-screen"
          animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-screen" style={{ backgroundImage: `url('${withBasePath("/images/noise.png")}')` }} />
      </div>

      <div className="container-wide relative z-10 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-primary-accent animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Enterprise AI Operating System</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-space font-bold text-text-primary leading-[1.05] tracking-tight mb-6 max-w-5xl">
          Windows runs applications.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent via-[#00E5FF] to-primary-accent bg-[length:200%_auto] animate-gradient-shift">
            AgentOS runs agents.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-text-secondary font-inter max-w-2xl leading-relaxed mb-10">
          AgentOS isn&apos;t an agent framework — it&apos;s the kernel, memory, reasoning, tool, and governance layers every autonomous
          enterprise workflow runs on. One runtime. Every department. Fully observable, fully governed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0 mb-16">
          <button className="group w-full sm:w-auto px-8 py-4 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg flex items-center justify-center gap-3 transition-all hover:bg-surface shadow-[0_0_20px_rgba(0,245,122,0.2)]">
            Request Demo
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-surface border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg hover:border-primary-accent/40 hover:bg-surface-elevated transition-all flex items-center justify-center gap-2">
            <Terminal size={16} /> View Architecture
          </button>
        </div>

        {/* Pyramid teaser strip */}
        <div className="w-full max-w-4xl flex flex-col gap-1.5">
          {pyramidTiers.map((tier, i) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-4 bg-surface border border-border rounded-lg px-5 py-3"
              style={{ width: `${100 - i * 10}%`, marginLeft: `${i * 5}%` }}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted w-14 shrink-0 text-left">{tier.tier}</span>
              <span className="text-sm font-space font-bold text-text-primary flex-1 text-left">{tier.name}</span>
              <Cpu size={14} className="text-primary-accent shrink-0" />
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-text-muted mt-4 font-mono">5 layers · 24 subsystems · 1 runtime</p>
      </div>
    </section>
  );
};
