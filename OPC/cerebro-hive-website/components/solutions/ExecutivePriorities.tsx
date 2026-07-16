"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Crosshair, ArrowRight, BrainCircuit, Bot, BookOpen, Database } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const priorities = [
  {
    id: "revenue",
    title: "Grow Revenue",
    icon: TrendingUp,
    desc: "Deploy AI to accelerate sales, optimize pricing, and unlock new business models.",
    solutions: [
      { name: "AI Sales Copilots", slug: "ai-agents", impact: "25% Higher Win Rates", icon: Bot },
      { name: "Predictive Analytics", slug: "predictive-analytics", impact: "92% Forecast Accuracy", icon: TrendingUp },
      { name: "Customer Experience AI", slug: "customer-experience", impact: "40% LTV Increase", icon: BrainCircuit },
    ]
  },
  {
    id: "costs",
    title: "Reduce Costs",
    icon: TrendingDown,
    desc: "Automate complex workflows and eliminate manual overhead across operations.",
    solutions: [
      { name: "Hyperautomation", slug: "hyperautomation", impact: "10x Faster Execution", icon: Bot },
      { name: "Document AI", slug: "document-ai", impact: "90% Processing Automation", icon: Database },
      { name: "ERP Modernization", slug: "erp-modernization", impact: "30% OpEx Reduction", icon: BrainCircuit },
    ]
  },
  {
    id: "decisions",
    title: "Improve Decisions",
    icon: Crosshair,
    desc: "Turn fragmented enterprise data into predictive, executive-ready insights.",
    solutions: [
      { name: "Decision Intelligence", slug: "decision-intelligence", impact: "Real-time Insights", icon: BrainCircuit },
      { name: "Knowledge Management", slug: "knowledge-management", impact: "60% Faster Access", icon: BookOpen },
      { name: "Enterprise AI Platform", slug: "enterprise-ai", impact: "Unified Data Layer", icon: Database },
    ]
  }
];

export function ExecutivePriorities() {
  const [activeTab, setActiveTab] = useState(priorities[0].id);

  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-widest text-primary-accent font-bold mb-3 block">Outcome-Driven Selection</span>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-6">Organized Around Your Priorities</h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            We don't start with technologies. We start with the business outcomes you need to achieve this quarter.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Tabs */}
          <div className="flex flex-col md:flex-row gap-4 mb-12">
            {priorities.map(p => (
              <button
                key={p.id}
                onClick={() => setActiveTab(p.id)}
                className={cn(
                  "flex-1 flex flex-col items-center p-6 rounded-2xl border transition-all duration-300 text-center",
                  activeTab === p.id 
                    ? "bg-surface-elevated border-primary-accent shadow-elevated"
                    : "bg-surface border-border hover:border-primary-accent/50"
                )}
              >
                <div className={cn("p-3 rounded-xl mb-4 transition-colors", activeTab === p.id ? "bg-primary-accent/10 text-primary-accent" : "bg-background text-text-muted")}>
                  <p.icon size={24} />
                </div>
                <h3 className="text-xl font-space font-bold text-text-primary mb-2">{p.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{p.desc}</p>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-surface-elevated border border-border rounded-2xl p-8 min-h-[300px]">
            <AnimatePresence mode="wait">
              {priorities.map((p) => p.id === activeTab && (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className="text-sm font-space font-bold uppercase tracking-widest text-text-muted mb-6">Recommended Solutions for: {p.title}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {p.solutions.map((sol, i) => (
                      <Link href={`/solutions/${sol.slug}`} key={i} className="group block p-6 rounded-xl border border-border bg-background hover:border-primary-accent/50 hover:bg-surface transition-all shadow-sm">
                        <sol.icon size={20} className="text-text-muted group-hover:text-primary-accent mb-4 transition-colors" />
                        <h5 className="font-space font-bold text-text-primary mb-2 text-sm">{sol.name}</h5>
                        <div className="flex items-center justify-between mt-6">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent">{sol.impact}</span>
                          <ArrowRight size={14} className="text-text-muted group-hover:text-text-primary transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
}
