"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Terminal, CheckCircle2, Circle } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { NeuralOrb } from "@/components/ui/NeuralOrb";
import { cn } from "@/lib/utils";

// ============================================================================
// COMMAND CENTER BACKGROUND
// ============================================================================
const CommandCenterBackground = () => (
  <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#020306]">
    {/* Deep Radial Glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-accent/5 rounded-full blur-[120px]" />
    
    {/* Animated SVG Noise & Grid Overlay */}
    <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
    <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

    {/* Ambient Drift Grid */}
    <motion.svg className="absolute inset-0 w-full h-full opacity-[0.04]"
      animate={{ y: [0, -40, 0] }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
    >
      <pattern id="cta-mesh" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 40 M 0 0 L 40 40" fill="none" stroke="white" strokeWidth="0.5" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#cta-mesh)" />
    </motion.svg>
  </div>
);

// ============================================================================
// JOURNEY PIPELINE
// ============================================================================
const stages = ["Vision", "Strategy", "Engineering", "Deployment", "Business Value"];

const JourneyPipeline = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto mb-16 relative z-10">
      <div className="flex items-center justify-between w-full">
        {stages.map((stage, i) => (
          <React.Fragment key={stage}>
            {/* Stage Node */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="flex flex-col items-center gap-3 relative"
            >
              <div className="w-6 h-6 rounded-full bg-surface-elevated border border-primary-accent/30 flex items-center justify-center relative z-10">
                <CheckCircle2 size={12} className="text-primary-accent" />
              </div>
              <span className="text-[10px] font-space font-bold uppercase tracking-widest text-text-muted hidden sm:block whitespace-nowrap">
                {stage}
              </span>
            </motion.div>

            {/* Connecting Line */}
            {i < stages.length - 1 && (
              <div className="flex-1 h-[1px] bg-white/5 relative mx-2 sm:mx-4 -mt-6 sm:-mt-8">
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-primary-accent/50"
                  initial={{ width: "0%" }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 + 0.2 }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// DYNAMIC HEADLINE
// ============================================================================
const headlines = [
  "Build Production AI.",
  "Engineer Enterprise Intelligence.",
  "Deploy AI That Delivers Value."
];

const DynamicHeadline = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % headlines.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center mb-12 relative z-10 h-32 flex flex-col items-center justify-center">
      <h2 className="text-[10px] font-mono tracking-[0.3em] uppercase text-primary-accent mb-6 flex items-center justify-center gap-2">
        <Terminal size={12} /> Executive Command Center
      </h2>
      <div className="relative w-full flex justify-center">
        <AnimatePresence mode="wait">
          <motion.h3
            key={index}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-space font-bold text-white tracking-tight absolute"
          >
            {headlines[index]}
          </motion.h3>
        </AnimatePresence>
      </div>
    </div>
  );
};

// ============================================================================
// CTA MAIN COMPONENT
// ============================================================================
export const CTA = () => {
  return (
    <section className="section-pad relative overflow-hidden bg-[#020306] pt-32 pb-48 border-t border-white/5">
      <CommandCenterBackground />
      
      <div className="container-wide relative z-20 flex flex-col items-center">
        
        {/* The Signature Centerpiece */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mb-16"
        >
          <NeuralOrb size="lg" color="cyan" state="thinking" pulse={true} />
        </motion.div>

        <JourneyPipeline />
        
        <DynamicHeadline />

        {/* Narrative Conclusion Copy */}
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-text-secondary font-inter mb-16 max-w-2xl text-center"
        >
          You've seen how we think. Now let's build together.
        </motion.p>
        
        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col items-center gap-6 mb-24 w-full"
        >
          <div className="flex flex-col sm:flex-row justify-center gap-6 w-full max-w-xl">
            <AnimatedButton 
              variant="primary" 
              size="lg" 
              className="w-full sm:w-auto text-sm font-space font-bold uppercase tracking-widest bg-primary-accent hover:bg-[#00E5FF] text-black shadow-[0_0_30px_rgba(0,229,255,0.2)] hover:shadow-[0_0_40px_rgba(0,229,255,0.4)] transition-all group"
            >
              Start AI Transformation <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </AnimatedButton>
            
            <AnimatedButton 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto text-sm font-space font-bold uppercase tracking-widest border-white/20 text-white hover:bg-white/5 backdrop-blur-md"
            >
              Explore Delivery Framework
            </AnimatedButton>
          </div>
          
          {/* Response Expectations */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] font-mono text-text-muted uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Circle size={8} className="fill-white/20" /> 30-minute strategy session</span>
            <span className="flex items-center gap-1.5"><Circle size={8} className="fill-white/20" /> No sales pressure</span>
            <span className="flex items-center gap-1.5"><Circle size={8} className="fill-white/20" /> Technical discussion</span>
          </div>
        </motion.div>

        {/* Executive Outcomes */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-wrap justify-center gap-8 md:gap-16 pt-12 border-t border-white/5 w-full max-w-4xl"
        >
          {["Enterprise AI", "Production Systems", "Software Engineering", "Applied Research"].map((outcome, i) => (
            <span key={i} className="text-[11px] font-space font-bold text-white/40 uppercase tracking-[0.2em]">
              {outcome}
            </span>
          ))}
        </motion.div>

      </div>

      {/* Footer Vignette Blend */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-black pointer-events-none z-10" />
    </section>
  );
};
