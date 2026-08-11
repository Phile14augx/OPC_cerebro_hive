"use client";

import { motion } from "framer-motion";
import { visualTokens, motionTokens } from "@/lib/design-system/tokens";

interface GlowLayerProps {
  color?: "primary" | "secondary" | "warning" | "ambient";
  className?: string;
  intensity?: number;
}

export function GlowLayer({
  color = "primary",
  className = "",
  intensity = 1,
}: GlowLayerProps) {
  return (
    <motion.div
      className={`absolute inset-0 pointer-events-none rounded-full ${visualTokens.glow[color]} ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.5 * intensity, 1 * intensity, 0.5 * intensity] }}
      transition={{
        duration: motionTokens.duration.ambient * 2,
        ease: "easeInOut",
        repeat: Infinity,
      }}
      style={{
        filter: "blur(20px)",
      }}
    />
  );
}
