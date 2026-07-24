"use client";

import { motion } from "framer-motion";
import { motionTokens } from "@/lib/design-system/tokens";

interface PulseProps {
  color?: string;
  size?: number;
  duration?: number;
  className?: string;
}

export function Pulse({
  color = "rgba(0, 229, 255, 0.4)",
  size = 100,
  duration = motionTokens.duration.ambient,
  className = "",
}: PulseProps) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        top: "50%",
        left: "50%",
        x: "-50%",
        y: "-50%",
      }}
      initial={{ scale: 0.5, opacity: 0.8 }}
      animate={{ scale: 2, opacity: 0 }}
      transition={{
        duration,
        ease: "easeOut",
        repeat: Infinity,
        repeatDelay: 0.5,
      }}
    />
  );
}
