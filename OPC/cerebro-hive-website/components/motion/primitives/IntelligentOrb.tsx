"use client";

import React from "react";
import { motion } from "framer-motion";
import { motionTokens } from "../foundation/tokens";
import { useMotionConfig } from "../foundation/MotionProvider";
import { NodeState } from "@/lib/data/industries/types";

export interface IntelligentOrbProps {
  state?: NodeState;
  colorVariant?: "knowledge" | "reasoning" | "agent" | "automation" | "alert" | "executive" | "default";
  icon?: React.ElementType<{ size?: number; style?: React.CSSProperties }>;
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export function IntelligentOrb({
  state = "idle",
  colorVariant = "default",
  icon: Icon,
  size = "md",
  className = "",
  onClick
}: IntelligentOrbProps) {
  const { motionMode } = useMotionConfig();
  const isStatic = motionMode === "static";

  // Semantic Colors
  const getColor = () => {
    switch(colorVariant) {
      case "agent": return "var(--success)"; // Green
      case "knowledge": return "var(--accent-secondary)"; // Blue
      case "reasoning": return "#7B61FF"; // Purple
      case "automation": return "var(--warning)"; // Orange
      case "alert": return "var(--destructive)"; // Red
      case "executive": return "var(--text-primary)"; // White/Black
      default: return "var(--border)"; // Gray
    }
  };

  const color = getColor();

  // Semantic Behaviors based on State
  const getVariants = () => {
    if (isStatic) return {};
    
    switch(state) {
      case "reasoning":
      case "thinking":
        return {
          animate: { 
            scale: [1, 1.05, 1],
            boxShadow: [`0 0 0px ${color}`, `0 0 20px ${color}`, `0 0 0px ${color}`]
          },
          transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const }
        };
      case "processing":
      case "receiving":
        return {
          animate: {
            borderColor: [color, "var(--border)", color],
            rotate: 360
          },
          transition: { duration: 2, repeat: Infinity, ease: "linear" as const }
        };
      case "completed":
        return {
          animate: { scale: [0.9, 1.1, 1], boxShadow: `0 0 15px ${color}` },
          transition: { duration: 0.5, ease: motionTokens.easing.spring as any }
        };
      case "monitoring":
        return {
          animate: { opacity: [0.7, 1, 0.7] },
          transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const }
        };
      case "idle":
      default:
        return {
          animate: { scale: 1, boxShadow: "none" }
        };
    }
  };

  const dimensions = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-16 h-16" : "w-12 h-12";
  const iconSize = size === "sm" ? 14 : size === "lg" ? 24 : 18;
  const { animate, transition } = getVariants();

  return (
    <motion.button
      onClick={onClick}
      className={`relative rounded-full flex items-center justify-center bg-surface border-2 z-10 transition-colors ${dimensions} ${className}`}
      style={{ borderColor: state === 'idle' ? 'var(--border)' : color }}
      animate={animate}
      transition={transition}
      whileHover={isStatic ? {} : { scale: 1.1, boxShadow: motionTokens.glow.medium }}
      whileTap={isStatic ? {} : { scale: 0.95 }}
    >
      {Icon && <Icon size={iconSize} style={{ color: state === 'idle' ? 'var(--text-muted)' : color }} />}
    </motion.button>
  );
}
