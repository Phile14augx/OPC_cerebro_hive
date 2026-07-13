"use client";

import React, { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Globe2, Activity } from "lucide-react";

const AnimatedGlobe = () => {
  return (
    <div className="relative w-full max-w-[600px] aspect-square mx-auto opacity-60">
      {/* Base Globe Grid */}
      <svg viewBox="0 0 400 400" className="w-full h-full animate-[spin_120s_linear_infinite]">
        <defs>
          <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0, 229, 255, 0.2)" />
            <stop offset="80%" stopColor="rgba(0, 229, 255, 0.05)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        
        {/* Glow */}
        <circle cx="200" cy="200" r="180" fill="url(#globeGlow)" />
        <circle cx="200" cy="200" r="198" fill="none" stroke="rgba(0, 229, 255, 0.1)" strokeWidth="1" strokeDasharray="4 8" />
        
        {/* Latitudes & Longitudes */}
        <g stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.5" fill="none">
          {[...Array(6)].map((_, i) => (
            <ellipse key={`lat-${i}`} cx="200" cy="200" rx="180" ry={30 * (i + 1)} />
          ))}
          {[...Array(6)].map((_, i) => (
            <ellipse key={`lon-${i}`} cx="200" cy="200" rx={30 * (i + 1)} ry="180" />
          ))}
          <circle cx="200" cy="200" r="180" />
        </g>
      </svg>

      {/* Pulsing Nodes representing HQs */}
      <div className="absolute inset-0">
        {/* NY */}
        <motion.div 
          className="absolute top-[30%] left-[25%] w-3 h-3 bg-primary-accent rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="absolute inset-0 w-full h-full bg-primary-accent/40 rounded-full animate-ping" />
        </motion.div>
        
        {/* London */}
        <motion.div 
          className="absolute top-[25%] left-[45%] w-2 h-2 bg-[#00E5FF] rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        >
          <div className="absolute inset-0 w-full h-full bg-[#00E5FF]/40 rounded-full animate-ping" />
        </motion.div>

        {/* Dubai */}
        <motion.div 
          className="absolute top-[40%] left-[60%] w-2 h-2 bg-[#00E5FF] rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />

        {/* Sydney */}
        <motion.div 
          className="absolute top-[70%] left-[85%] w-2 h-2 bg-[#00E5FF] rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: 1.5 }}
        />
        
        {/* Connecting Arc SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400">
          <motion.path
            d="M 100 120 Q 140 80 180 100"
            fill="none"
            stroke="rgba(0, 229, 255, 0.5)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.path
            d="M 180 100 Q 210 140 240 160"
            fill="none"
            stroke="rgba(0, 245, 122, 0.5)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
          />
        </svg>
      </div>
    </div>
  );
};

export const CompanyHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yPos = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen pt-32 pb-24 flex flex-col justify-center overflow-hidden bg-background"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-primary-accent/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.03] dark:mix-blend-screen mix-blend-multiply scale-150" style={{ backgroundImage: "url('/images/noise.png')" }} />
      </div>

      <div className="container-wide relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left: Content */}
        <motion.div 
          style={{ y: yPos, opacity }} 
          className="flex flex-col items-start text-left max-w-2xl"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 backdrop-blur-sm shadow-sm">
            <Globe2 size={12} className="text-primary-accent" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Corporate Headquarters</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-space font-bold text-text-primary tracking-tight leading-[1.1] mb-6">
            Intelligence. <br/>
            Connection. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-[#00E5FF]">Impact.</span>
          </h1>

          <p className="text-lg md:text-xl text-text-secondary font-inter leading-relaxed mb-10 max-w-xl">
            CerebroHive is the definitive AI-native enterprise transformation partner. We close the gap between an executive's AI vision and a working system in production.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="px-8 py-4 bg-primary-accent text-black font-space font-bold text-sm uppercase tracking-widest rounded-lg flex items-center justify-center gap-3 transition-transform hover:-translate-y-1">
              Explore Our Story
              <ArrowDown size={16} />
            </button>
            <button className="px-8 py-4 bg-transparent border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg hover:border-primary-accent/50 hover:bg-surface transition-all">
              Our Methodology
            </button>
          </div>
        </motion.div>

        {/* Right: SVG Globe Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="relative lg:h-[600px] flex items-center justify-center"
        >
          <AnimatedGlobe />
        </motion.div>

      </div>
      
      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
