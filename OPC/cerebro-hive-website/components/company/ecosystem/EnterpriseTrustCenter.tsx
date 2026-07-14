"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, Eye, Building2, BrainCircuit, Activity, FileText, ArrowRight, CheckCircle2, Landmark } from "lucide-react";
import { trustCenter } from "@/lib/content/company/trustCenter";
import { cn } from "@/lib/utils";
import { NeuralOrb } from "@/components/ui/NeuralOrb";

// ============================================================================
// EXECUTIVE SCORECARD
// ============================================================================
const ExecutiveScorecard = () => {
  return (
    <div className="absolute top-0 right-0 hidden lg:flex flex-col gap-3 p-4 rounded-xl bg-surface-elevated/50 border border-white/5 backdrop-blur-xl z-20 shadow-2xl w-64">
      <h4 className="text-[9px] font-mono tracking-widest uppercase text-text-muted border-b border-white/5 pb-2 mb-1">
        Executive Scan
      </h4>
      {trustCenter.summary.map((item, i) => (
        <div key={i} className="flex justify-between items-center">
          <span className="text-xs font-inter text-text-secondary">{item.label}</span>
          <div className="flex items-center gap-1.5">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              item.indicator === "good" ? "bg-primary-accent shadow-[0_0_5px_rgba(0,245,122,0.5)]" :
              item.indicator === "active" ? "bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.5)] animate-pulse" :
              "bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]"
            )} />
            <span className={cn(
              "text-[10px] font-mono uppercase tracking-wider",
              item.indicator === "good" ? "text-primary-accent" :
              item.indicator === "active" ? "text-cyan-500" :
              "text-amber-500"
            )}>
              {item.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// TRUST MATURITY ROADMAP (PIPELINE)
// ============================================================================
const TrustMaturityRoadmap = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <div className="relative w-full max-w-5xl mx-auto py-12">
      <h3 className="text-xs font-space font-bold uppercase tracking-widest text-text-muted mb-16 flex items-center gap-2">
        <Activity size={14} className="text-primary-accent" />
        Trust Maturity Roadmap
      </h3>

      <div className="relative flex items-center justify-between w-full h-40 mt-8">
        {/* Background Track */}
        <div className="absolute left-0 right-0 h-[2px] bg-white/5 top-8 -translate-y-1/2" />

        {/* Ambient Glow Traversal */}
        <motion.div 
          animate={{ left: ["-10%", "110%"], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 3, ease: "linear", repeat: Infinity, repeatDelay: 12 }}
          className="absolute h-[2px] w-32 bg-gradient-to-r from-transparent via-primary-accent to-transparent top-8 -translate-y-1/2 z-0 shadow-[0_0_20px_rgba(0,245,122,0.8)]"
        />

        {/* Nodes */}
        {trustCenter.roadmap.map((node, i) => {
          const isHovered = hoveredNode === node.id;
          
          return (
            <div 
              key={node.id} 
              className="relative z-10 flex flex-col items-center flex-1"
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Connector Lines to Center */}
              {i < trustCenter.roadmap.length - 1 && (
                <div className="absolute left-1/2 right-[-50%] h-[2px] top-8 -translate-y-1/2 z-0 bg-transparent group-hover:bg-primary-accent/30 transition-colors" />
              )}

              {/* Node Marker */}
              <motion.div 
                className={cn(
                  "flex items-center justify-center transition-all duration-300 cursor-pointer relative z-10",
                  isHovered ? "scale-125" : "hover:scale-110"
                )}
              >
                <NeuralOrb size="sm" color={isHovered ? "green" : "white"} state={isHovered ? "completed" : "idle"} pulse={false}>
                  {node.id === "foundation" && <Lock size={10} className={isHovered ? "text-primary-accent" : "text-white/60"} />}
                  {node.id === "enterprise" && <ShieldCheck size={10} className={isHovered ? "text-primary-accent" : "text-white/60"} />}
                  {node.id === "healthcare" && <Activity size={10} className={isHovered ? "text-primary-accent" : "text-white/60"} />}
                  {node.id === "government" && <Landmark size={10} className={isHovered ? "text-primary-accent" : "text-white/60"} />}
                </NeuralOrb>
              </motion.div>

              {/* Static Label */}
              <div className="absolute top-14 w-max text-center transition-opacity duration-300" style={{ opacity: isHovered ? 0 : 1 }}>
                <span className="block text-[10px] font-mono text-text-muted uppercase mb-1">{node.stage}</span>
                <span className="block text-sm font-space font-bold text-white/80">{node.standard}</span>
              </div>

              {/* Hover Expanded Card */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-14 w-72 p-5 rounded-xl bg-surface-elevated/95 border border-primary-accent/40 shadow-2xl backdrop-blur-xl z-50 flex flex-col pointer-events-none"
                  >
                    <span className="text-[10px] font-mono text-primary-accent uppercase mb-1">{node.stage}</span>
                    <span className="text-base font-space font-bold text-white mb-3">{node.standard}</span>
                    
                    <div className="mb-3">
                      <span className="text-[10px] font-mono text-text-muted uppercase block mb-1">Focus</span>
                      <p className="text-xs text-text-secondary font-inter leading-relaxed">
                        {node.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/10">
                      <span className="text-[10px] font-mono text-text-muted uppercase block mb-1">Business Impact</span>
                      <p className="text-xs text-white/90 font-inter italic">
                        {node.impact}
                      </p>
                    </div>
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
          <h4 className="text-[10px] font-mono tracking-widest uppercase text-text-muted flex items-center gap-2 mb-2">
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
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-accent/5 rounded-full blur-[120px] mix-blend-screen" />
        
        {/* Topology / Blueprint grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '200px 200px' }} />
        
        {/* Ambient drift */}
        <motion.div 
          className="absolute inset-0 opacity-[0.04]"
          animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />
      </div>

      <div className="container-wide relative z-10">
        
        {/* Header & Executive Scorecard */}
        <div className="relative mb-20 flex flex-col lg:flex-row justify-between items-start">
          <div className="max-w-2xl relative z-10">
            <h2 className="text-[10px] font-mono tracking-widest uppercase text-primary-accent mb-4 flex items-center gap-2">
              <ShieldCheck size={14} /> Enterprise Trust Center
            </h2>
            <h3 className="text-3xl md:text-5xl font-space font-bold text-white tracking-tight leading-tight mb-6">
              Enterprise AI begins with trust.
            </h3>
            <p className="text-lg text-text-secondary font-inter">
              Every engagement begins with secure architecture, responsible AI practices, and governance designed for production.
            </p>
          </div>

          {/* Executive Scorecard top right */}
          <ExecutiveScorecard />
        </div>

        {/* Main Grid Layout - Bento Style */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 mb-8">
          
          {/* Left: Trust Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {trustCenter.pillars.map((pillar, i) => {
              // Custom motion properties based on orb state intent
              const motionProps = pillar.orbState === "breathing-slow" 
                ? { animate: { scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }, transition: { duration: 8, repeat: Infinity } }
                : pillar.orbState === "breathing-slower"
                ? { animate: { scale: [1, 1.02, 1], opacity: [0.7, 0.9, 0.7] }, transition: { duration: 10, repeat: Infinity } }
                : pillar.orbState === "heartbeat"
                ? { animate: { scale: [1, 1.1, 1, 1], opacity: [0.8, 1, 0.8, 0.8] }, transition: { duration: 5, repeat: Infinity, times: [0, 0.1, 0.2, 1] } }
                : { animate: { rotate: 360 }, transition: { duration: 20, repeat: Infinity, ease: "linear" } };

              return (
                <motion.div 
                  key={pillar.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-8 rounded-2xl bg-surface-elevated border border-white/5 hover:border-primary-accent/30 transition-colors group flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <motion.div {...motionProps} className="w-8 h-8 flex items-center justify-center">
                        <NeuralOrb size="sm" color={pillar.status === "Roadmap" ? "amber" : "green"} state={pillar.status === "Roadmap" ? "idle" : "completed"} pulse={false} />
                      </motion.div>
                      <h4 className="text-xl font-space font-bold text-white group-hover:text-primary-accent transition-colors">{pillar.title}</h4>
                    </div>
                  </div>
                  
                  <p className="text-sm text-text-secondary font-inter leading-relaxed mb-6">
                    {pillar.description}
                  </p>

                  <div className="mt-auto">
                    <span className="text-[10px] font-mono uppercase text-text-muted mb-3 block border-b border-white/5 pb-2">Key Controls</span>
                    <ul className="flex flex-col gap-2">
                      {pillar.controls.map((control, j) => (
                        <li key={j} className="flex items-center gap-2 text-xs font-inter text-text-secondary group-hover:text-white/90 transition-colors">
                          <CheckCircle2 size={12} className="text-primary-accent/50" /> {control}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right: Responsible AI Focus Card (Giant) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-10 rounded-2xl bg-gradient-to-b from-[#0a1220] to-[#05080f] border border-cyan-500/30 hover:border-cyan-500/60 transition-colors flex flex-col h-full relative overflow-hidden group cursor-default"
          >
            {/* Ambient Background for AI Card */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-cyan-500/20 transition-colors duration-700" />
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <h4 className="text-sm font-space font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-3">
                <BrainCircuit size={20} /> {trustCenter.aiGovernance.title}
              </h4>
              <motion.div 
                animate={{ scale: [1, 1.1, 1], rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 flex items-center justify-center relative"
              >
                {/* Tiny particles on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 left-1/2 w-1 h-1 bg-cyan-400 rounded-full animate-ping" />
                  <div className="absolute bottom-2 right-1 w-1 h-1 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: "1s" }} />
                </div>
                <NeuralOrb size="md" color="cyan" state="thinking" pulse={true} />
              </motion.div>
            </div>
            
            <p className="text-base text-white/90 font-inter mb-10 relative z-10 leading-relaxed">
              {trustCenter.aiGovernance.description}
            </p>

            <div className="mt-auto relative z-10">
              <span className="text-[10px] font-mono uppercase text-cyan-500/70 mb-4 block border-b border-cyan-500/20 pb-2">Governance Framework</span>
              <ul className="grid grid-cols-1 gap-3">
                {trustCenter.aiGovernance.areas.map((area, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-cyan-100/70 font-inter group-hover:text-white transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

        </div>

        {/* Interactive Pipeline */}
        <div className="p-8 md:p-12 rounded-3xl bg-surface-elevated border border-white/5 mt-12 overflow-hidden relative">
          <TrustMaturityRoadmap />
        </div>

        {/* Readiness Metrics */}
        <ReadinessMetrics />

        {/* Architecture Principles & Documentation / Footer Links */}
        <div className="flex flex-col items-center mt-20 pt-12 border-t border-white/5">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {["Zero Trust", "Privacy by Design", "Responsible AI", "Least Privilege", "Continuous Monitoring", "Enterprise Architecture"].map(principle => (
              <span key={principle} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-text-muted">
                {principle}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            <a href="#" className="flex items-center gap-2 text-sm font-space font-bold text-text-secondary hover:text-white transition-colors group">
              Security Overview <ArrowRight size={14} className="text-text-muted group-hover:text-primary-accent group-hover:translate-x-1 transition-all" />
            </a>
            <a href="#" className="flex items-center gap-2 text-sm font-space font-bold text-text-secondary hover:text-white transition-colors group">
              Responsible AI <ArrowRight size={14} className="text-text-muted group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </a>
            <a href="#" className="flex items-center gap-2 text-sm font-space font-bold text-text-secondary hover:text-white transition-colors group">
              Privacy <ArrowRight size={14} className="text-text-muted group-hover:text-primary-accent group-hover:translate-x-1 transition-all" />
            </a>
            <a href="#" className="flex items-center gap-2 text-sm font-space font-bold text-text-secondary hover:text-white transition-colors group">
              Architecture <ArrowRight size={14} className="text-text-muted group-hover:text-primary-accent group-hover:translate-x-1 transition-all" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
