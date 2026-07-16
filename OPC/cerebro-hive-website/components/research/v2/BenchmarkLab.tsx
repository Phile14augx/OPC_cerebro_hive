"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, Database, FileText, Bot, Scale, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

const tasks = [
  { id: "doc", label: "Document Intelligence", icon: FileText, desc: "Extracting entities from 100-page unstructured PDFs." },
  { id: "rag", label: "Agentic RAG", icon: Database, desc: "Multi-hop reasoning over hybrid structured/unstructured data." },
  { id: "planning", label: "Agent Planning", icon: Bot, desc: "Autonomous execution of multi-step ERP workflows." },
  { id: "compliance", label: "Compliance Auditing", icon: ShieldCheck, desc: "Identifying regulatory deviations in complex MSAs." }
];

const models = [
  { name: "Cerebro-Enterprise-v2", color: "bg-[#00E5FF]", border: "border-[#00E5FF]", text: "text-accent-secondary", scores: { doc: 98, rag: 96, planning: 95, compliance: 99 } },
  { name: "GPT-4o (Baseline)", color: "bg-surface-elevated", border: "border-border", text: "text-text-muted", scores: { doc: 94, rag: 88, planning: 82, compliance: 90 } },
  { name: "Claude 3.5 Sonnet", color: "bg-[#FFB300]/50", border: "border-[#FFB300]/50", text: "text-warning", scores: { doc: 96, rag: 91, planning: 89, compliance: 93 } }
];

export const BenchmarkLab = () => {
  const [activeTask, setActiveTask] = useState(tasks[0].id);

  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent-secondary mb-3 block flex items-center justify-center gap-2">
            <Activity size={14} /> Evaluation Lab
          </span>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-4">Enterprise Task Benchmarks</h2>
          <p className="text-text-secondary max-w-2xl mx-auto font-inter">
            Generic LLM benchmarks (MMLU, HumanEval) don't reflect real business workflows. We evaluate models on actual enterprise tasks.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
          
          {/* Left: Task Selector */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <div className="text-xs uppercase tracking-widest text-text-muted font-bold mb-2">Select Benchmark</div>
            {tasks.map(task => {
              const isActive = activeTask === task.id;
              return (
                <button
                  key={task.id}
                  onClick={() => setActiveTask(task.id)}
                  className={cn(
                    "p-4 rounded-xl border flex flex-col items-start text-left transition-all",
                    isActive 
                      ? "bg-[#00E5FF]/10 border-[#00E5FF]/50 shadow-[0_0_15px_rgba(0,229,255,0.1)]" 
                      : "bg-surface border-border hover:border-border-strong"
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <task.icon size={16} className={isActive ? "text-accent-secondary" : "text-text-muted"} />
                    <span className={cn("font-space font-bold text-sm", isActive ? "text-text-primary" : "text-text-secondary")}>{task.label}</span>
                  </div>
                  <div className="text-xs text-text-muted leading-relaxed pl-7">{task.desc}</div>
                </button>
              );
            })}
          </div>

          {/* Right: Results Chart */}
          <div className="lg:col-span-8 bg-surface border border-border rounded-2xl p-8 relative overflow-hidden flex flex-col justify-end min-h-[400px]">
            {/* Grid lines */}
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
            
            <div className="relative z-10 w-full h-full flex items-end justify-around gap-4 pb-12 pt-20 border-b border-border">
              
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-12 w-10 flex flex-col justify-between text-[10px] text-text-muted font-mono py-2">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
              </div>

              {/* Grid guide lines */}
              {[100, 75, 50, 25].map((val, i) => (
                <div key={i} className="absolute left-8 right-0 border-t border-border border-dashed" style={{ top: `${(100 - val)}%` }} />
              ))}

              {models.map((model, i) => {
                const score = model.scores[activeTask as keyof typeof model.scores];
                return (
                  <div key={i} className="flex flex-col items-center w-1/4 group z-10 relative h-full justify-end">
                    
                    {/* Tooltip */}
                    <motion.div 
                      key={`${activeTask}-${model.name}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-12 bg-surface-secondary border border-border text-text-primary text-xs font-bold px-3 py-1.5 rounded"
                    >
                      {score}%
                    </motion.div>

                    {/* Bar */}
                    <motion.div 
                      key={`bar-${activeTask}-${model.name}`}
                      className={cn("w-full max-w-[60px] rounded-t-lg border-t border-l border-r relative overflow-hidden", model.color, model.border)}
                      initial={{ height: 0 }}
                      animate={{ height: `${score}%` }}
                      transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                    </motion.div>
                    
                    {/* Label */}
                    <div className="absolute -bottom-8 w-[150%] text-center text-[10px] font-bold uppercase tracking-widest text-text-muted break-words">
                      {model.name}
                    </div>
                  </div>
                );
              })}
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
};
