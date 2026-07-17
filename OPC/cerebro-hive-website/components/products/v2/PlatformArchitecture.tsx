"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Cpu, Layers, Briefcase, FlaskConical, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// The four-pillar model: Platform (the moat) -> Products -> Enterprise Services -> Research feeding back in.
const tiers = [
  {
    id: "platform",
    label: "Platform",
    subtitle: "Proprietary technology — the moat",
    icon: Cpu,
    color: "text-accent-secondary",
    border: "border-[#00E5FF]/30",
    bg: "bg-[#00E5FF]/5",
    chipBg: "bg-[#00E5FF]/10",
    items: [
      "AgentOS™", "Memory Fabric™", "Knowledge Fabric™", "Reasoning Engine™",
      "Context Engine™", "Agent Mesh™", "Guard™", "Eval™", "Observatory™", "Governance™",
    ],
  },
  {
    id: "products",
    label: "Products",
    subtitle: "Packaged applications built on the Platform",
    icon: Layers,
    color: "text-accent-primary",
    border: "border-accent-primary/30",
    bg: "bg-[#00F57A]/5",
    chipBg: "bg-[#00F57A]/10",
    items: [
      "CerebroArchive™", "CerebroStudio™", "CerebroFlow™", "CerebroInsight™",
      "CerebroCopilot™", "HiveOps™", "HiveShield™", "CerebroSphere™",
    ],
  },
  {
    id: "services",
    label: "Enterprise Services",
    subtitle: "Delivering Platform + Products into the enterprise",
    icon: Briefcase,
    color: "text-primary-accent",
    border: "border-primary-accent/50",
    bg: "bg-primary-accent/10",
    chipBg: "bg-primary-accent/15",
    items: [
      "AI Strategy™", "AI Platform Engineering™", "Knowledge Engineering™",
      "AI Factory™", "AI Center of Excellence™", "AI Governance & Trust™", "AIOps™",
    ],
  },
  {
    id: "research",
    label: "Research",
    subtitle: "CerebroHive Labs — feeds new capability back into the Platform",
    icon: FlaskConical,
    color: "text-warning",
    border: "border-[#FFB300]/30",
    bg: "bg-[#FFB300]/5",
    chipBg: "bg-[#FFB300]/10",
    items: [
      "Agent Architectures", "AI Safety", "Memory Systems", "Enterprise RAG",
      "Knowledge Graphs", "Digital Twins", "Multimodal Systems",
    ],
  },
];

export const PlatformArchitecture = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section className="py-24 border-b border-border bg-surface relative overflow-hidden" ref={containerRef}>

      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`, backgroundSize: '48px 48px' }} />

      <div className="container-wide relative z-10">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-3 block">How We're Built</span>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-4">Platform, Not Point Tools</h2>
          <p className="text-text-secondary max-w-2xl mx-auto font-inter">
            Every product and every engagement is built on one proprietary Platform — the defensible core competitors can&apos;t replicate by hiring consultants.
          </p>
        </div>

        {/* The Four-Tier Stack */}
        <div className="max-w-5xl mx-auto flex flex-col">
          {tiers.map((tier, i) => (
            <React.Fragment key={tier.id}>
              <motion.div
                initial={{ opacity: 0.4, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className={cn("rounded-xl border backdrop-blur-sm shadow-lg", tier.border, tier.bg)}
              >
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 p-5 md:p-6">
                  {/* Label column */}
                  <div className="flex md:flex-col items-center md:items-start gap-3 md:gap-1 md:w-56 shrink-0">
                    <div className={cn("p-2.5 rounded-full bg-surface-elevated/60 shadow-inner", tier.color)}>
                      <tier.icon size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-space font-bold text-text-primary leading-tight">{tier.label}</div>
                      <div className="text-[10px] uppercase tracking-wider text-text-muted mt-1 leading-snug hidden md:block">{tier.subtitle}</div>
                    </div>
                  </div>

                  {/* Chips */}
                  <div className="flex flex-wrap gap-2 items-center flex-1">
                    {tier.items.map((item) => (
                      <span
                        key={item}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-[11px] md:text-xs font-space font-semibold text-text-primary border border-border/60 whitespace-nowrap",
                          tier.chipBg
                        )}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="md:hidden px-5 pb-4 -mt-2 text-[10px] uppercase tracking-wider text-text-muted">{tier.subtitle}</div>
              </motion.div>

              {/* Connector */}
              {i < tiers.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.15 + 0.25 }}
                  className="flex items-center justify-center py-2"
                >
                  <div className="w-px h-6 bg-border relative overflow-hidden">
                    <motion.div
                      className="absolute inset-x-0 top-0 h-full bg-primary-accent/60"
                      initial={{ top: "-100%" }}
                      animate={{ top: ["-100%", "100%"] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
                    />
                  </div>
                  <ChevronDown size={14} className="text-border ml-1" />
                </motion.div>
              )}
            </React.Fragment>
          ))}

          {/* Feedback loop label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="text-center mt-8 text-[11px] uppercase tracking-widest text-text-muted font-bold"
          >
            Research findings compound back into the Platform — the flywheel that keeps the moat widening
          </motion.div>
        </div>
      </div>
    </section>
  );
};
