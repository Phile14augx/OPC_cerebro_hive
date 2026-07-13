"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { globalPresence } from "@/lib/content/company/offices";
import { MapPin, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export const GlobalPresenceMap = () => {
  const [activeRegion, setActiveRegion] = useState(globalPresence[0]);

  return (
    <section className="section-pad bg-surface">
      <div className="container-wide">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-sm font-space font-bold tracking-widest uppercase text-primary-accent mb-4">
            Global Capability
          </h2>
          <h3 className="text-4xl md:text-5xl font-space font-bold text-text-primary tracking-tight mb-6">
            Where We Operate
          </h3>
          <p className="text-lg text-text-secondary font-inter">
            Our delivery capability spans the globe, with targeted expansion roadmaps to serve mid-market enterprises across key economic hubs.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start max-w-6xl mx-auto">
          
          {/* Left: Map Visualization */}
          <div className="lg:col-span-7 bg-surface-elevated border border-border rounded-3xl p-8 aspect-video relative flex items-center justify-center overflow-hidden">
            <Globe size={400} className="text-border opacity-20 absolute" />
            
            <div className="relative z-10 w-full h-full flex flex-wrap gap-4 items-center justify-center">
              {globalPresence.map((office) => {
                const isActive = activeRegion.region === office.region;
                const isOperational = office.status === "Operational";
                
                return (
                  <button
                    key={office.region}
                    onClick={() => setActiveRegion(office)}
                    className={cn(
                      "flex items-center gap-3 px-6 py-4 rounded-xl border transition-all duration-300",
                      isActive 
                        ? (isOperational ? "bg-primary-accent/10 border-primary-accent" : "bg-[#00E5FF]/10 border-[#00E5FF]")
                        : "bg-surface border-border hover:border-text-muted"
                    )}
                  >
                    <MapPin size={20} className={isActive ? (isOperational ? "text-primary-accent" : "text-[#00E5FF]") : "text-text-muted"} />
                    <div className="text-left">
                      <p className={cn("font-space font-bold text-sm", isActive ? "text-text-primary" : "text-text-secondary")}>
                        {office.region}
                      </p>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-text-muted mt-0.5">
                        {office.status}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Region Details */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRegion.region}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-surface-elevated border border-border rounded-3xl p-10 h-full flex flex-col"
              >
                <div className="mb-8">
                  <span className={cn(
                    "text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full",
                    activeRegion.status === "Operational" 
                      ? "bg-primary-accent/10 text-primary-accent border border-primary-accent/20"
                      : "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20"
                  )}>
                    {activeRegion.type}
                  </span>
                </div>
                
                <h4 className="text-3xl font-space font-bold text-text-primary mb-2">
                  {activeRegion.region}
                </h4>
                <p className="text-lg text-text-secondary font-inter mb-8">
                  {activeRegion.status}
                </p>
                
                <div className="space-y-6 mt-auto">
                  <div className="p-6 bg-background rounded-xl border border-border">
                    <p className="text-sm font-space font-bold text-text-muted uppercase tracking-widest mb-2">Primary Focus</p>
                    <p className="text-text-primary font-space font-medium">Enterprise Transformation & Delivery</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};
