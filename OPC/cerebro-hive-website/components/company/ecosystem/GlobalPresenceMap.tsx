"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { globalPresence } from "@/lib/content/company/offices";
import { MapPin, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export const GlobalPresenceMap = () => {
  const [activeRegion, setActiveRegion] = useState(globalPresence[0]);

  return (
    <section className="section-pad bg-[#030608] relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[800px] rounded-full blur-[150px] opacity-10 bg-gradient-to-r from-primary-accent to-[#00E5FF]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      </div>

      <div className="container-wide relative z-10">
        
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-xs font-space font-bold tracking-[0.2em] uppercase text-primary-accent mb-4 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-accent animate-pulse" />
            Global Capability
          </h2>
          <h3 className="text-4xl md:text-5xl font-space font-bold text-white tracking-tight mb-6">
            Where We Operate
          </h3>
          <p className="text-lg text-text-secondary font-inter leading-relaxed max-w-xl mx-auto">
            Our delivery capability spans the globe, with targeted expansion roadmaps to serve mid-market enterprises across key economic hubs.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start max-w-7xl mx-auto">
          
          {/* Left: Map Visualization */}
          <div className="lg:col-span-7 bg-[#05070a]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 aspect-square md:aspect-video lg:aspect-square relative flex items-center justify-center overflow-hidden shadow-2xl">
            <Globe size={500} className="text-white/5 absolute" />
            
            <div className="relative z-10 w-full h-full flex flex-wrap gap-4 items-center justify-center content-center">
              {globalPresence.map((office) => {
                const isActive = activeRegion.region === office.region;
                const isOperational = office.status === "Operational";
                
                return (
                  <button
                    key={office.region}
                    onClick={() => setActiveRegion(office)}
                    className={cn(
                      "flex items-center gap-3 px-6 py-4 rounded-xl border transition-all duration-500 backdrop-blur-md",
                      isActive 
                        ? (isOperational 
                            ? "bg-primary-accent/10 border-primary-accent/50 shadow-[0_0_30px_rgba(0,245,122,0.15)] scale-[1.02]" 
                            : "bg-[#00E5FF]/10 border-[#00E5FF]/50 shadow-[0_0_30px_rgba(0,229,255,0.15)] scale-[1.02]")
                        : "bg-white/[0.02] border-white/10 hover:border-white/30 opacity-50 hover:opacity-100 hover:scale-[1.01]"
                    )}
                  >
                    <div className={cn("shrink-0", isActive ? (isOperational ? "text-primary-accent" : "text-[#00E5FF]") : "text-text-muted")}>
                      <MapPin size={20} />
                    </div>
                    <div className="text-left">
                      <p className={cn("font-space font-bold text-sm transition-colors", isActive ? "text-white" : "text-text-secondary")}>
                        {office.region}
                      </p>
                      <p className={cn("text-[10px] font-bold tracking-widest uppercase mt-0.5 transition-colors", isActive ? "text-white/70" : "text-text-muted")}>
                        {office.status}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Region Details (Editorial Design) */}
          <div className="lg:col-span-5 h-full min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRegion.region}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col h-full justify-center"
              >
                
                {/* 1. Header Block */}
                <div className="mb-10">
                  {/* Editorial Badge */}
                  <h4 className={cn(
                    "text-[11px] font-space font-bold tracking-[0.2em] uppercase mb-6",
                    activeRegion.status === "Operational" ? "text-primary-accent" : "text-[#00E5FF]"
                  )}>
                    {activeRegion.type}
                  </h4>
                  
                  {/* Title (Dominant Hierarchy) */}
                  <h3 className="text-5xl lg:text-6xl font-space font-bold text-white tracking-tight mb-4 leading-none">
                    {activeRegion.region}
                  </h3>
                  
                  {/* Subtitle with Contextual Metadata */}
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[22px] text-text-secondary font-inter">
                      {activeRegion.status}
                    </p>
                    <p className="text-sm font-mono text-text-muted flex items-center gap-2">
                      {activeRegion.status === "Operational" ? "Active Operations" : "Priority Market"}
                      <span className="text-white/20">•</span> 
                      {activeRegion.status === "Operational" ? "Established 2024" : "2027–2028"}
                    </p>
                  </div>
                </div>
                
                {/* 2. Editorial Divider */}
                <div className="w-full h-px bg-white/10 mb-10 relative">
                  <div className={cn(
                    "absolute left-0 top-0 h-full w-1/4",
                    activeRegion.status === "Operational" ? "bg-primary-accent/50" : "bg-[#00E5FF]/50"
                  )} />
                </div>
                
                {/* 3. Primary Focus Card */}
                <div>
                  <p className="text-[13px] font-space font-bold text-text-muted uppercase tracking-widest mb-3">
                    Primary Focus
                  </p>
                  <p className="text-3xl font-space font-bold text-white leading-[1.2] max-w-sm">
                    Enterprise Transformation & Delivery
                  </p>
                </div>
                
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};
