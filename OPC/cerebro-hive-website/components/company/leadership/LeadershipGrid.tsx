"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Workflow, ArrowDown } from "lucide-react";
import Image from "next/image";
import { withBasePath, cn } from "@/lib/utils";
import { organizationalCapabilities } from "@/lib/content/company/organizationalCapabilities";
import { SectionMetadata } from "@/components/ui/SectionMetadata";
import { MetricChip } from "@/components/ui/MetricChip";
import { motionPresets } from "@/lib/motion";

// Helper components for visual consistency
const CapabilityPanel = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("relative rounded-3xl border border-white/5 bg-[#0a0f12] overflow-hidden p-8 lg:p-12", className)}>
    {children}
  </div>
);

const SectionBackground = ({ theme }: { theme: "gold" | "cyan" | "purple" }) => {
  const backgrounds = {
    gold: "linear-gradient(rgba(255, 215, 0, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 215, 0, 0.4) 1px, transparent 1px)", // Subtle lines
    cyan: "linear-gradient(rgba(0, 229, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.4) 1px, transparent 1px)", // Blueprint
    purple: "linear-gradient(rgba(157, 0, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(157, 0, 255, 0.4) 1px, transparent 1px)" // Mesh proxy
  };
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02]"
         style={{
           backgroundImage: backgrounds[theme],
           backgroundSize: '80px 80px',
           maskImage: 'radial-gradient(circle at 50% 50%, black 30%, transparent 80%)',
           WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 30%, transparent 80%)'
         }}
    />
  );
};

export const LeadershipGrid = () => {
  const [executive, engineering, research] = organizationalCapabilities.departments;

  return (
    <section className="section-pad relative overflow-hidden bg-[#030608]">
      <div className="container-wide relative z-10 flex flex-col gap-8">
        
        {/* ==========================================
            EXECUTIVE CAPABILITY (40% Weight)
           ========================================== */}
        <motion.div variants={motionPresets.fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
          <CapabilityPanel className="flex flex-col lg:flex-row gap-12 lg:gap-16 border-t-[3px] border-t-amber-500/50">
            <SectionBackground theme="gold" />
            
            {/* Identity */}
            <div className="lg:w-[35%] relative z-10">
              <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-[#0a0d14] mb-6 shadow-2xl">
                <Image src={withBasePath(executive.portrait.image)} alt={executive.portrait.name} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] pointer-events-none" />
              </div>
              <h3 className="text-3xl font-space font-bold text-white mb-2">{executive.title}</h3>
              <p className="text-sm font-inter text-text-secondary">{executive.subtitle}</p>
            </div>

            {/* Narrative */}
            <div className="lg:w-[65%] relative z-10 flex flex-col">
              <p className="text-2xl md:text-3xl font-space font-bold text-white/90 leading-tight mb-12 pl-6 border-l-2 border-amber-500/30">
                "{executive.philosophy.quote}"
              </p>
              
              <div className="grid md:grid-cols-2 gap-12 mt-auto">
                <div>
                  <h4 className="text-[10px] font-space font-bold uppercase tracking-widest text-text-muted mb-6">Leadership Philosophy</h4>
                  <div className="flex flex-col gap-4">
                    {executive.philosophy.framework.map((step, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">{step.label}</span>
                        <span className="text-sm font-space font-bold text-white">{step.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col gap-8">
                  <div>
                    <h4 className="text-[10px] font-space font-bold uppercase tracking-widest text-text-muted mb-4">Clients Can Expect</h4>
                    <ul className="flex flex-col gap-2">
                      {executive.commitments?.map((commitment, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs font-mono text-text-secondary">
                          <CheckCircle2 size={14} className="text-amber-500 opacity-80" /> {commitment}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-space font-bold uppercase tracking-widest text-text-muted mb-4">Strategic Focus</h4>
                    <div className="flex flex-wrap gap-2">
                      {executive.priorities.map((p, i) => (
                        <span key={i} className="text-[10px] font-mono text-text-muted bg-white/5 border border-white/10 px-2 py-1 rounded cursor-default hover:bg-white/10">{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CapabilityPanel>
        </motion.div>

        {/* Visual Connector */}
        <div className="hidden lg:flex justify-center -my-4 relative z-20 pointer-events-none">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-amber-500/70 mb-2 uppercase tracking-widest bg-[#030608] px-4">Directs</span>
            <div className="h-12 w-[1px] bg-gradient-to-b from-amber-500/50 to-cyan-500/50" />
            <ArrowDown size={14} className="text-cyan-500/50 -mt-2" />
          </div>
        </div>

        {/* ==========================================
            ENGINEERING CAPABILITY (35% Weight)
           ========================================== */}
        <motion.div variants={motionPresets.fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
          <CapabilityPanel className="flex flex-col lg:flex-row gap-12 lg:gap-16 border-t-[3px] border-t-cyan-500/50 py-10 lg:py-10">
            <SectionBackground theme="cyan" />
            
            {/* Identity */}
            <div className="lg:w-[35%] relative z-10 flex flex-col justify-center">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-[#0a0d14] relative shadow-lg">
                  <Image src={withBasePath(engineering.portrait.image)} alt={engineering.portrait.name} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-space font-bold text-white">{engineering.title}</h3>
                  <p className="text-sm font-inter text-text-secondary">{engineering.subtitle}</p>
                </div>
              </div>
              <p className="text-sm font-inter font-medium text-white/80 leading-relaxed pl-4 border-l-2 border-cyan-500/30">
                "{engineering.philosophy.quote}"
              </p>
            </div>

            {/* Narrative */}
            <div className="lg:w-[65%] relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h4 className="text-[10px] font-space font-bold uppercase tracking-widest text-text-muted mb-6">Engineering Framework</h4>
                <div className="flex flex-col gap-3 relative">
                  <div className="absolute left-[11px] top-4 bottom-4 w-[1px] bg-white/10" />
                  {engineering.philosophy.framework.map((step, i) => (
                    <div key={i} className="flex items-center gap-4 relative z-10">
                      <div className="w-6 h-6 rounded-full bg-[#0a0f12] border border-cyan-500/40 flex items-center justify-center text-[8px] font-mono font-bold text-cyan-500">{step.label}</div>
                      <span className="text-sm font-space font-bold text-white uppercase tracking-wider">{step.title}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-8">
                <div>
                  <h4 className="text-[10px] font-space font-bold uppercase tracking-widest text-text-muted mb-4">Live Metrics</h4>
                  <div className="flex flex-col gap-3">
                    {engineering.metrics?.map((m, i) => (
                      <MetricChip key={i} label={m.label} initialValue={m.value} status={m.status as any} />
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-space font-bold uppercase tracking-widest text-text-muted mb-4">Core Competencies</h4>
                  <div className="flex flex-wrap gap-2">
                    {engineering.priorities.map((p, i) => (
                      <span key={i} className="text-[10px] font-mono text-cyan-500/70 border border-cyan-500/20 bg-cyan-500/5 px-2 py-1 rounded cursor-default">{p}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CapabilityPanel>
        </motion.div>

        {/* Visual Connector */}
        <div className="hidden lg:flex justify-center -my-4 relative z-20 pointer-events-none">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-cyan-500/70 mb-2 uppercase tracking-widest bg-[#030608] px-4">Builds & Operates</span>
            <div className="h-12 w-[1px] bg-gradient-to-b from-cyan-500/50 to-purple-500/50" />
            <ArrowDown size={14} className="text-purple-500/50 -mt-2" />
          </div>
        </div>

        {/* ==========================================
            RESEARCH CAPABILITY (25% Weight)
           ========================================== */}
        <motion.div variants={motionPresets.fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
          <CapabilityPanel className="flex flex-col lg:flex-row gap-8 lg:gap-16 border-t-[3px] border-t-purple-500/50 py-8 lg:py-8">
            <SectionBackground theme="purple" />
            
            {/* Identity */}
            <div className="lg:w-[35%] relative z-10 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-[#0a0d14] relative shadow-lg">
                  <Image src={withBasePath(research.portrait.image)} alt={research.portrait.name} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                </div>
                <div>
                  <h3 className="text-xl font-space font-bold text-white">{research.title}</h3>
                  <p className="text-xs font-inter text-text-secondary">{research.subtitle}</p>
                </div>
              </div>
              <p className="text-xs font-inter font-medium text-white/70 leading-relaxed pl-4 border-l-2 border-purple-500/30">
                "{research.philosophy.quote}"
              </p>
            </div>

            {/* Narrative */}
            <div className="lg:w-[65%] relative z-10 grid md:grid-cols-3 gap-8 items-start">
              
              <div className="md:col-span-1">
                <h4 className="text-[10px] font-space font-bold uppercase tracking-widest text-text-muted mb-4">Innovation Pipeline</h4>
                <div className="flex gap-2">
                  {research.philosophy.framework.map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-purple-500 uppercase">{step.title}</span>
                      {i < research.philosophy.framework.length - 1 && <Workflow size={10} className="text-white/20" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-1">
                <h4 className="text-[10px] font-space font-bold uppercase tracking-widest text-text-muted mb-4">Applied Themes</h4>
                <div className="flex flex-wrap gap-2">
                  {research.priorities.map((p, i) => (
                    <span key={i} className="text-[10px] font-mono text-purple-500/70 border border-purple-500/20 bg-purple-500/5 px-2 py-1 rounded cursor-default">{p}</span>
                  ))}
                </div>
              </div>

              <div className="md:col-span-1">
                <h4 className="text-[10px] font-space font-bold uppercase tracking-widest text-text-muted mb-4">Ecosystem Value</h4>
                <div className="flex flex-col gap-2">
                  {research.metrics?.map((m, i) => (
                    <div key={i} className="flex flex-col gap-1 p-2 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-[10px] font-mono text-text-muted">{m.label}</span>
                      <span className="text-xs font-space font-bold text-white">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </CapabilityPanel>
        </motion.div>

        {/* Final Connector to Outcomes */}
        <div className="hidden lg:flex justify-center -mt-4 relative z-20 pointer-events-none">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-success/70 mb-2 uppercase tracking-widest bg-[#030608] px-4">Delivers Client Outcomes</span>
          </div>
        </div>

      </div>
    </section>
  );
};
