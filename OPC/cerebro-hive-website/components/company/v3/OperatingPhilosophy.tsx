"use client";

import React from "react";
import { Scale, Check } from "lucide-react";

const philosophies = [
  { left: "Research", right: "Hype" },
  { left: "Systems", right: "Tools" },
  { left: "Architecture", right: "Shortcuts" },
  { left: "Long-term Value", right: "Quick Wins" },
];

const absolutes = [
  "Knowledge compounds.",
  "Automation should elevate people.",
  "Enterprise trust is non-negotiable."
];

export default function OperatingPhilosophy() {
  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-border text-[10px] uppercase tracking-widest text-warning font-bold mb-6">
            <Scale size={12} /> Operating Philosophy
          </div>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-6">The principles that guide every decision we make.</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-inter">
            In an industry driven by hype and short-term trends, we build for the long term. These are the non-negotiables that define how we engineer systems.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          
          {/* Trade-offs */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-6">What We Prioritize</h3>
            <div className="flex flex-col gap-4">
              {philosophies.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-surface border border-border group hover:border-[#FFB300]/50 transition-colors">
                  <div className="text-xl font-space font-bold text-text-primary group-hover:text-[#FFB300] transition-colors">{p.left}</div>
                  <div className="text-sm font-bold text-text-muted uppercase tracking-widest">Over</div>
                  <div className="text-lg font-space font-bold text-text-secondary line-through opacity-50">{p.right}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Absolutes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-6">Our Absolutes</h3>
            <div className="flex flex-col gap-6 h-full">
              {absolutes.map((abs, i) => (
                <div key={i} className="flex-1 p-8 rounded-2xl bg-surface-secondary border border-border relative overflow-hidden flex items-center gap-6 group hover:bg-white/5 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-white/10 group-hover:bg-white/30 transition-colors" />
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <Check size={20} className="text-accent-secondary" />
                  </div>
                  <div className="text-xl font-space font-bold text-text-primary leading-tight">
                    {abs}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
