"use client";

import React from "react";
import { Database, Bot, Zap, ArrowRight, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const products = [
  {
    title: "Knowledge Hub",
    icon: Database,
    desc: "The foundational vector engine. It ingests your legacy databases and documents, transforming them into a semantic graph that agents can read.",
    color: "bg-[#00E5FF]",
    textColor: "text-accent-secondary"
  },
  {
    title: "AgentOS",
    icon: Bot,
    desc: "The orchestration layer. Deploy specialized agents to handle finance, HR, or operations workflows autonomously.",
    color: "bg-[#7B61FF]",
    textColor: "text-[#7B61FF]"
  },
  {
    title: "Quantiva ERP",
    icon: Layers,
    desc: "The first AI-native ERP. Designed from the ground up to be operated by agents rather than human data-entry clerks.",
    color: "bg-accent-primary",
    textColor: "text-accent-primary"
  }
];

export default function IntegratedPlatform() {
  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-border text-[10px] uppercase tracking-widest text-accent-primary font-bold mb-6">
            <Zap size={12} /> The Platform
          </div>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-6">Built to work together.</h2>
          <p className="text-lg text-text-secondary max-w-2xl font-inter">
            We don't sell disconnected tools. CerebroHive is an integrated suite designed to move your enterprise from static data to autonomous execution.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {products.map((prod, i) => (
            <div key={i} className="group bg-surface border border-border rounded-2xl p-8 hover:border-white/30 transition-all flex flex-col relative overflow-hidden h-full cursor-pointer">
              
              <div className={cn("absolute top-0 left-0 w-full h-1", prod.color)} />

              <div className={cn("w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6", prod.textColor)}>
                <prod.icon size={24} />
              </div>

              <h3 className="text-2xl font-space font-bold text-text-primary mb-4">{prod.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-8 flex-1">{prod.desc}</p>

              <div className="flex items-center justify-between pt-6 border-t border-border">
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted group-hover:text-white transition-colors">
                  Explore Product
                </span>
                <ArrowRight size={16} className={cn("transition-transform group-hover:translate-x-1", prod.textColor)} />
              </div>
              
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
