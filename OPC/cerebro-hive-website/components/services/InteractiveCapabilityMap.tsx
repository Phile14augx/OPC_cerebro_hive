"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, ArrowRight, ShieldCheck, Database, Bot, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type MapNode = {
  id: string;
  label: string;
  icon?: any;
  type: "industry" | "problem" | "service" | "solution" | "layer";
  color?: string;
};

type Scenario = {
  id: string;
  industry: string;
  nodes: MapNode[];
  description: string;
};

const scenarios: Scenario[] = [
  {
    id: "healthcare-claims",
    industry: "Healthcare",
    description: "Automating medical claims processing while ensuring HIPAA compliance and data security.",
    nodes: [
      { id: "h1", label: "Healthcare", type: "industry", color: "#00E5FF" },
      { id: "h2", label: "Claims Automation", type: "problem" },
      { id: "h3", label: "AI Agents", type: "service", icon: Bot, color: "#00F57A" },
      { id: "h4", label: "Knowledge Retrieval", type: "solution", icon: Database },
      { id: "h5", label: "Compliance Layer", type: "layer", icon: ShieldCheck, color: "#FF8A00" }
    ]
  },
  {
    id: "finance-risk",
    industry: "Financial Services",
    description: "Real-time algorithmic risk assessment using distributed data lakes and agentic reasoning.",
    nodes: [
      { id: "f1", label: "Financial Services", type: "industry", color: "#00F57A" },
      { id: "f2", label: "Risk Assessment", type: "problem" },
      { id: "f3", label: "Data Engineering", type: "service", icon: Database, color: "#7B61FF" },
      { id: "f4", label: "Agentic Reasoning", type: "solution", icon: Bot },
      { id: "f5", label: "Audit Trail", type: "layer", icon: ShieldCheck, color: "#00C8FF" }
    ]
  },
  {
    id: "retail-supply",
    industry: "Retail",
    description: "Predicting supply chain disruptions using historical data and generative forecasting models.",
    nodes: [
      { id: "r1", label: "Retail", type: "industry", color: "#FF8A00" },
      { id: "r2", label: "Supply Chain", type: "problem" },
      { id: "r3", label: "Custom AI Dev", type: "service", icon: Network, color: "#FF2ED1" },
      { id: "r4", label: "Demand Forecasting", type: "solution" },
      { id: "r5", label: "Security & IAM", type: "layer", icon: ShieldCheck, color: "#00E5FF" }
    ]
  }
];

export function InteractiveCapabilityMap() {
  const [activeScenarioId, setActiveScenarioId] = useState<string>(scenarios[0].id);

  const activeScenario = scenarios.find(s => s.id === activeScenarioId)!;

  return (
    <section className="section-pad bg-background relative overflow-hidden border-b border-border">
      {/* Background Neural Elements */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      <div className="container-wide relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-6">
            <Network size={14} className="text-primary-accent" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">
              Enterprise AI Capability Map
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-space font-bold text-text-primary mb-6">
            Explore AI Value Chains
          </h2>
          <p className="text-lg text-text-secondary font-inter max-w-2xl mx-auto">
            See how we connect industry challenges to AI capabilities, architecting end-to-end solutions that drive enterprise value.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* Sidebar / Filters */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            <h4 className="text-[11px] font-bold tracking-widest uppercase text-text-muted mb-2">Select Industry Scenario</h4>
            {scenarios.map(scenario => {
              const isActive = scenario.id === activeScenarioId;
              return (
                <button
                  key={scenario.id}
                  onClick={() => setActiveScenarioId(scenario.id)}
                  className={cn(
                    "p-5 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group",
                    isActive 
                      ? "bg-surface-elevated border-primary-accent/50 shadow-md" 
                      : "bg-surface border-border hover:border-text-muted/30"
                  )}
                >
                  {isActive && (
                    <motion.div layoutId="active-scenario-bg" className="absolute inset-0 bg-primary-accent/5 pointer-events-none" />
                  )}
                  <h3 className={cn(
                    "text-sm font-space font-bold mb-2 transition-colors",
                    isActive ? "text-primary-accent" : "text-text-primary"
                  )}>
                    {scenario.industry}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed font-inter">
                    {scenario.description}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Interactive Map Area */}
          <div className="w-full lg:w-2/3 min-h-[400px] bg-surface rounded-2xl border border-border p-8 md:p-12 relative flex items-center justify-center">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeScenario.id}
                initial={{ opacity: 0.4, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="w-full flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 relative z-10"
              >
                
                {/* Connecting Lines (Desktop only) */}
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-border -translate-y-1/2 z-0" />
                <motion.div 
                  className="hidden md:block absolute top-1/2 left-0 h-[2px] bg-primary-accent/50 -translate-y-1/2 z-0"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />

                {activeScenario.nodes.map((node, i) => (
                  <React.Fragment key={node.id}>
                    
                    {/* The Node */}
                    <motion.div
                      initial={{ opacity: 0.4, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.2 }}
                      className="relative z-10 flex flex-col items-center group cursor-default"
                    >
                      <div 
                        className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center border bg-background shadow-sm transition-transform duration-300 group-hover:-translate-y-2",
                          node.type === "layer" ? "rounded-full" : ""
                        )}
                        style={{ borderColor: node.color || 'var(--border)' }}
                      >
                        {node.icon ? (
                          <node.icon size={24} style={{ color: node.color || 'var(--text-secondary)' }} />
                        ) : (
                          <span className="text-xs font-bold text-text-primary uppercase">{i + 1}</span>
                        )}
                      </div>
                      
                      <div className="mt-4 text-center w-24">
                        <span className="block text-[9px] uppercase tracking-widest font-bold text-text-muted mb-1">
                          {node.type}
                        </span>
                        <span className="text-xs font-medium text-text-primary leading-tight">
                          {node.label}
                        </span>
                      </div>
                    </motion.div>

                    {/* Mobile arrow (hidden on md+) */}
                    {i < activeScenario.nodes.length - 1 && (
                      <div className="md:hidden py-2 text-border">
                        <ArrowRight size={20} />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </motion.div>
            </AnimatePresence>

          </div>
        </div>
      </div>
    </section>
  );
}
