"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { withBasePath } from "@/lib/utils";

// ============================================================================
// EXECUTIVE BLUEPRINT BACKGROUND (Light Theme)
// Precision, architecture, documentation, clean lines
// ============================================================================
const ExecutiveBlueprint = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Blueprint Grid */}
    <div 
      className="absolute inset-0 opacity-20" 
      style={{ 
        backgroundImage: `
          linear-gradient(var(--color-border-strong) 1px, transparent 1px), 
          linear-gradient(90deg, var(--color-border-strong) 1px, transparent 1px)
        `, 
        backgroundSize: '40px 40px' 
      }} 
    />
    <div 
      className="absolute inset-0 opacity-10" 
      style={{ 
        backgroundImage: `
          linear-gradient(var(--color-border-strong) 1px, transparent 1px), 
          linear-gradient(90deg, var(--color-border-strong) 1px, transparent 1px)
        `, 
        backgroundSize: '8px 8px' 
      }} 
    />
    
    {/* Architectural Accents */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full flex justify-between px-10">
       <div className="w-[1px] h-full bg-border-default opacity-50 relative">
          <div className="absolute top-[20%] left-[-3px] w-2 h-2 border border-primary-accent bg-background rounded-full" />
       </div>
       <div className="w-[1px] h-full bg-border-default opacity-50 relative">
          <div className="absolute top-[60%] left-[-3px] w-2 h-2 border border-primary-accent bg-background rounded-full" />
       </div>
    </div>

    {/* Subtle Glows (Multiply blend for light mode) */}
    <motion.div 
      className="absolute -top-1/4 -right-1/4 w-[1000px] h-[1000px] bg-primary-accent/5 rounded-full blur-[150px] mix-blend-multiply"
      animate={{ x: [0, -50, 0], y: [0, 20, 0] }}
      transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div 
      className="absolute bottom-1/4 -left-1/4 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] mix-blend-multiply"
      animate={{ x: [0, 50, 0], y: [0, -20, 0] }}
      transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
    />
  </div>
);

// ============================================================================
// MISSION CONTROL BACKGROUND (Dark Theme)
// Live intelligence, energy flow, neural connections
// ============================================================================
const MissionControl = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Energy Glows (Screen blend for dark mode) */}
    <motion.div 
      className="absolute -top-1/4 -right-1/4 w-[1200px] h-[1200px] bg-primary-accent/15 rounded-full blur-[200px] mix-blend-screen"
      animate={{ x: [0, -100, 0], y: [0, 50, 0], scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div 
      className="absolute top-1/4 -left-1/4 w-[1000px] h-[1000px] bg-[#00E5FF]/10 rounded-full blur-[150px] mix-blend-screen"
      animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
      transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 5 }}
    />
    
    {/* Dot Matrix */}
    <div 
      className="absolute inset-0 opacity-[0.15]" 
      style={{ 
        backgroundImage: `radial-gradient(var(--color-border-strong) 1px, transparent 1px)`, 
        backgroundSize: '24px 24px' 
      }} 
    />
    
    {/* Floating Particles */}
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-primary-accent rounded-full opacity-30 shadow-[0_0_10px_rgba(0,245,122,0.8)]"
        initial={{
          x: Math.random() * 100 + "%",
          y: Math.random() * 100 + "%",
          scale: Math.random() * 2,
        }}
        animate={{
          y: [null, `${Math.random() * 100}%`],
          opacity: [0.1, 0.6, 0.1],
        }}
        transition={{
          duration: Math.random() * 20 + 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    ))}
  </div>
);


export const HeroBackground = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a generic/empty background to avoid hydration mismatch
    return <div className="absolute inset-0 z-0 bg-background pointer-events-none" />;
  }

  const isLight = resolvedTheme === "light";

  return (
    <div className="absolute inset-0 z-0 pointer-events-none bg-background">
      {isLight ? <ExecutiveBlueprint /> : <MissionControl />}
      
      {/* Universal Noise Overlay for texture */}
      <div 
        className="absolute inset-0 mix-blend-overlay opacity-[0.03] dark:opacity-[0.05]" 
        style={{ backgroundImage: `url('${withBasePath('/images/noise.png')}')` }} 
      />
    </div>
  );
};
