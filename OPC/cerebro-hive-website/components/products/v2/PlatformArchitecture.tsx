"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BrainCircuit, Cpu, Database, Network, Search, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const nodes = [
  { id: "agentos", label: "AgentOS", role: "Autonomy Layer", icon: Cpu, color: "text-[#00E5FF]", border: "border-[#00E5FF]/30", bg: "bg-[#00E5FF]/5" },
  { id: "knowledge", label: "Knowledge Hub", role: "Context Layer", icon: Search, color: "text-[#00F57A]", border: "border-[#00F57A]/30", bg: "bg-[#00F57A]/5" },
  { id: "core", label: "Cerebro AI", role: "Reasoning Engine", icon: BrainCircuit, color: "text-primary-accent", border: "border-primary-accent/50", bg: "bg-primary-accent/10" },
  { id: "analytics", label: "Analytics", role: "Insight Layer", icon: Zap, color: "text-white", border: "border-white/20", bg: "bg-white/5" },
  { id: "erp", label: "Quantiva ERP", role: "System of Record", icon: Database, color: "text-[#FFB300]", border: "border-[#FFB300]/30", bg: "bg-[#FFB300]/5" },
];

const verbs = ["uses", "queries", "feeds", "updates"];

export const PlatformArchitecture = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section className="py-24 border-b border-border bg-surface relative overflow-hidden" ref={containerRef}>
      
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`, backgroundSize: '48px 48px' }} />

      <div className="container-wide relative z-10">
        <div className="text-center mb-20">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-3 block">Platform Relationships</span>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-4">An Interconnected Ecosystem</h2>
          <p className="text-text-secondary max-w-2xl mx-auto font-inter">
            Our products don't operate in silos. They share intelligence, context, and actions across a unified foundation.
          </p>
        </div>

        {/* The Dependency Flow */}
        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
          
          {nodes.map((node, i) => (
            <React.Fragment key={node.id}>
              {/* Node Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="relative z-10 w-full md:w-40 flex-shrink-0"
              >
                <div className={cn("p-4 rounded-xl border backdrop-blur-sm text-center flex flex-col items-center shadow-lg transition-transform hover:scale-105", node.border, node.bg)}>
                  <div className={cn("mb-3 p-3 rounded-full bg-surface-elevated/50 shadow-inner", node.color)}>
                    <node.icon size={24} />
                  </div>
                  <div className="text-xs font-space font-bold text-white mb-1">{node.label}</div>
                  <div className="text-[9px] uppercase tracking-wider text-text-muted">{node.role}</div>
                </div>
              </motion.div>

              {/* Connecting Edge */}
              {i < nodes.length - 1 && (
                <div className="flex-1 flex flex-col items-center justify-center relative w-full h-16 md:h-auto min-w-[40px] md:min-w-[80px]">
                  
                  {/* Label */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.2 + 0.3 }}
                    className="absolute -top-6 md:-top-8 text-[10px] uppercase font-bold tracking-widest text-text-muted"
                  >
                    {verbs[i]}
                  </motion.div>

                  {/* Line */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1 md:w-full h-full md:h-1 bg-border rounded-full relative overflow-hidden">
                      <motion.div 
                        className="absolute top-0 bottom-0 left-0 right-0 bg-primary-accent/50"
                        initial={i % 2 === 0 ? { left: "-100%" } : { top: "-100%" }}
                        animate={
                          i % 2 === 0 
                            ? { left: ["-100%", "100%"] } 
                            : { top: ["-100%", "100%"] }
                        }
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
                      />
                    </div>
                  </div>
                  
                  {/* Small chevron */}
                  <div className="hidden md:block absolute right-0 -mr-2 text-border">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                  <div className="block md:hidden absolute bottom-0 -mb-2 text-border">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>

                </div>
              )}
            </React.Fragment>
          ))}

        </div>
      </div>
    </section>
  );
};
