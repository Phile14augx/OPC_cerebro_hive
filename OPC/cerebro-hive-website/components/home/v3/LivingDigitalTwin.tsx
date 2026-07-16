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
    color: "bg-[#00F57A]"
  }
];

export default function LivingDigitalTwin() {
  const [activeId, setActiveId] = useState(workflows[0].id);
  const activeFlow = workflows.find(w => w.id === activeId)!;

  return (
    <section className="py-24 border-b border-white/5 bg-[#0A0D14]">
      <div className="container-wide">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-[#7B61FF] font-bold mb-6">
            <Zap size={12} /> Living Digital Twin
          </div>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-white mb-6">The Automation Impact</h2>
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
                    ? "bg-surface border-white/20 shadow-lg scale-105" 
                    : "bg-surface/50 border-white/5 hover:border-white/10"
                }`}
              >
                <div className="font-space font-bold text-white mb-2">{wf.label}</div>
                <div className="text-xs text-text-secondary">View transformation →</div>
              </button>
            ))}
          </div>

          {/* Visualization */}
          <div className="lg:col-span-8 bg-surface border border-white/10 rounded-2xl p-8 md:p-12 relative overflow-hidden flex flex-col justify-center min-h-[400px]">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  
                  {/* Before */}
                  <div className="flex-1 w-full bg-black/40 border border-white/5 rounded-xl p-6 relative opacity-70">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-[#0A0D14] border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-text-muted">
                      Before
                    </div>
                    <div className="flex items-center gap-3 mb-4 mt-2">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-muted">
                        <UserX size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{activeFlow.before.role}</div>
                        <div className="text-xs text-text-secondary">{activeFlow.before.task}</div>
                      </div>
                    </div>
                    <div className="text-2xl font-space font-bold text-white mb-1">{activeFlow.before.time}</div>
                    <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Processing Time</div>
                  </div>

                  {/* Transition */}
                  <div className="flex flex-col items-center justify-center gap-2 shrink-0">
                    <div className="h-10 w-px bg-white/20 md:hidden" />
                    <ArrowRight size={24} className="text-[#00E5FF] hidden md:block" />
                    <div className="h-10 w-px bg-white/20 md:hidden" />
                  </div>

                  {/* After */}
                  <div className="flex-1 w-full bg-[#00E5FF]/5 border border-[#00E5FF]/20 rounded-xl p-6 relative shadow-[0_0_30px_rgba(0,229,255,0.1)]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-[#00E5FF] rounded-full text-[10px] font-bold uppercase tracking-widest text-black shadow-lg">
                      After
                    </div>
                    <div className="flex items-center gap-3 mb-4 mt-2">
                      <div className="w-10 h-10 rounded-full bg-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF]">
                        <Bot size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{activeFlow.after.role}</div>
                        <div className="text-xs text-text-secondary">{activeFlow.after.task}</div>
                      </div>
                    </div>
                    <div className="text-2xl font-space font-bold text-[#00E5FF] mb-1">{activeFlow.after.time}</div>
                    <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Processing Time</div>
                  </div>

                </div>

                <div className="mt-10 p-5 rounded-xl bg-white/5 border border-white/10 text-center flex items-center justify-center gap-3">
                  <Target size={16} className="text-[#00F57A]" />
                  <span className="text-sm font-bold text-white uppercase tracking-widest">Business Impact:</span>
                  <span className="text-sm text-[#00F57A]">{activeFlow.impact}</span>
                </div>

              </motion.div>
            </AnimatePresence>

          </div>

        </div>

      </div>
    </section>
  );
}
