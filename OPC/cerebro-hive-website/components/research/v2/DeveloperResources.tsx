"use client";

import React from "react";
import { Code2, Terminal, Book, Box, ArrowRight } from "lucide-react";

const resources = [
  { icon: Terminal, title: "API Explorer", desc: "Interactive playground for CerebroOS endpoints." },
  { icon: Box, title: "SDK Documentation", desc: "Native libraries for Python, Node.js, and Go." },
  { icon: Code2, title: "Reference Architectures", desc: "Production-grade templates for deploying agent swarms." },
  { icon: Book, title: "Prompt Library", desc: "Version-controlled, highly optimized system prompts." }
];

export const DeveloperResources = () => {
  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        
        <div className="bg-gradient-to-br from-surface to-black border border-border rounded-3xl p-8 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
          
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at top right, #00E5FF, transparent)` }} />

          <div className="flex-1 relative z-10">
            <span className="text-[10px] uppercase tracking-widest text-accent-secondary font-bold mb-4 block">Developer Portal</span>
            <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-6">Build the Future.</h2>
            <p className="text-lg text-text-secondary mb-8 max-w-xl">
              Access the same tools our researchers use. From interactive API playgrounds to verified prompt libraries, everything you need to operationalize AI is here.
            </p>
            <button className="px-8 py-4 bg-[#00E5FF] text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg flex items-center gap-3 transition-transform hover:scale-105 shadow-[0_0_20px_rgba(0,229,255,0.3)]">
              Access Portal <ArrowRight size={16} />
            </button>
          </div>

          <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            {resources.map((res, i) => (
              <div key={i} className="p-6 rounded-xl bg-surface border border-border hover:bg-surface-elevated transition-colors group cursor-pointer">
                <res.icon size={24} className="text-text-muted group-hover:text-text-primary transition-colors mb-4" />
                <h3 className="text-text-primary font-space font-bold mb-2">{res.title}</h3>
                <p className="text-xs text-text-secondary">{res.desc}</p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
