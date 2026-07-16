"use client";

import React from "react";
import { Network, Database, BrainCircuit, Bot, Building2, ArrowDown } from "lucide-react";

const landscape = [
  {
    layer: "Foundation Models",
    icon: Database,
    desc: "Commoditized intelligence. Organizations should avoid building custom models from scratch.",
    players: ["OpenAI", "Anthropic", "Google", "Meta"],
    action: "Procure via API or host open-source."
  },
  {
    layer: "Enterprise Reasoning & Memory",
    icon: BrainCircuit,
    desc: "The critical differentiator. Where raw models are grounded in private enterprise context.",
    players: ["CerebroHive RAG", "Vector Databases", "Knowledge Graphs"],
    action: "Build or buy specialized infrastructure."
  },
  {
    layer: "Agent Orchestration",
    icon: Bot,
    desc: "Systems that plan, execute, and evaluate multi-step workflows automatically.",
    players: ["Cerebro AgentOS", "LangChain", "AutoGPT"],
    action: "Standardize on a single orchestration framework."
  },
  {
    layer: "Business Applications",
    icon: Building2,
    desc: "End-user tools where ROI is realized. Must be seamlessly integrated into existing workflows.",
    players: ["Quantiva ERP", "Salesforce", "Custom Internal Apps"],
    action: "Deploy agentic workflows to augment knowledge workers."
  }
];

export const TechnologyLandscape = () => {
  return (
    <section className="py-24 border-b border-white/5 bg-[#0A0D14]">
      <div className="container-wide max-w-5xl">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-space font-bold text-white mb-4">Enterprise AI Landscape</h2>
          <p className="text-text-secondary max-w-2xl mx-auto font-inter">
            How enterprise technologies map onto the broader AI ecosystem.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {landscape.map((layer, i) => (
            <React.Fragment key={i}>
              <div className="bg-surface border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center hover:border-white/30 transition-colors">
                
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <layer.icon size={24} className="text-[#00E5FF]" />
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-space font-bold text-white mb-2">{layer.layer}</h3>
                  <p className="text-sm text-text-secondary">{layer.desc}</p>
                </div>

                <div className="flex flex-col gap-2 w-full md:w-64">
                  <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold text-center md:text-left">Key Technologies</div>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {layer.players.map((player, j) => (
                      <span key={j} className="px-2 py-1 rounded bg-black/50 border border-white/5 text-[10px] font-bold text-white">
                        {player}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="w-full md:w-48 p-3 rounded-lg bg-[#00F57A]/10 border border-[#00F57A]/20 text-center md:text-left">
                  <div className="text-[10px] uppercase tracking-widest text-[#00F57A] font-bold mb-1">CIO Action</div>
                  <div className="text-xs text-white leading-tight">{layer.action}</div>
                </div>

              </div>
              
              {i < landscape.length - 1 && (
                <div className="flex justify-center -my-2 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-[#0A0D14] border border-white/10 flex items-center justify-center">
                    <ArrowDown size={14} className="text-text-muted" />
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

      </div>
    </section>
  );
};
