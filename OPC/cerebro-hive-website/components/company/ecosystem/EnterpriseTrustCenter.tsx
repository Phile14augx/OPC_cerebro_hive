"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, Eye, Building2, BrainCircuit, Workflow, ArrowRight, FileText } from "lucide-react";
import { trustCenter } from "@/lib/content/company/trustCenter";
import { cn } from "@/lib/utils";

// ============================================================================
// COMPLIANCE PIPELINE
// ============================================================================
const CompliancePipeline = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <div className="relative w-full max-w-5xl mx-auto py-12">
      <h3 className="text-xs font-space font-bold uppercase tracking-widest text-text-muted mb-12 flex items-center gap-2">
        <Workflow size={14} className="text-primary-accent" />
        Compliance Journey
      </h3>

      <div className="relative flex items-center justify-between w-full h-32 md:h-48 mt-8">
        {/* Background Track */}
        <div className="absolute left-0 right-0 h-[1px] bg-white/10 top-1/2 -translate-y-1/2" />

        {/* Ambient Glow Traversal (Entry Only) */}
        <motion.div 
          initial={{ left: "0%", opacity: 0 }}
          whileInView={{ left: "100%", opacity: [0, 1, 1, 0] }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
          className="absolute h-[2px] w-32 bg-gradient-to-r from-transparent via-primary-accent to-transparent top-1/2 -translate-y-1/2 z-0 shadow-[0_0_20px_rgba(0,245,122,0.5)]"
        />

        {/* Nodes */}
        {trustCenter.roadmap.map((node, i) => {
          const isHovered = hoveredNode === node.id;
          
          return (
            <div 
              key={node.id} 
              className="relative z-10 flex flex-col items-center"
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Node Marker */}
              <motion.div 
                className={cn(
                  "w-4 h-4 rounded-full border-2 bg-background flex items-center justify-center transition-all duration-300 cursor-pointer",
                  isHovered ? "border-primary-accent scale-150 shadow-[0_0_15px_rgba(0,245,122,0.4)]" : "border-white/30"
                )}
              >
                {isHovered && <div className="w-1 h-1 rounded-full bg-primary-accent" />}
              </motion.div>

              {/* Static Label */}
              <div className="absolute top-8 w-max text-center transition-opacity duration-300" style={{ opacity: isHovered ? 0 : 1 }}>
                <span className="block text-[10px] font-mono text-text-muted uppercase mb-1">{node.stage}</span>
                <span className="block text-sm font-space font-bold text-white">{node.standard}</span>
              </div>

              {/* Hover Expanded Card */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-8 w-64 p-4 rounded-xl bg-surface-elevated border border-primary-accent/30 shadow-2xl backdrop-blur-xl z-50 flex flex-col pointer-events-none"
                  >
                    <span className="text-[10px] font-mono text-primary-accent uppercase mb-1">{node.stage}</span>
                    <span className="text-base font-space font-bold text-white mb-2">{node.standard}</span>
                    <p className="text-xs text-text-secondary font-inter mb-3 leading-relaxed border-b border-white/10 pb-3">
                      {node.description}
                    </p>
                    <p className="text-xs text-text-muted font-inter italic">
                      "{node.impact}"
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// READINESS METRICS
// ============================================================================
const ReadinessMetrics = () => {
  const categories = [
    { key: "security", icon: <Lock size={14} />, label: "Security" },
    { key: "privacy", icon: <Eye size={14} />, label: "Privacy" },
    { key: "ai", icon: <BrainCircuit size={14} />, label: "AI Governance" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-12 border-t border-white/5">
      {categories.map((cat, i) => (
        <motion.div 
          key={cat.key}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="flex flex-col gap-4"
        >
          <h4 className="text-[10px] font-mono tracking-widest uppercase text-text-muted flex items-center gap-2">
            {cat.icon} {cat.label}
          </h4>
          <div className="flex flex-col gap-3">
            {(trustCenter.readinessMetrics as any)[cat.key].map((metric: any, j: number) => (
              <div key={j} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-colors group">
                <span className="text-xs font-inter text-text-secondary group-hover:text-white transition-colors">{metric.label}</span>
                <span className="text-xs font-space font-bold text-white group-hover:text-primary-accent transition-colors">{metric.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================================
// MAIN TRUST CENTER COMPONENT
// ============================================================================
export const EnterpriseTrustCenter = () => {
  return (
    <section id="trust-center" className="section-pad bg-background relative overflow-hidden border-t border-border">
      
      {/* Premium Background Layers */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-accent/5 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* Ambient drift */}
        <motion.div 
          className="absolute inset-0 opacity-[0.03]"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
        />
      </div>

      <div className="container-wide relative z-10">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <h2 className="text-[10px] font-mono tracking-widest uppercase text-primary-accent mb-4 flex items-center gap-2">
            <ShieldCheck size={14} /> Enterprise Trust Center
          </h2>
          <h3 className="text-3xl md:text-5xl font-space font-bold text-white tracking-tight leading-tight mb-6">
            Security-first engineering for production AI systems.
          </h3>
          <p className="text-lg text-text-secondary font-inter">
            Enterprise buyers don't just need prototypes. They need confidence. We build rigorous security, governance, and privacy controls directly into our architectural DNA.
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 mb-8">
          
          {/* Left: Trust Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trustCenter.pillars.map((pillar, i) => (
              <motion.div 
                key={pillar.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-surface-elevated border border-white/5 hover:border-primary-accent/30 transition-colors group flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-6">
                  <h4 className="text-lg font-space font-bold text-white group-hover:text-primary-accent transition-colors">{pillar.title}</h4>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-[9px] font-mono uppercase tracking-widest border",
                    pillar.status === "Strong" || pillar.status === "Enterprise Ready" ? "bg-primary-accent/10 text-primary-accent border-primary-accent/20" : "bg-white/5 text-text-muted border-white/10"
                  )}>
                    {pillar.status}
                  </span>
                </div>
                <p className="text-sm text-text-secondary font-inter leading-relaxed mt-auto">
                  {pillar.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Right: Responsible AI Focus Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-2xl bg-gradient-to-b from-[#0a0f18] to-[#05080f] border border-primary-accent/20 flex flex-col h-full relative overflow-hidden group"
          >
            {/* Ambient Background for AI Card */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-accent/10 rounded-full blur-[40px] pointer-events-none" />
            
            <h4 className="text-xs font-space font-bold uppercase tracking-widest text-primary-accent mb-6 flex items-center gap-2 relative z-10">
              <BrainCircuit size={16} /> {trustCenter.aiGovernance.title}
            </h4>
            
            <p className="text-sm text-white/80 font-inter mb-8 relative z-10">
              As an AI consultancy, ethical modeling and safety alignment are first-class citizens in our framework.
            </p>

            <ul className="flex flex-col gap-3 relative z-10 mt-auto">
              {trustCenter.aiGovernance.areas.map((area, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-text-secondary font-inter group-hover:text-white transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-accent/50" />
                  {area}
                </li>
              ))}
            </ul>
          </motion.div>

        </div>

        {/* Interactive Pipeline */}
        <div className="p-8 md:p-12 rounded-3xl bg-surface-elevated border border-white/5 mt-8">
          <CompliancePipeline />
        </div>

        {/* Readiness Metrics */}
        <ReadinessMetrics />

        {/* Documentation / Footer Links */}
        <div className="flex flex-wrap justify-center gap-6 mt-20">
          <a href="#" className="flex items-center gap-2 text-sm font-space font-bold text-text-muted hover:text-primary-accent transition-colors">
            <FileText size={16} /> Security Overview <ArrowRight size={14} />
          </a>
          <a href="#" className="flex items-center gap-2 text-sm font-space font-bold text-text-muted hover:text-primary-accent transition-colors">
            <Building2 size={16} /> Enterprise Architecture <ArrowRight size={14} />
          </a>
        </div>

      </div>
    </section>
  );
};
