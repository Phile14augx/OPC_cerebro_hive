"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Database, Network, BrainCircuit, Bot, Activity, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";

const nodes = [
  { id: "systems", label: "Business Systems", icon: Database, delay: 0 },
  { id: "data", label: "Enterprise Data", icon: Network, delay: 1 },
  { id: "knowledge", label: "Knowledge Layer", icon: BrainCircuit, delay: 2 },
  { id: "agents", label: "AI Agents", icon: Bot, delay: 3 },
  { id: "decisions", label: "Decision Intelligence", icon: Workflow, delay: 4 },
  { id: "outcomes", label: "Business Outcomes", icon: Activity, delay: 5 },
];

export function EnterpriseAIOperatingSystem() {
  const [activeNode, setActiveNode] = useState(0);

  // Auto-cycle nodes
  useEffect(() => {
    const int = setInterval(() => setActiveNode((prev) => (prev + 1) % nodes.length), 3000);
    return () => clearInterval(int);
  }, []);

  return (
    <section className="py-24 border-b border-border bg-background relative overflow-hidden">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] hidden dark:block pointer-events-none" style={{ backgroundSize: '32px 32px' }} />
      
      <div className="container-wide relative z-10">
        
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-[10px] uppercase tracking-widest text-primary-accent font-bold mb-3 block">Conceptual Model</span>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-6">Enterprise AI Operating System</h2>
          <p className="text-text-secondary text-lg">
            We don't build isolated AI features. We architect a unified operating system that turns your enterprise data into autonomous action.
          </p>
        </div>

        {/* Animated Conceptual Map */}
        <div className="max-w-5xl mx-auto relative h-[400px] flex items-center justify-center p-4">
          
          {/* Mobile view - Vertical stack */}
          <div className="flex md:hidden flex-col gap-4 w-full relative">
            {nodes.map((node, i) => {
              const isActive = activeNode === i;
              return (
                <div key={node.id} className="relative flex items-center gap-4 group">
                  <div className="w-0.5 h-full absolute left-6 top-6 bg-border -z-10 group-last:hidden" />
                  <div className={cn(
                    "w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-500",
                    isActive ? "bg-primary-accent text-text-primary border-primary-accent shadow-[0_0_20px_rgba(0,245,122,0.3)]" : "bg-surface border-border text-text-muted"
                  )}>
                    <node.icon size={20} />
                  </div>
                  <span className={cn("font-space font-bold transition-colors duration-300", isActive ? "text-text-primary" : "text-text-muted")}>
                    {node.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Desktop view - Hexagonal / Circular Network */}
          <div className="hidden md:flex relative w-full h-full items-center justify-between">
            {/* Horizontal Connecting Line */}
            <div className="absolute top-1/2 left-12 right-12 h-px bg-border -translate-y-1/2 overflow-hidden">
               <motion.div 
                 className="w-1/3 h-full bg-gradient-to-r from-transparent via-primary-accent to-transparent opacity-50"
                 animate={{ x: ["-100%", "300%"] }}
                 transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
               />
            </div>

            {nodes.map((node, i) => {
              const isActive = activeNode === i;
              const isPast = activeNode > i;
              
              return (
                <div key={node.id} className="relative flex flex-col items-center group cursor-default z-10 w-32" onMouseEnter={() => setActiveNode(i)}>
                  {/* Node */}
                  <motion.div 
                    animate={isActive ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                    className={cn(
                      "w-16 h-16 rounded-2xl border flex items-center justify-center mb-4 transition-all duration-500 relative",
                      isActive 
                        ? "bg-surface-elevated border-primary-accent shadow-[0_0_30px_rgba(0,245,122,0.2)] text-primary-accent" 
                        : isPast
                        ? "bg-surface border-primary-accent/30 text-primary-accent/50"
                        : "bg-background border-border text-text-muted"
                    )}
                  >
                    {isActive && (
                      <motion.div layoutId="pulse" className="absolute inset-0 rounded-2xl border-2 border-primary-accent opacity-50" 
                        animate={{ scale: [1, 1.3], opacity: [0.5, 0] }} 
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                    )}
                    <node.icon size={24} />
                  </motion.div>
                  
                  {/* Label */}
                  <span className={cn(
                    "text-xs font-space font-bold text-center transition-colors duration-300",
                    isActive ? "text-text-primary" : "text-text-muted"
                  )}>
                    {node.label}
                  </span>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
