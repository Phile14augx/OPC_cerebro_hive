"use client";

import React from "react";
import { motion } from "framer-motion";
import { useCerebroMotion } from "../foundation/MotionProvider";

export interface DataPacketProps {
  color?: string;
  size?: number;
  duration?: number; // speed of travel
  delay?: number;
  pathLength?: number; // 0 to 1, how far along the path to travel
  repeat?: boolean;
}

/**
 * A glowing particle that simulates enterprise data traffic.
 * Best used inside an AnimatedConnector SVG or absolute positioned container.
 */
export function DataPacket({
  color = "var(--primary-accent)",
  size = 6,
  duration = 2,
  delay = 0,
  pathLength = 1,
  repeat = true
}: DataPacketProps) {
  const { level } = useCerebroMotion();

  if (level === "reduced") return null;

  return (
    <motion.div
      className="absolute rounded-full z-10"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        boxShadow: `0 0 ${size * 2}px ${color}`,
        // Centers the packet on its origin so it aligns with SVG paths perfectly
        marginLeft: -size/2,
        marginTop: -size/2
      }}
      initial={{ offsetDistance: "0%", opacity: 0.4 }}
      animate={{ 
        offsetDistance: `${pathLength * 100}%`,
        opacity: [0, 1, 1, 0] // Fade in at start, fade out at end
      }}
      transition={{
        duration: duration,
        delay: delay,
        ease: "linear",
        repeat: repeat ? Infinity : 0,
      }}
    />
  );
}
