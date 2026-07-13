"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { BrainCircuit, Cpu, Database, LayoutTemplate, Network, Search, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

// Nodes in the ecosystem
const nodes = [
  { id: "quantiva", label: "Quantiva ERP", angle: 30, distance: 220, icon: Database },
  { id: "agentos", label: "AgentOS", angle: 90, distance: 260, icon: Cpu },
  { id: "enterprise-ai", label: "Cerebro AI", angle: 150, distance: 220, icon: BrainCircuit },
  { id: "analytics", label: "Cerebro Analytics", angle: 210, distance: 260, icon: Zap },
  { id: "knowledge", label: "Knowledge Hub", angle: 270, distance: 220, icon: Search },
  { id: "automation", label: "Automation Studio", angle: 330, distance: 260, icon: Network },
];

export const HeroEcosystem = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yPos = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Center coordinates (assuming a 800x600 viewBox for SVG)
  const cx = 400;
  const cy = 300;

  return (
    <section 
      ref={containerRef} 
      className="relative w-full min-h-screen flex flex-col items-center justify-center bg-background overflow-hidden perspective-[1000px]"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-accent/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-screen scale-150" style={{ backgroundImage: "url('/images/noise.png')" }} />
      </div>

      <motion.div style={{ y: yPos, opacity }} className="relative z-10 w-full max-w-[1200px] mx-auto px-6 flex flex-col items-center">
        
        <div className="text-center mb-16 space-y-6">
          <span className="text-[10px] uppercase tracking-widest text-primary-accent font-bold px-3 py-1.5 border border-primary-accent/20 rounded-full bg-primary-accent/5 backdrop-blur-sm">
            Enterprise AI Product Ecosystem
          </span>
          <h1 className="text-5xl md:text-7xl font-space font-bold text-text-primary tracking-tight">
            AI-Native Platforms Built for <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-text-secondary to-text-muted">Intelligent Enterprises</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto font-inter">
            From AI-powered ERP to autonomous enterprise agents, discover the proprietary platforms and frameworks transforming modern organizations.
          </p>
          <div className="flex justify-center gap-4 pt-4">
             <button className="px-8 py-3 bg-white text-black font-space font-bold text-sm rounded-full transition-transform hover:scale-105 hover:bg-gray-100">
               Explore Products
             </button>
             <button className="px-8 py-3 bg-surface border border-border text-text-primary font-space font-bold text-sm rounded-full transition-colors hover:bg-surface-elevated backdrop-blur-md">
               Schedule Demo
             </button>
          </div>
        </div>

        {/* The Interactive Ecosystem Visualization */}
        <div className="relative w-full max-w-[800px] aspect-[4/3] mx-auto mt-10">
           
           {/* SVG Lines and Connections */}
           <svg viewBox="0 0 800 600" className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <radialGradient id="lineGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#00F57A" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#00F57A" stopOpacity="0" />
                </radialGradient>
              </defs>

              {nodes.map((node) => {
                const rad = (node.angle * Math.PI) / 180;
                const targetX = cx + Math.cos(rad) * node.distance;
                const targetY = cy + Math.sin(rad) * node.distance;
                const isHovered = hoveredNode === node.id || hoveredNode === "core";
                
                return (
                  <g key={`line-${node.id}`} style={{ transition: 'opacity 0.5s' }} opacity={hoveredNode && !isHovered ? 0.2 : 1}>
                    {/* Base faint line */}
                    <line x1={cx} y1={cy} x2={targetX} y2={targetY} stroke="var(--color-border)" strokeWidth="1" strokeDasharray="4 4" />
                    
                    {/* Hover highlight line */}
                    {isHovered && (
                      <line x1={cx} y1={cy} x2={targetX} y2={targetY} stroke="rgba(0, 245, 122, 0.4)" strokeWidth="2" />
                    )}
                  </g>
                );
              })}
           </svg>

           {/* Floating Packets (Simulated data flow) */}
           {nodes.map((node) => {
             const rad = (node.angle * Math.PI) / 180;
             const endX = cx + Math.cos(rad) * node.distance;
             const endY = cy + Math.sin(rad) * node.distance;
             
             // Convert SVG coordinates back to relative DOM coordinates (percentage based on viewBox)
             const startLeft = "50%";
             const startTop = "50%";
             const endLeft = `${(endX / 800) * 100}%`;
             const endTop = `${(endY / 600) * 100}%`;

             const isHovered = hoveredNode === node.id || hoveredNode === "core";

             return (
               <motion.div
                 key={`packet-${node.id}`}
                 initial={{ left: startLeft, top: startTop, opacity: 0 }}
                 animate={{ left: endLeft, top: endTop, opacity: [0, 1, 1, 0] }}
                 transition={{ duration: 2 + (node.angle % 3), repeat: Infinity, ease: "linear", delay: node.angle % 2 }}
                 className={cn(
                   "absolute w-1.5 h-1.5 rounded-full z-10 -ml-[3px] -mt-[3px] pointer-events-none transition-colors duration-500",
                   isHovered ? "bg-primary-accent shadow-[0_0_10px_#00F57A]" : "bg-white/20"
                 )}
               />
             );
           })}

           {/* The AI Core */}
           <div 
             className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
             onMouseEnter={() => setHoveredNode("core")}
             onMouseLeave={() => setHoveredNode(null)}
           >
             <div className="relative w-32 h-32 flex items-center justify-center">
               <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border border-dashed border-primary-accent/40" />
               <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-6 rounded-full bg-primary-accent blur-xl" />
               
               <div className="relative z-10 w-16 h-16 rounded-full bg-surface-elevated border-2 border-primary-accent flex flex-col items-center justify-center shadow-[0_0_30px_rgba(0,245,122,0.3)] transition-transform hover:scale-110">
                 <LayoutTemplate size={20} className="text-primary-accent mb-1" />
               </div>
               
               <div className="absolute -bottom-8 whitespace-nowrap text-center">
                 <span className="text-[10px] font-space font-bold text-text-primary tracking-widest uppercase">Cerebro Platform</span>
               </div>
             </div>
           </div>

           {/* The Product Nodes */}
           {nodes.map((node) => {
             const rad = (node.angle * Math.PI) / 180;
             const x = cx + Math.cos(rad) * node.distance;
             const y = cy + Math.sin(rad) * node.distance;
             
             const left = `${(x / 800) * 100}%`;
             const top = `${(y / 600) * 100}%`;
             
             const isHovered = hoveredNode === node.id;
             const isDimmed = hoveredNode !== null && !isHovered && hoveredNode !== "core";

             return (
               <motion.div
                 key={`node-${node.id}`}
                 className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
                 style={{ left, top }}
                 animate={{ y: [0, -8, 0] }}
                 transition={{ y: { repeat: Infinity, duration: 4, delay: (node.angle % 5) * 0.5, ease: "easeInOut" } }}
               >
                 <div
                   onMouseEnter={() => setHoveredNode(node.id)}
                   onMouseLeave={() => setHoveredNode(null)}
                   className={cn(
                     "flex flex-col items-center gap-3 cursor-pointer transition-all duration-500 group",
                     isDimmed ? "opacity-30 scale-95" : "opacity-100 scale-100"
                   )}
                 >
                   <div className={cn(
                     "w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-md transition-all duration-300 shadow-xl",
                     isHovered 
                       ? "bg-primary-accent/20 border border-primary-accent text-primary-accent shadow-[0_0_20px_rgba(0,245,122,0.3)] scale-110" 
                       : "bg-surface-elevated/80 border border-border text-text-muted group-hover:border-primary-accent/30 group-hover:text-text-primary"
                   )}>
                     <node.icon size={20} />
                   </div>
                   <span className={cn(
                     "text-[11px] font-space font-bold uppercase tracking-widest whitespace-nowrap transition-colors duration-300",
                     isHovered ? "text-primary-accent" : "text-text-secondary group-hover:text-text-primary"
                   )}>
                     {node.label}
                   </span>
                 </div>
               </motion.div>
             );
           })}
        </div>

      </motion.div>
    </section>
  );
};
