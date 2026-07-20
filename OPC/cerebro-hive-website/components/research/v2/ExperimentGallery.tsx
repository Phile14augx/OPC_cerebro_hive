"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, Target, Layers, Database, Activity, AlertTriangle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const experiments = [
  {
    id: "exp-012",
    title: "Multi-Agent Debate for Hallucination Mitigation",
    status: "Completed",
    objective: "Determine if a 3-agent debate structure (Generator, Critic, Resolver) reduces hallucinations in highly technical legal contract reviews compared to zero-shot generation.",
    methodology: "A 10,000-document subset of the EDGAR corpus was used. We deployed GPT-4o as the Generator and Claude 3.5 Sonnet as the Critic to avoid inherited model bias.",
    dataset: "EDGAR Legal Corpus (10k docs, 2.5B tokens)",
    evaluation: "Human-in-the-loop expert review on a 5% sample + automated fact-checking against a deterministic graph.",
    results: "Hallucinations reduced by 87.4%. However, latency increased by 3.2x and token cost doubled.",
    limitations: "The cost/latency tradeoff is unacceptable for real-time applications. The approach is only viable for asynchronous, high-stakes background processing."
  }
];

export const ExperimentGallery = () => {
  const [activeExp, setActiveExp] = useState(experiments[0]);

  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent-secondary mb-3 block flex items-center justify-center gap-2">
            <FlaskConical size={14} /> Open Science
          </span>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-4">Experiment Gallery</h2>
          <p className="text-text-secondary max-w-2xl mx-auto font-inter text-center">
            We publish our methodology, results, and limitations. Transparency in applied research builds trust in production systems.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl">
          
          {/* Header */}
          <div className="p-8 border-b border-border bg-surface-elevated flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-accent-secondary font-bold mb-2">Experiment {activeExp.id}</div>
              <h3 className="text-2xl font-space font-bold text-text-primary leading-tight">{activeExp.title}</h3>
            </div>
            <div className="px-4 py-2 bg-surface border border-border rounded-lg text-xs font-bold text-text-primary uppercase tracking-widest shrink-0">
              {activeExp.status}
            </div>
          </div>

          {/* Body */}
          <div className="p-8 grid md:grid-cols-2 gap-8">
            
            <div className="space-y-8">
              <div>
                <h4 className="flex items-center gap-2 text-xs uppercase tracking-widest text-text-muted font-bold mb-3">
                  <Target size={14} /> Objective
                </h4>
                <p className="text-sm text-text-secondary leading-relaxed">{activeExp.objective}</p>
              </div>
              
              <div>
                <h4 className="flex items-center gap-2 text-xs uppercase tracking-widest text-text-muted font-bold mb-3">
                  <Layers size={14} /> Methodology
                </h4>
                <p className="text-sm text-text-secondary leading-relaxed">{activeExp.methodology}</p>
              </div>
              
              <div>
                <h4 className="flex items-center gap-2 text-xs uppercase tracking-widest text-text-muted font-bold mb-3">
                  <Database size={14} /> Dataset
                </h4>
                <div className="p-3 bg-surface-elevated border border-border rounded-lg text-sm text-text-primary font-mono">
                  {activeExp.dataset}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h4 className="flex items-center gap-2 text-xs uppercase tracking-widest text-text-muted font-bold mb-3">
                  <Activity size={14} /> Results & Evaluation
                </h4>
                <div className="p-4 bg-[#00E5FF]/5 border border-[#00E5FF]/20 rounded-xl mb-4">
                  <p className="text-sm text-accent-secondary font-medium leading-relaxed">{activeExp.results}</p>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{activeExp.evaluation}</p>
              </div>
              
              <div>
                <h4 className="flex items-center gap-2 text-xs uppercase tracking-widest text-warning font-bold mb-3">
                  <AlertTriangle size={14} /> Limitations
                </h4>
                <div className="p-4 bg-surface-elevated border border-[#FFB300]/20 border-l-2 border-l-[#FFB300] rounded-r-xl">
                  <p className="text-sm text-text-secondary leading-relaxed">{activeExp.limitations}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Navigation */}
          <div className="p-4 bg-surface-elevated border-t border-border flex justify-between items-center text-sm text-text-muted">
            <button className="hover:text-text-primary transition-colors">Previous Experiment</button>
            <button className="flex items-center gap-2 hover:text-text-primary transition-colors">Next Experiment <ArrowRight size={16} /></button>
          </div>

        </div>

      </div>
    </section>
  );
};
