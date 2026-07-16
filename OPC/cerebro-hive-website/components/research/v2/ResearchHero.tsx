"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, BookOpen, FlaskConical, Code2, Network, ArrowRight } from "lucide-react";
import { cn, withBasePath } from "@/lib/utils";

const graphNodes = [
  { id: "reasoning", label: "Reasoning", x: 20, y: 30, color: "text-accent-secondary", border: "border-[#00E5FF]/30", glow: "shadow-[0_0_15px_#00E5FF]" },
  { id: "agents", label: "Agents", x: 70, y: 15, color: "text-accent-primary", border: "border-accent-primary/30", glow: "shadow-[0_0_15px_#00F57A]" },
  { id: "memory", label: "Memory", x: 85, y: 60, color: "text-warning", border: "border-[#FFB300]/30", glow: "shadow-[0_0_15px_#FFB300]" },
  { id: "planning", label: "Planning", x: 40, y: 75, color: "text-primary-accent", border: "border-primary-accent/30", glow: "shadow-[0_0_15px_rgba(0,245,122,0.5)]" },
  { id: "enterprise", label: "Enterprise AI", x: 50, y: 45, color: "text-text-primary", border: "border-border", glow: "shadow-[0_0_20px_rgba(255,255,255,0.5)]", scale: 1.2 },
  { id: "automation", label: "Automation", x: 10, y: 70, color: "text-accent-secondary", border: "border-[#00E5FF]/30", glow: "" },
  { id: "evaluation", label: "Evaluation", x: 75, y: 85, color: "text-accent-primary", border: "border-accent-primary/30", glow: "" },
];

const connections = [
  [0, 4], [1, 4], [2, 4], [3, 4], // Everything connects to Enterprise AI
  [0, 1], [1, 2], [2, 3], [3, 0], // Outer ring
  [5, 3], [6, 2], [5, 0], [6, 4]  // Peripheral connections
];

export const ResearchHero = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <section className="min-h-[90vh] bg-background" />;

  return (
    <section className="relative min-h-[90vh] pt-32 pb-20 border-b border-border bg-background overflow-hidden flex flex-col justify-center">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-[#00E5FF]/5 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-primary-accent/5 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute inset-0 opacity-[0.02] mix-blend-screen" style={{ backgroundImage: `url('${withBasePath('/images/noise.png')}')` }} />
        {/* Subtle Grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
      </div>

      <div className="container-wide relative z-10 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column: Messaging */}
        <div className="flex flex-col items-start text-left">
          
          <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 backdrop-blur-sm">
            <FlaskConical size={14} className="text-accent-secondary" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">CerebroHive Research Institute</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-space font-bold text-text-primary tracking-tight leading-[1.1] mb-6">
            Advancing <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-text-secondary to-text-muted">Enterprise Intelligence</span> <br/>
            Through Applied Research.
          </h1>

          <p className="text-lg text-text-secondary font-inter leading-[1.8] mb-10 max-w-[50ch]">
            We don't just study AI—we operationalize it. Our research focuses on translating cutting-edge developments in agentic workflows, reasoning, and intelligent architecture into production-ready enterprise systems.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button className="group px-8 py-4 bg-surface text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg flex items-center justify-center gap-3 transition-all hover:bg-primary-accent shadow-lg">
              Explore Research
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button className="px-8 py-4 bg-transparent border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg hover:border-border-default hover:bg-surface transition-all flex items-center justify-center gap-2">
              <Code2 size={16} /> Developer Portal
            </button>
          </div>
          
        </div>

        {/* Right Column: Animated Knowledge Graph */}
        <div className="relative w-full aspect-square lg:aspect-[4/3] flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.2))' }}>
              {connections.map(([start, end], i) => {
                const n1 = graphNodes[start];
                const n2 = graphNodes[end];
                return (
                  <motion.line
                    key={i}
                    x1={`${n1.x}%`} y1={`${n1.y}%`}
                    x2={`${n2.x}%`} y2={`${n2.y}%`}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2, delay: i * 0.1, ease: "easeInOut" }}
                  />
                );
              })}
              
              {/* Animated Data Packets flowing along connections */}
              {connections.map(([start, end], i) => {
                const n1 = graphNodes[start];
                const n2 = graphNodes[end];
                return (
                  <motion.circle
                    key={`packet-${i}`}
                    r="2"
                    fill="#00E5FF"
                    initial={{ cx: `${n1.x}%`, cy: `${n1.y}%`, opacity: 0 }}
                    animate={{ 
                      cx: [`${n1.x}%`, `${n2.x}%`], 
                      cy: [`${n1.y}%`, `${n2.y}%`],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ 
                      duration: 2 + Math.random() * 2, 
                      repeat: Infinity, 
                      delay: Math.random() * 2,
                      ease: "linear"
                    }}
                  />
                );
              })}
            </svg>

            {graphNodes.map((node, i) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: node.scale || 1 }}
                transition={{ duration: 0.5, delay: 1 + (i * 0.1), type: "spring" }}
                className="absolute flex flex-col items-center justify-center group"
                style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center bg-surface border backdrop-blur-md transition-all duration-300",
                  node.border, node.color,
                  "group-hover:scale-125 group-hover:bg-surface",
                  node.glow
                )}>
                  <Network size={16} />
                </div>
                <div className="absolute top-full mt-2 whitespace-nowrap text-[10px] uppercase tracking-widest font-bold text-text-muted group-hover:text-text-primary transition-colors bg-surface-secondary px-2 py-0.5 rounded border border-border">
                  {node.label}
                </div>
              </motion.div>
            ))}

          </div>
        </div>

      </div>
    </section>
  );
};
