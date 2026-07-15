"use client";

import React, { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

type IconComponent = React.ComponentType<{ size?: number; color?: string; className?: string }>;

interface Metric {
  label: string;
  value: string;
  sub: string;
  type?: "up" | "down";
}

interface CultureCardProps {
  value: {
    id: string;
    metadata: string;
    title: string;
    statement: string;
    description: string;
    icon: IconComponent;
    color: string;
    pattern: string;
    metrics: Metric[];
    bottomTag: string;
  };
  index: number;
  className?: string;
}

export const CultureCard = React.memo(({ value, index, className }: CultureCardProps) => {
  const Icon = value.icon;
  const ref = useRef<HTMLDivElement>(null);

  // Motion values for spotlight (no React state re-renders)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring physics for smooth spotlight trailing
  const springConfig = { damping: 30, stiffness: 400 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { left, top } = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const background = useMotionTemplate`radial-gradient(400px circle at ${smoothX}px ${smoothY}px, ${value.color}15, transparent 80%)`;
  const borderGradient = useMotionTemplate`radial-gradient(300px circle at ${smoothX}px ${smoothY}px, ${value.color}60, transparent 60%)`;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.21, 0.47, 0.32, 0.98] }}
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative flex flex-col justify-between rounded-[2rem] p-8 overflow-hidden bg-[#0a0d14]",
        "border border-white/5 transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),_0_60px_120px_rgba(0,0,0,0.3)]",
        "shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
        className
      )}
      style={{
        boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* 1. Animated Border Spotlight */}
      <motion.div
        className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: borderGradient,
          padding: "1px",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {/* 2. Spotlight Background */}
      <motion.div 
        className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background }}
      />

      {/* 3. Subtle Noise / Texture Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03] mix-blend-overlay pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      <div className="relative z-10 flex flex-col h-full">
        
        {/* Top Section */}
        <div>
          {/* Metadata */}
          <div className="text-[9px] font-space font-bold tracking-widest text-text-muted mb-4 group-hover:text-text-secondary transition-colors duration-300">
            {value.metadata}
          </div>

          <div className="flex items-start justify-between mb-6">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden transition-all duration-[220ms] group-hover:scale-105 group-hover:-rotate-3"
              style={{ backgroundColor: `${value.color}10`, border: `1px solid ${value.color}20` }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300" style={{ background: `radial-gradient(circle at center, ${value.color}, transparent)` }} />
              <Icon size={24} color={value.color} className="relative z-10" />
            </div>
          </div>

          <h3 className="text-xl md:text-2xl font-space font-bold text-text-primary mb-2 transition-colors duration-300 group-hover:text-white">
            {value.title}
          </h3>
          
          <div className="h-[1px] w-12 bg-white/10 mb-4 transition-all duration-500 group-hover:w-full group-hover:bg-gradient-to-r" 
               style={{ backgroundImage: `linear-gradient(to right, ${value.color}80, transparent)` }} />

          <p className="text-sm font-bold text-text-primary mb-3 font-inter">
            {value.statement}
          </p>

          <p className="text-sm text-text-secondary font-inter leading-relaxed mb-8">
            {value.description}
          </p>
        </div>

        {/* Bottom Section (Metrics & Tag) */}
        <div className="mt-auto">
          {/* Mini Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6 p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
            {value.metrics.map((metric, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-[10px] text-text-muted font-space uppercase tracking-wider mb-1">{metric.label}</span>
                <span className="text-sm font-bold text-text-primary font-mono" style={{ color: value.color }}>{metric.value}</span>
                <span className="text-[9px] text-text-muted">{metric.sub}</span>
              </div>
            ))}
          </div>

          {/* Tag Footer */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-[10px] font-space font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: value.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: value.color }} />
              {value.bottomTag}
            </span>
            <div className="w-5 h-5 rounded-full flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" style={{ backgroundColor: `${value.color}20`, color: value.color }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
});

CultureCard.displayName = "CultureCard";

