"use client";

import React from "react";
import { ArrowRight, Terminal } from "lucide-react";
import { withBasePath } from "@/lib/utils";

export const PlatformCTA = () => {
  return (
    <section className="relative py-32 border-b border-border bg-background overflow-hidden">
      
      {/* Background ambients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-accent/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-screen" style={{ backgroundImage: `url('${withBasePath('/images/noise.png')}')` }} />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`, backgroundSize: '64px 64px' }} />
      </div>

      <div className="container-wide relative z-10">
        <div className="max-w-4xl mx-auto bg-surface-elevated/80 backdrop-blur-xl border border-border rounded-3xl p-12 md:p-20 text-center shadow-2xl relative overflow-hidden">
          
          {/* Top border glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-primary-accent to-transparent opacity-50" />

          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary-accent/10 text-primary-accent mb-8 shadow-inner border border-primary-accent/20">
            <Terminal size={32} />
          </div>

          <h2 className="text-4xl md:text-6xl font-space font-bold text-text-primary tracking-tight mb-6 leading-tight">
            Ready to initialize <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent via-[#00E5FF] to-primary-accent bg-[length:200%_auto] animate-gradient-shift">
              your AI operating system?
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-text-secondary font-inter mb-10 max-w-2xl mx-auto">
            Stop buying fragmented AI tools. Build a unified, autonomous enterprise platform that scales with your business.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto group px-8 py-4 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg flex items-center justify-center gap-3 transition-all hover:bg-surface shadow-[0_0_20px_rgba(0,245,122,0.2)]">
              Build My AI Platform
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-transparent border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg hover:border-border-default hover:bg-surface transition-all flex items-center justify-center">
              View Documentation
            </button>
          </div>
          
        </div>
      </div>
    </section>
  );
};
