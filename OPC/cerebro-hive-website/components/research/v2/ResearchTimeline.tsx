"use client";

import React from "react";
import { GitCommit, ArrowDown } from "lucide-react";

const timeline = [
  { year: "2024", research: "First Enterprise RAG Framework", product: "Knowledge Hub Alpha" },
  { year: "2025", research: "Multi-Agent Planning Protocol", product: "AgentOS General Availability" },
  { year: "2026", research: "Deterministic Reasoning Engine", product: "Quantiva ERP AI Layer" },
  { year: "2027", research: "Enterprise World Models", product: "Autonomous Organization Suite (Preview)" }
];

export const ResearchTimeline = () => {
  return (
    <section className="py-24 border-b border-white/5 bg-[#0A0D14]">
      <div className="container-wide">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-space font-bold text-white mb-4">Technology Transfer</h2>
          <p className="text-text-secondary max-w-2xl mx-auto font-inter">
            Watch how our foundational research directly matures into our core enterprise products.
          </p>
        </div>

        <div className="max-w-5xl mx-auto overflow-x-auto no-scrollbar pb-8">
          <div className="min-w-[800px]">
            
            {/* Top Track: Research */}
            <div className="flex items-end mb-8 relative">
              <div className="w-32 shrink-0 text-right pr-6 text-[10px] uppercase tracking-widest text-[#00E5FF] font-bold">Research</div>
              {timeline.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center px-4 relative z-10 group cursor-pointer">
                  <div className="bg-surface border border-white/10 rounded-lg p-4 w-full text-center hover:border-[#00E5FF]/50 transition-colors">
                    <span className="text-sm font-space font-bold text-white">{item.research}</span>
                  </div>
                  {/* Connector down to timeline */}
                  <div className="w-px h-6 bg-white/20 mt-2" />
                </div>
              ))}
            </div>

            {/* Timeline Axis */}
            <div className="flex items-center relative py-2">
              <div className="w-32 shrink-0" />
              <div className="absolute left-32 right-0 h-0.5 bg-gradient-to-r from-white/10 via-white/20 to-white/10" />
              {timeline.map((item, i) => (
                <div key={i} className="flex-1 flex justify-center relative z-10">
                  <div className="w-16 py-1 bg-[#0A0D14] border border-white/20 rounded-full text-center text-xs font-bold text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    {item.year}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Track: Products */}
            <div className="flex items-start mt-8 relative">
              <div className="w-32 shrink-0 text-right pr-6 text-[10px] uppercase tracking-widest text-[#00F57A] font-bold">Products</div>
              {timeline.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center px-4 relative z-10 group cursor-pointer">
                  {/* Connector up to timeline */}
                  <div className="w-px h-6 bg-white/20 mb-2" />
                  <div className="bg-surface border border-white/10 rounded-lg p-4 w-full text-center hover:border-[#00F57A]/50 transition-colors">
                    <span className="text-sm font-space font-bold text-white">{item.product}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
