"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { useMotionConfig } from "../foundation/MotionProvider";
import { motionTokens } from "../foundation/tokens";

export interface HoverCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  activeColor?: string; // Color to use for border accent on hover
}

/**
 * Ensures all cards in the application share the identical interaction lifecycle:
 * Lift -> Shadow -> Border Accent
 */
export function HoverCard({
  children,
  activeColor = "var(--primary-accent)",
  className = "",
  ...props
}: HoverCardProps) {
  const { motionMode } = useMotionConfig();
  const isStatic = motionMode === "static";

  return (
    <motion.div
      className={`relative rounded-2xl bg-surface border border-border overflow-hidden ${className}`}
      whileHover={isStatic ? {} : {
        y: motionTokens.elevation.lift,
        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)", // Subtle lift shadow
        borderColor: "rgba(255,255,255,0.2)" // Will be overridden by the ::after pseudoelement
      }}
      transition={{ duration: motionTokens.duration.fast, ease: motionTokens.easing.smooth }}
      {...props}
    >
      {/* Animated Gradient Border Accent overlay */}
      {!isStatic && (
        <motion.div
          className="absolute inset-0 z-0 opacity-0 pointer-events-none rounded-2xl"
          style={{
            boxShadow: `inset 0 0 0 1px ${activeColor}`,
            maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)"
          }}
          variants={{
            hover: { opacity: 1 }
          }}
          transition={{ duration: motionTokens.duration.normal }}
        />
      )}
      
      {/* Content wrapper */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}
