"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import { motionTokens } from "@/lib/design-system/tokens";

interface EdgeProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  active?: boolean;
  pulse?: boolean;
  strokeWidth?: number;
  strokeColor?: string;
  activeColor?: string;
  delay?: number;
}

export function Edge({
  startX,
  startY,
  endX,
  endY,
  active = false,
  pulse = false,
  strokeWidth = 2,
  strokeColor = "rgba(255, 255, 255, 0.1)",
  activeColor = "rgba(0, 229, 255, 0.8)",
  delay = 0,
}: EdgeProps) {
  const gradientId = `edge-gradient-${useId()}`;
  
  // Calculate a basic bezier curve for organic feeling connections
  const controlPointX = startX + (endX - startX) / 2;
  const pathData = `M ${startX} ${startY} C ${controlPointX} ${startY}, ${controlPointX} ${endY}, ${endX} ${endY}`;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={1} />
          <stop offset="50%" stopColor={active ? activeColor : strokeColor} stopOpacity={1} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={1} />
        </linearGradient>
      </defs>

      {/* Base Path */}
      <motion.path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{
          duration: motionTokens.duration.slow,
          ease: motionTokens.easing.smooth,
          delay,
        }}
      />

      {/* Active Pulse overlay */}
      {(active || pulse) && (
        <motion.path
          d={pathData}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth + 1}
          initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
          animate={{
            pathOffset: [0, 1],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: motionTokens.duration.ambient,
            ease: "linear",
            repeat: Infinity,
            delay: delay + 0.5,
          }}
          style={{ filter: "drop-shadow(0 0 4px rgba(0,229,255,0.5))" }}
        />
      )}
    </svg>
  );
}
