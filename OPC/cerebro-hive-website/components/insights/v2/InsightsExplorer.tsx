"use client";

import React, { useState } from "react";
import { Filter, ChevronDown, Clock, Maximize2, FileText, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const insights = [
  {
    id: 1,
    title: "The Architecture of Agentic ERP Systems",
    category: "Architecture Review",
    date: "July 2026",
    color: "bg-[#00E5FF]",
    content: {
      "30s": "Traditional ERPs require humans to click buttons. Agentic ERPs (like Quantiva) use LLMs to route tasks autonomously. This architectural shift requires moving from SQL relational databases to hybrid vector-graph databases.",
      "5m": "The 5-minute executive brief expands on the cost of migrating legacy systems versus deploying a parallel agentic routing layer...",
      "Full": "The full technical analysis including API schemas, latency benchmarks, and the specific hybrid search algorithms employed by Cerebro AgentOS..."
    }
  },
  {
    id: 2,
    title: "Governance for Autonomous Agents",
    category: "CIO Playbook",
    date: "June 2026",
    color: "bg-[#7B61FF]",
    content: {
      "30s": "You cannot govern autonomous agents with the same policies used for human employees. Deterministic guardrails (code) must replace probabilistic guardrails (prompts) before deploying agents to production.",
      "5m": "The 5-minute executive brief outlines the three layers of deterministic safety required for HIPAA/SOC2 compliance...",
      "Full": "The full playbook detailing exact implementation steps for the Cerebro compliance sidecar pattern..."
    }
  }
];

export const InsightsExplorer = () => {
  const [activeLevel, setActiveLevel] = useState<"30s" | "5m" | "Full">("30s");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-4">Intelligence Archive</h2>
            <p className="text-text-secondary max-w-2xl font-inter">
              Explore our complete library of strategic analysis. Choose your preferred depth of information.
            </p>
          </div>
          <div className="flex bg-surface border border-border rounded-lg p-1">
            {(["30s", "5m", "Full"] as const).map(level => (
              <button
                key={level}
                onClick={() => setActiveLevel(level)}
                className={cn(
                  "px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-colors",
                  activeLevel === level ? "bg-[#00E5FF] text-text-primary" : "text-text-muted hover:text-text-primary"
                )}
              >
                {level === "30s" ? "30 Sec Summary" : level === "5m" ? "5 Min Brief" : "Full Analysis"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {insights.map(insight => (
            <div key={insight.id} className="bg-surface border border-border rounded-2xl p-6 md:p-8 hover:border-border-strong transition-colors">
              
              <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-text-primary", insight.color)}>
                      {insight.category}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-text-muted flex items-center gap-1">
                      <Clock size={12} /> {insight.date}
                    </span>
                  </div>
                  <h3 className="text-2xl font-space font-bold text-text-primary leading-tight">{insight.title}</h3>
                </div>
                
                <div className="shrink-0">
                  <button 
                    onClick={() => setExpandedId(expandedId === insight.id ? null : insight.id)}
                    className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-primary hover:bg-surface-elevated transition-colors"
                  >
                    <ChevronDown size={16} className={cn("transition-transform", expandedId === insight.id ? "rotate-180" : "")} />
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeLevel}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 rounded-xl bg-surface-secondary border border-border"
                >
                  <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-3 flex items-center gap-2">
                    {activeLevel === "30s" ? <Maximize2 size={12} /> : <FileText size={12} />} 
                    {activeLevel === "30s" ? "Executive Summary" : activeLevel === "5m" ? "Executive Brief" : "Full Analysis"}
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {insight.content[activeLevel]}
                  </p>
                  
                  {activeLevel !== "Full" && (
                    <button onClick={() => setActiveLevel(activeLevel === "30s" ? "5m" : "Full")} className="mt-4 text-xs font-bold text-accent-secondary hover:text-text-primary transition-colors flex items-center gap-1">
                      Read {activeLevel === "30s" ? "5 Min Brief" : "Full Analysis"} <ArrowRight size={12} />
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
