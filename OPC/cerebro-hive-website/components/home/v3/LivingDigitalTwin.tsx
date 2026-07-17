"use client";

import React, { useState } from "react";
import { UserX, Bot, ArrowRight, Zap, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const workflows = [
  {
    id: "finance",
    label: "Finance: Invoice Processing",
    before: { role: "Human Analyst", task: "Manual data entry & routing", time: "8 hours" },
    after: { role: "Invoice Agent", task: "Autonomous parsing & ERP validation", time: "15 minutes" },
    impact: "87% faster processing, zero human error.",
    color: "bg-[#00E5FF]"
  },
  {
    id: "hr",
    label: "HR: Employee Onboarding",
    before: { role: "HR Coordinator", task: "Chasing IT tickets & compliance docs", time: "3 days" },
    after: { role: "Onboarding Swarm", task: "Parallel account provisioning & training plan generation", time: "2 hours" },
    impact: "Saves 12 coordinator hours per hire.",
    color: "bg-[#7B61FF]"
  },
  {
    id: "ops",
    label: "Ops: Supply Chain Routing",
    before: { role: "Logistics Manager", task: "Reactive exception handling", time: "24 hours" },
    after: { role: "Routing Agent", task: "Predictive rerouting based on live weather APIs", time: "Instant" },
    impact: "Prevents cascading delays proactively.",
    color: "bg-accent-primary"
  }
];

export default function LivingDigitalTwin() {
  const [activeId, setActiveId] = useState(workflows[0].id);
  const activeFlow = workflows.find(w => w.id === activeId)!;

  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-[10px] uppercase tracking-widest text-[#7B61FF] font-bold mb-6">
            <Zap size={12} /> Living Digital Twin
          </div>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-6">The Automation Impact</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-inter">
            Watch how agentic workflows fundamentally rewire departmental efficiency, shifting humans from operators to overseers.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
          
          {/* Selector */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {workflows.map(wf => (
              <button 
                key={wf.id}
                onClick={() => setActiveId(wf.id)}
                className={`p-6 rounded-2xl border text-left transition-all ${
                  activeId === wf.id 
                    ? "bg-surface border-border shadow-lg scale-105" 
                    : "bg-surface/50 border-border hover:border-border-default"
                }`}
              >
                <div className="font-space font-bold text-text-primary mb-2">{wf.label}</div>
                <div className="text-xs text-text-secondary">View transformation →</div>
              </button>
            ))}
          </div>

          {/* Visualization */}
          <div className="lg:col-span-8 theme-panel p-8 md:p-12 relative overflow-hidden flex flex-col justify-center min-h-[400px]">
            
            {/* Blueprint Grid for Light Mode */}
            <div className="block dark:hidden absolute inset-0 pointer-events-none opacity-[0.03]" 
                 style={{ backgroundImage: 'linear-gradient(to right, #2563EB 1px, transparent 1px), linear-gradient(to bottom, #2563EB 1px, transparent 1px)', backgroundSize: '30px 30px' }} 
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0.4, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  
                  {/* Before */}
                  <div className="flex-1 w-full theme-card bg-surface-secondary opacity-70 p-6 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-surface border border-border rounded-full text-[10px] font-bold uppercase tracking-widest text-text-muted">
                      Before
                    </div>
                    <div className="flex items-center gap-3 mb-4 mt-2">
                      <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center text-text-muted">
                        <UserX size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-text-primary">{activeFlow.before.role}</div>
                        <div className="text-xs text-text-secondary">{activeFlow.before.task}</div>
                      </div>
                    </div>
                    <div className="text-2xl font-space font-bold text-text-primary mb-1">{activeFlow.before.time}</div>
                    <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Processing Time</div>
                  </div>

                  {/* Transition */}
                  <div className="flex flex-col items-center justify-center gap-2 shrink-0">
                    <div className="h-10 w-px bg-surface-elevated md:hidden" />
                    <ArrowRight size={24} className="text-accent-secondary hidden md:block" />
                    <div className="h-10 w-px bg-surface-elevated md:hidden" />
                  </div>

                  {/* After */}
                  <div className="flex-1 w-full theme-card border-accent-secondary/50 p-6 relative shadow-lg dark:shadow-[0_0_30px_rgba(0,229,255,0.1)]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-accent-secondary rounded-full text-[10px] font-bold uppercase tracking-widest text-text-primary shadow-lg">
                      After
                    </div>
                    <div className="flex items-center gap-3 mb-4 mt-2">
                      <div className="w-10 h-10 rounded-full bg-accent-secondary/10 flex items-center justify-center text-accent-secondary">
                        <Bot size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-text-primary">{activeFlow.after.role}</div>
                        <div className="text-xs text-text-secondary">{activeFlow.after.task}</div>
                      </div>
                    </div>
                    <div className="text-2xl font-space font-bold text-accent-secondary mb-1">{activeFlow.after.time}</div>
                    <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Processing Time</div>
                  </div>

                </div>

                <div className="mt-10 p-5 rounded-xl theme-card text-center flex items-center justify-center gap-3 relative z-10">
                  <Target size={16} className="text-accent-primary" />
                  <span className="text-sm font-bold text-text-primary uppercase tracking-widest">Business Impact:</span>
                  <span className="text-sm text-accent-primary">{activeFlow.impact}</span>
                </div>

              </motion.div>
            </AnimatePresence>

          </div>

        </div>

      </div>
    </section>
  );
}
