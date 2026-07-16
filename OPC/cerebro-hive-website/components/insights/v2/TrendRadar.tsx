"use client";

import React, { useState } from "react";
import { Crosshair, Navigation, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const technologies = [
  { id: "world-models", name: "World Models", category: "Emerging", x: 20, y: 30, adoption: "Low", maturity: "2-5 Years", confidence: "Medium", desc: "Simulating physical world physics in latent space for robotic planning." },
  { id: "agentic-os", name: "Agent OS", category: "Emerging", x: 35, y: 65, adoption: "Medium", maturity: "1-2 Years", confidence: "High", desc: "Operating systems designed specifically to orchestrate autonomous agents." },
  { id: "enterprise-memory", name: "Enterprise Memory", category: "Trending", x: 60, y: 20, adoption: "High", maturity: "< 1 Year", confidence: "High", desc: "Long-term, structured memory systems allowing agents to persist context across sessions." },
  { id: "multimodal-rag", name: "Multimodal RAG", category: "Trending", x: 75, y: 70, adoption: "High", maturity: "Current", confidence: "High", desc: "Retrieving and synthesizing text, image, and video data." },
  { id: "vector-dbs", name: "Vector DBs", category: "Stable", x: 90, y: 45, adoption: "Very High", maturity: "Current", confidence: "Very High", desc: "Foundational infrastructure for semantic search." },
];

export const TrendRadar = () => {
  const [activeTech, setActiveTech] = useState(technologies[2]);

  return (
    <section className="py-24 border-b border-border bg-background">
      <div className="container-wide">
        
        <div className="mb-12">
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-4">AI Trend Radar</h2>
          <p className="text-text-secondary max-w-2xl font-inter">
            A strategic mapping of AI technologies by maturity, enterprise adoption rate, and expected time to impact.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Radar Visualization */}
          <div className="lg:col-span-8 bg-surface border border-border rounded-2xl p-8 relative overflow-hidden flex items-center justify-center min-h-[500px]">
            {/* Radar grid */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-[80%] h-[80%] border border-white rounded-full absolute" />
              <div className="w-[50%] h-[50%] border border-white rounded-full absolute" />
              <div className="w-[20%] h-[20%] border border-white rounded-full absolute" />
              <div className="w-full h-px bg-white absolute" />
              <div className="h-full w-px bg-white absolute" />
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest text-warning">Emerging (Outer)</div>
            <div className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest text-accent-secondary">Trending (Middle)</div>
            <div className="absolute bottom-4 right-4 text-[10px] font-bold uppercase tracking-widest text-accent-primary">Stable (Inner)</div>

            {/* Points */}
            <div className="relative w-full h-full max-w-[400px] max-h-[400px]">
              {technologies.map(tech => (
                <button
                  key={tech.id}
                  onClick={() => setActiveTech(tech)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${tech.x}%`, top: `${tech.y}%` }}
                >
                  <motion.div 
                    animate={activeTech.id === tech.id ? { scale: [1, 1.5, 1] } : {}}
                    transition={{ duration: 1, repeat: activeTech.id === tech.id ? Infinity : 0 }}
                    className={cn(
                      "w-4 h-4 rounded-full border-2 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]",
                      tech.category === "Emerging" ? "bg-[#FFB300] border-black" :
                      tech.category === "Trending" ? "bg-[#00E5FF] border-black" :
                      "bg-accent-primary border-black",
                      activeTech.id === tech.id ? "scale-125 ring-4 ring-white/20" : ""
                    )}
                  />
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-text-primary bg-surface-secondary px-2 py-1 rounded border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {tech.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-4 bg-surface border border-border rounded-2xl p-6 flex flex-col">
            <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-6 flex items-center gap-2">
              <Crosshair size={12} /> Technology Assessment
            </div>
            
            <h3 className="text-2xl font-space font-bold text-text-primary mb-2">{activeTech.name}</h3>
            
            <div className="inline-flex px-2 py-1 rounded bg-white/5 border border-border text-xs font-bold text-text-secondary uppercase tracking-widest mb-6 w-fit">
              {activeTech.category}
            </div>

            <p className="text-sm text-text-secondary leading-relaxed mb-8">
              {activeTech.desc}
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-xs text-text-muted uppercase tracking-widest">Adoption Rate</span>
                <span className="text-sm font-bold text-text-primary">{activeTech.adoption}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-xs text-text-muted uppercase tracking-widest">Expected Maturity</span>
                <span className="text-sm font-bold text-text-primary">{activeTech.maturity}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-xs text-text-muted uppercase tracking-widest">Forecast Confidence</span>
                <span className="text-sm font-bold text-accent-secondary">{activeTech.confidence}</span>
              </div>
            </div>

            <div className="mt-auto p-4 rounded-xl bg-[#00E5FF]/5 border border-[#00E5FF]/20">
              <div className="text-[10px] uppercase tracking-widest text-accent-secondary font-bold mb-2 flex items-center gap-2">
                <Navigation size={12} /> Enterprise Action
              </div>
              <p className="text-xs text-text-primary">
                {activeTech.category === "Emerging" && "Monitor closely. Form a small skunkworks team to evaluate APIs."}
                {activeTech.category === "Trending" && "Initiate pilots. Vendor landscape is solidifying enough for enterprise testing."}
                {activeTech.category === "Stable" && "Deploy to production. This is now standard enterprise architecture."}
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
