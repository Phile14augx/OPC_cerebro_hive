"use client";

import React from "react";
import { Code2, Star, GitFork, Download, TerminalSquare } from "lucide-react";

const projects = [
  {
    name: "cerebro-rag",
    desc: "The open-source core of our Enterprise RAG pipeline. Includes semantic chunkers, vector hybrid search, and citation grounding.",
    stars: "4.2k",
    forks: "382",
    dl: "12k/mo",
    lang: "Python",
    color: "bg-blue-500"
  },
  {
    name: "agent-eval-framework",
    desc: "A suite for evaluating autonomous agents on multi-step reasoning tasks without human intervention.",
    stars: "1.8k",
    forks: "145",
    dl: "5k/mo",
    lang: "TypeScript",
    color: "bg-[#00E5FF]"
  },
  {
    name: "edgar-corpus-v2",
    desc: "A cleaned, chunked, and vectorized dataset of 5 years of SEC filings, optimized for LLM financial reasoning.",
    stars: "890",
    forks: "92",
    dl: "50k/mo",
    lang: "Jupyter",
    color: "bg-[#FFB300]"
  }
];

export const OpenSourceProjects = () => {
  return (
    <section className="py-24 border-b border-white/5 bg-[#05070A]">
      <div className="container-wide">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-3 block flex items-center gap-2">
              <Code2 size={14} /> Open Source
            </span>
            <h2 className="text-3xl md:text-4xl font-space font-bold text-white mb-4">Building in the Open</h2>
            <p className="text-text-secondary font-inter max-w-2xl">
              We open-source our foundational tooling, datasets, and evaluation frameworks to accelerate the entire AI ecosystem.
            </p>
          </div>
          <button className="px-6 py-3 bg-white/5 border border-white/10 text-white text-sm font-bold rounded-lg hover:bg-white hover:text-black transition-colors flex items-center gap-2">
            View GitHub Organization
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {projects.map((proj, i) => (
            <div key={i} className="bg-surface border border-white/10 rounded-2xl p-6 hover:border-primary-accent/50 transition-colors flex flex-col h-full">
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <TerminalSquare size={20} className="text-text-muted" />
                  <h3 className="text-lg font-space font-bold text-white group-hover:text-primary-accent transition-colors">
                    {proj.name}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-text-secondary mb-6 flex-1 leading-relaxed">
                {proj.desc}
              </p>

              <div className="flex items-center justify-between text-xs text-text-muted border-t border-white/5 pt-4">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${proj.color}`} />
                  {proj.lang}
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 hover:text-[#FFB300] transition-colors cursor-pointer"><Star size={14} /> {proj.stars}</span>
                  <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"><GitFork size={14} /> {proj.forks}</span>
                  <span className="flex items-center gap-1 hover:text-[#00E5FF] transition-colors cursor-pointer"><Download size={14} /> {proj.dl}</span>
                </div>
              </div>
              
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
