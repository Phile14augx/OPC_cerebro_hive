"use client";

import React from "react";
import { Repeat } from "lucide-react";
import { motion } from "framer-motion";

const nodes = [
  "Research",
  "Frameworks",
  "Products",
  "Enterprise Deployments",
  "Operational Data",
  "Insights"
];

export default function InnovationFlywheel() {
  return (
    <section className="py-24 border-b border-white/5 bg-[#05070A] overflow-hidden">
      <div className="container-wide">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-[#00E5FF] font-bold mb-6">
            <Repeat size={12} /> The Flywheel
          </div>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-white mb-6">How Knowledge Compounds</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-inter">
            Our operating model is a continuous learning loop. Every deployment generates data that feeds back into our fundamental research.
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto h-[400px] md:h-[500px] flex items-center justify-center">
          
          {/* Animated Circle Base */}
          <div className="absolute inset-0 m-auto w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full border border-white/10" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 m-auto w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full border border-dashed border-[#00E5FF]/30"
          />

          {/* Center Graphic */}
          <div className="w-24 h-24 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center shadow-[0_0_50px_rgba(0,229,255,0.2)] z-10">
            <Repeat size={32} className="text-[#00E5FF]" />
          </div>

          {/* Nodes around the circle */}
          {nodes.map((node, i) => {
            const angle = (i * (360 / nodes.length)) * (Math.PI / 180);
            // Calculate position on the circle (radius = 150px on mobile, 200px on desktop)
            // Using percentages for responsiveness could be tricky, using fixed layout for the diagram
            const radius = 200; // Assuming desktop for simplicity in this demo, responsive would use CSS calc or state
            const x = Math.sin(angle) * radius;
            const y = -Math.cos(angle) * radius;

            return (
              <div 
                key={i} 
                className="absolute hidden md:flex items-center justify-center p-4 bg-surface border border-white/10 rounded-xl shadow-xl z-20 whitespace-nowrap"
                style={{ transform: `translate(${x}px, ${y}px)` }}
              >
                <span className="font-space font-bold text-white text-sm">{node}</span>
              </div>
            );
          })}
          
          {/* Mobile list fallback */}
          <div className="md:hidden absolute inset-0 flex flex-col justify-between items-center py-4 z-20 pointer-events-none">
            {nodes.map((node, i) => (
              <div key={i} className="bg-surface border border-white/10 rounded-xl px-4 py-2 text-xs font-space font-bold text-white pointer-events-auto shadow-lg">
                {node}
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
