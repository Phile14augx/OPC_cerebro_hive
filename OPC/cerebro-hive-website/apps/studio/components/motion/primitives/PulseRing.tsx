"use client";

import React from "react";
import { motion } from "framer-motion";
import { useCerebroMotion } from "../foundation/MotionProvider";

export interface PulseRingProps {
  color?: string;
  size?: number; // base size in pixels
  count?: number; // number of rings
  duration?: number;
  className?: string;
}

export function PulseRing({
  color = "var(--primary-accent)",
  size = 64,
  count = 3,
  duration = 3,
  className = ""
}: PulseRingProps) {
  const { level } = useCerebroMotion();
  const isStatic = level === "reduced";
  
  if (isStatic) return null;

  const rings = Array.from({ length: count });

  return (
    <div 
      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {rings.map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: color }}
          initial={{ opacity: 0.8, scale: 0.5 }}
          animate={{ opacity: 0, scale: 2.5 }}
          transition={{
            duration: duration,
            repeat: Infinity,
            ease: "easeOut",
            delay: (duration / count) * i // stagger rings
          }}
        />
      ))}
    </div>
  );
}
