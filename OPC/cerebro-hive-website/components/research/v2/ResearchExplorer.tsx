"use client";

import React, { useState } from "react";
import { Filter, ChevronDown, Download, FileText, Database, Code2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const personas = ["Executive", "Engineer", "Researcher", "Student", "Partner"];

const papers = [
  {
    title: "Scaling Laws for Enterprise Retrieval-Augmented Generation",
    desc: "An empirical study on the relationship between embedding dimensions, chunk size, and retrieval accuracy across 50 enterprise datasets.",
    authors: "Dr. A. Turing, M. Curie",
    readTime: "25 min",
    difficulty: "Advanced",
    stage: "Published",
    github: true,
    dataset: true,
    demo: false,
    personas: ["Engineer", "Researcher"]
  },
  {
    title: "The ROI of Autonomous Agents in Supply Chain",
    desc: "A case study detailing the deployment of a 40-agent swarm that reduced procurement cycle times by 73% at a Fortune 500 manufacturer.",
    authors: "E. Musk, J. Bezos",
    readTime: "12 min",
    difficulty: "Intermediate",
    stage: "Industry Validation",
    github: false,
    dataset: false,
    demo: true,
    personas: ["Executive", "Partner"]
  },
  {
    title: "Federated Learning for Cross-Border Financial Compliance",
    desc: "How to train predictive risk models across multiple sovereign jurisdictions without transferring PII or violating GDPR.",
    authors: "S. Nakamoto",
    readTime: "18 min",
    difficulty: "Advanced",
    stage: "Open Source",
    github: true,
    dataset: false,
    demo: true,
    personas: ["Engineer", "Executive", "Researcher"]
  }
];

export const ResearchExplorer = () => {
  const [activePersona, setActivePersona] = useState("Engineer");

  const filteredPapers = papers.filter(p => p.personas.includes(activePersona));

  return (
    <section className="py-24 border-b border-white/5 bg-[#0A0D14]">
      <div className="container-wide max-w-6xl">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-space font-bold text-white mb-4">Research Archive</h2>
            <p className="text-text-secondary font-inter">Explore our complete library of publications, technical reports, and case studies.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
            <div className="text-xs font-bold uppercase tracking-widest text-text-muted shrink-0 flex items-center gap-2">
              <Filter size={14} /> I am a:
            </div>
            {personas.map(persona => (
              <button
                key={persona}
                onClick={() => setActivePersona(persona)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 border",
                  activePersona === persona 
                    ? "bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/30" 
                    : "bg-surface border-white/5 text-text-muted hover:text-white"
                )}
              >
                {persona}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredPapers.map((paper, i) => (
            <div key={i} className="bg-surface border border-white/5 rounded-2xl p-6 hover:bg-white/5 hover:border-white/20 transition-all group flex flex-col md:flex-row gap-6 items-start">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2.5 py-1 rounded bg-[#00F57A]/10 text-[#00F57A] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck size={12} /> {paper.stage}
                  </span>
                  <span className="text-xs text-text-muted font-medium px-2 py-0.5 rounded border border-white/10">{paper.difficulty}</span>
                </div>
                <h3 className="text-xl font-space font-bold text-white mb-2 group-hover:text-primary-accent transition-colors">
                  {paper.title}
                </h3>
                <p className="text-sm text-text-secondary mb-4 leading-relaxed max-w-4xl">
                  {paper.desc}
                </p>
                <div className="flex flex-wrap gap-4 text-xs font-medium text-text-muted">
                  <span>Authors: <span className="text-white">{paper.authors}</span></span>
                  <span>Reading Time: <span className="text-white">{paper.readTime}</span></span>
                </div>
              </div>

              <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-primary-accent hover:text-black hover:border-primary-accent transition-colors flex items-center justify-center gap-2">
                  <FileText size={14} /> Read Paper
                </button>
                {paper.github && (
                  <button className="flex-1 md:flex-none px-4 py-2.5 bg-black/50 border border-white/5 rounded-lg text-xs font-bold text-text-secondary hover:text-white transition-colors flex items-center justify-center gap-2">
                    <Code2 size={14} /> Code
                  </button>
                )}
                {paper.dataset && (
                  <button className="flex-1 md:flex-none px-4 py-2.5 bg-black/50 border border-white/5 rounded-lg text-xs font-bold text-text-secondary hover:text-white transition-colors flex items-center justify-center gap-2">
                    <Database size={14} /> Dataset
                  </button>
                )}
              </div>
              
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
