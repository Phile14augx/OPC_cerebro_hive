"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Shield, Lock, Activity, Hexagon, CheckCircle, Scale, ArrowRight, Server, GitMerge, FileCheck } from "lucide-react";
import { trustCenter } from "@/lib/content/company/trustCenter";
import { cn } from "@/lib/utils";

// ============================================================================
// HELPER FUNCTIONS FOR SEMANTIC STYLING
// ============================================================================
const getIcon = (iconStr: string) => {
  switch (iconStr) {
    case "shield": return Shield;
    case "lock": return Lock;
    case "scale": return Scale;
    case "check-circle": return CheckCircle;
    case "activity": return Activity;
    case "hexagon": return Hexagon;
    default: return ShieldCheck;
  }
};

const getColorClasses = (color: string) => {
  switch (color) {
    case "emerald": return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 group-hover:border-emerald-500/60";
    case "blue": return "text-blue-400 border-blue-500/30 bg-blue-500/10 group-hover:border-blue-500/60";
    case "purple": return "text-purple-400 border-purple-500/30 bg-purple-500/10 group-hover:border-purple-500/60";
    case "gold": return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10 group-hover:border-yellow-500/60";
    case "cyan": return "text-cyan-400 border-cyan-500/30 bg-cyan-500/10 group-hover:border-cyan-500/60";
    case "orange": return "text-orange-400 border-orange-500/30 bg-orange-500/10 group-hover:border-orange-500/60 shadow-[0_0_30px_rgba(249,115,22,0.15)]";
    default: return "text-text-primary border-border bg-surface-elevated";
  }
};

const getTextColorClass = (color: string) => {
  switch (color) {
    case "emerald": return "text-emerald-400";
    case "blue": return "text-blue-400";
    case "purple": return "text-purple-400";
    case "gold": return "text-yellow-400";
    case "cyan": return "text-cyan-400";
    case "orange": return "text-orange-400";
    default: return "text-text-primary";
  }
};

const getGlowClass = (color: string) => {
  switch (color) {
    case "emerald": return "group-hover:shadow-[0_0_20px_rgba(52,211,153,0.1)]";
    case "blue": return "group-hover:shadow-[0_0_20px_rgba(96,165,250,0.1)]";
    case "purple": return "group-hover:shadow-[0_0_20px_rgba(192,132,252,0.1)]";
    case "gold": return "group-hover:shadow-[0_0_20px_rgba(250,204,21,0.1)]";
    case "cyan": return "group-hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]";
    case "orange": return "";
    default: return "";
  }
};

// ============================================================================
// EXECUTIVE SCORECARD
// ============================================================================
const ExecutiveScorecard = () => {
  const { trustScore, lastAudit, compliance, status } = trustCenter.executiveScorecard;
  return (
    <div className="w-full lg:w-72 flex flex-col gap-4 p-6 rounded-2xl bg-surface-elevated/80 border border-border backdrop-blur-xl z-30 shadow-2xl">
      <h4 className="text-[10px] font-mono tracking-widest uppercase text-text-muted border-b border-border pb-3">
        Executive Overview
      </h4>
      <div className="flex justify-between items-end">
        <div>
          <span className="text-xs text-text-secondary font-inter block mb-1">Trust Score</span>
          <span className="text-4xl font-space font-bold text-text-primary leading-none">{trustScore.value}</span>
        </div>
        <span className="text-xs font-mono text-primary-accent bg-primary-accent/10 px-2 py-1 rounded-md">
          {trustScore.trend}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mt-2">
        <div className="bg-surface rounded-lg p-3">
          <span className="text-[10px] text-text-muted font-mono uppercase block mb-1">Compliance</span>
          <span className="text-sm font-space font-bold text-text-primary">{compliance}</span>
        </div>
        <div className="bg-surface rounded-lg p-3">
          <span className="text-[10px] text-text-muted font-mono uppercase block mb-1">Last Audit</span>
          <span className="text-sm font-space font-bold text-text-primary">{lastAudit}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-2 pt-4 border-t border-border">
        <div className="w-2 h-2 rounded-full bg-primary-accent animate-pulse shadow-[0_0_8px_rgba(0,245,122,0.8)]" />
        <span className="text-xs font-mono uppercase tracking-wider text-primary-accent">Status: {status}</span>
      </div>
    </div>
  );
};

// ============================================================================
// CAPABILITY NETWORK (HUB AND SPOKE)
// ============================================================================
const CapabilityNetwork = () => {
  const architecture = trustCenter.capabilities.find(c => c.id === "architecture");
  const spokes = trustCenter.capabilities.filter(c => c.id !== "architecture");
  
  const getCoordinates = (i: number) => {
    switch (i) {
      case 0: return "M 15% 20% L 50% 50%"; // Top Left
      case 1: return "M 50% 15% L 50% 50%"; // Top Center
      case 2: return "M 85% 20% L 50% 50%"; // Top Right
      case 3: return "M 30% 85% L 50% 50%"; // Bottom Left
      case 4: return "M 70% 85% L 50% 50%"; // Bottom Right
      default: return "";
    }
  };

  const positions = [
    "lg:top-[20%] lg:left-[15%] lg:-translate-x-1/2 lg:-translate-y-1/2",
    "lg:top-[15%] lg:left-[50%] lg:-translate-x-1/2 lg:-translate-y-1/2",
    "lg:top-[20%] lg:left-[85%] lg:-translate-x-1/2 lg:-translate-y-1/2",
    "lg:top-[85%] lg:left-[30%] lg:-translate-x-1/2 lg:-translate-y-1/2",
    "lg:top-[85%] lg:left-[70%] lg:-translate-x-1/2 lg:-translate-y-1/2",
  ];

  return (
    <div className="relative w-full max-w-[1200px] mx-auto py-12 lg:py-0 lg:h-[900px] lg:mt-24">
      
      {/* Desktop Hub and Spoke SVG Lines (The Trust Core Animation) */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none z-0">
        <svg className="w-full h-full" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.05))" }}>
          {spokes.map((_, i) => (
            <g key={i}>
              {/* Static faint path */}
              <motion.path 
                d={getCoordinates(i)} 
                stroke="rgba(255,255,255,0.05)" 
                strokeWidth="2" 
                strokeDasharray="4 4" 
                initial={{ pathLength: 0 }} 
                whileInView={{ pathLength: 1 }} 
                viewport={{ once: true }} 
                transition={{ duration: 1.5, delay: i * 0.2 }} 
              />
              {/* Animated glowing pulse flowing into architecture */}
              <motion.path 
                d={getCoordinates(i)} 
                stroke="rgba(249,115,22,0.6)" 
                strokeWidth="2" 
                initial={{ pathLength: 0, opacity: 0.4 }} 
                whileInView={{ pathLength: [0, 1], opacity: [0, 1, 0] }} 
                viewport={{ once: true }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }} 
              />
            </g>
          ))}
        </svg>
      </div>

      <div className="relative z-10 flex flex-col lg:static items-center justify-center gap-6 lg:gap-0 w-full h-full">
        
        {/* Architecture Center (Hub) */}
        {architecture && (
          <motion.div 
            className={cn("lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 w-full lg:w-80 p-8 rounded-3xl bg-surface-elevated/90 border backdrop-blur-xl flex flex-col items-center text-center z-20 transition-all", getColorClasses(architecture.color))}
            initial={{ scale: 0.9, opacity: 0.4 }} 
            whileInView={{ scale: 1, opacity: 1 }} 
            viewport={{ once: true }}
          >
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-4", getColorClasses(architecture.color))}>
              {React.createElement(getIcon(architecture.icon), { size: 28 })}
            </div>
            <h3 className="text-2xl font-space font-bold text-text-primary mb-2">{architecture.title}</h3>
            <span className="text-[10px] font-mono uppercase text-orange-400 mb-4">{architecture.subtitle}</span>
            <p className="text-sm text-text-secondary font-inter leading-relaxed">{architecture.description}</p>
            <div className="mt-6 pt-6 border-t border-border w-full flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">{architecture.metrics}</span>
            </div>
          </motion.div>
        )}

        {/* Spokes (Cards) */}
        {spokes.map((spoke, i) => {
          const Icon = getIcon(spoke.icon);
          
          return (
            <motion.div 
              key={spoke.id}
              className={cn(
                "w-full lg:w-72 p-6 rounded-2xl bg-surface-elevated/60 border border-border backdrop-blur-md transition-all group hover:bg-surface-elevated hover:scale-105 cursor-default z-10 lg:absolute",
                positions[i],
                getGlowClass(spoke.color)
              )}
              initial={{ opacity: 0.4, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors", getColorClasses(spoke.color))}>
                  <Icon size={18} />
                </div>
                <div>
                  <h4 className="text-base font-space font-bold text-text-primary group-hover:text-text-primary transition-colors leading-tight mb-1">{spoke.title}</h4>
                  <span className={cn("text-[10px] font-mono uppercase", getTextColorClass(spoke.color))}>{spoke.subtitle}</span>
                </div>
              </div>
              
              <p className="text-xs text-text-secondary font-inter mb-5 line-clamp-2 leading-relaxed">{spoke.description}</p>
              
              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-mono text-text-muted uppercase">Key Controls</span>
                  <span className={cn("text-[10px] font-mono font-bold", getTextColorClass(spoke.color))}>{spoke.metrics}</span>
                </div>
                <ul className="flex flex-col gap-2">
                  {spoke.controls.map((control, j) => (
                    <li key={j} className="flex items-center gap-2 text-[11px] font-inter text-text-secondary group-hover:text-text-secondary transition-colors">
                      <CheckCircle size={10} className={cn("shrink-0", getTextColorClass(spoke.color))} style={{ opacity: 0.6 }} /> {control}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}

      </div>
    </div>
  );
};

// ============================================================================
// DEPLOYMENT PIPELINE
// ============================================================================
const DeploymentPipeline = () => {
  return (
    <div className="w-full max-w-6xl mx-auto py-16">
      <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted mb-16 text-center border-b border-border pb-4">
        Enterprise Lifecycle Pipeline
      </h3>
      
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
        {/* Background Track */}
        <div className="hidden md:block absolute top-6 left-[8%] right-[8%] h-[2px] bg-surface z-0" />
        
        {/* Active Pulse Traversal */}
        <motion.div 
          className="hidden md:block absolute top-6 h-[2px] bg-gradient-to-r from-transparent via-primary-accent to-transparent z-0 shadow-[0_0_15px_rgba(0,245,122,0.5)] w-32"
          animate={{ left: ["-10%", "110%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />

        {trustCenter.pipeline.map((step, i) => (
          <motion.div 
            key={step.id} 
            className="relative z-10 flex flex-col items-center gap-4 flex-1 group cursor-default"
            initial={{ opacity: 0.4, y: 10 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }} 
            viewport={{ once: true }}
          >
            {/* Connection Line to Center for Mobile */}
            {i !== trustCenter.pipeline.length - 1 && (
              <div className="md:hidden absolute top-[48px] bottom-[-32px] w-[2px] bg-surface z-0" />
            )}

            {/* Node */}
            <div className="w-12 h-12 rounded-full bg-surface-elevated border border-border flex items-center justify-center group-hover:border-primary-accent/50 group-hover:shadow-[0_0_20px_rgba(0,245,122,0.15)] transition-all z-10 relative">
              <span className="text-[10px] font-mono text-text-muted group-hover:text-primary-accent transition-colors">
                0{i + 1}
              </span>
            </div>
            
            {/* Label */}
            <div className="text-center">
              <span className="block text-sm font-space font-bold text-text-primary group-hover:text-primary-accent transition-colors">{step.label}</span>
              <span className="block text-[10px] font-mono uppercase text-text-muted mt-1">{step.description}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN TRUST CENTER COMPONENT
// ============================================================================
export const EnterpriseTrustCenter = () => {
  return (
    <section id="trust-center" className="section-pad bg-background relative overflow-hidden border-t border-border">
      
      {/* Background - Very Faint Layering */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Subtle moving particles (Dust) */}
        <motion.div 
          className="absolute inset-0 opacity-[0.01]"
          animate={{ x: [0, -20, 0], y: [0, -10, 0] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
        />
        {/* Faint Topology Grid */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        {/* Deep ambient glow from center */}
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <div className="container-wide relative z-10 flex flex-col gap-8 md:gap-16">
        
        {/* HERO SECTION & SCORECARD */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12 pt-8">
          <div className="max-w-2xl">
            <h2 className="text-[12px] font-mono tracking-widest uppercase text-primary-accent mb-6 flex items-center gap-3">
              <ShieldCheck size={16} /> Enterprise Trust Center
            </h2>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-space font-bold text-text-primary tracking-tight leading-[1.1] mb-8">
              Enterprise AI <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-text-primary to-transparent">begins with trust.</span>
            </h3>
            <p className="text-base md:text-lg text-text-secondary font-inter max-w-xl leading-relaxed mb-8">
              A comprehensive operating model where architecture orchestration coordinates security, privacy, and compliance across the entire deployment lifecycle.
            </p>
          </div>
          
          <ExecutiveScorecard />
        </div>

        {/* TRUST CORE (CAPABILITY NETWORK) */}
        <CapabilityNetwork />

        {/* DEPLOYMENT PIPELINE */}
        <div className="mt-8 border-t border-border pt-8">
          <DeploymentPipeline />
        </div>

      </div>
    </section>
  );
};
