"use client";

import React, { useId } from "react";
import { motion } from "framer-motion";
import { useMotionConfig } from "../foundation/MotionProvider";
import { DataPacket } from "./DataPacket";

export interface AnimatedConnectorProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  variant?: "straight" | "curved" | "multi-hop"; // extensible
  state?: "idle" | "active" | "error";
  activeColor?: string;
  idleColor?: string;
  showPacket?: boolean;
  packetSpeed?: number;
  packetFrequency?: number; // How many packets
  strokeWidth?: number;
  className?: string;
}

export function AnimatedConnector({
  startX,
  startY,
  endX,
  endY,
  variant = "curved",
  state = "idle",
  activeColor = "var(--primary-accent)",
  idleColor = "var(--border)",
  showPacket = false,
  packetSpeed = 2,
  packetFrequency = 1,
  strokeWidth = 2,
  className = ""
}: AnimatedConnectorProps) {
  const { motionMode } = useMotionConfig();
  const pathId = useId();

  // Determine path SVG data
  let d = "";
  if (variant === "straight") {
    d = `M ${startX} ${startY} L ${endX} ${endY}`;
  } else if (variant === "curved") {
    // S-curve horizontally (good for node to node)
    const midX = startX + (endX - startX) / 2;
    d = `M ${startX} ${startY} C ${midX} ${startY} ${midX} ${endY} ${endX} ${endY}`;
  } else {
    // Multi-hop (stair step logic)
    const midX = startX + (endX - startX) / 2;
    d = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
  }

  const isStatic = motionMode === "static";
  const color = state === "idle" ? idleColor : state === "error" ? "var(--destructive)" : activeColor;

  return (
    <div className={`absolute inset-0 pointer-events-none z-0 ${className}`}>
      <svg className="w-full h-full overflow-visible">
        {/* Base Path (Idle state / Guide path) */}
        <path
          d={d}
          fill="none"
          stroke={idleColor}
          strokeWidth={strokeWidth}
          strokeDasharray="4 4"
          className="opacity-50"
        />

        {/* Active Path that draws itself over the base path */}
        {state !== "idle" && (
          <motion.path
            id={`path-${pathId}`}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            initial={isStatic ? { pathLength: 1, opacity: 0.6 } : { pathLength: 0, opacity: 0 }}
            animate={isStatic ? {} : { pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            style={{
              filter: `drop-shadow(0 0 4px ${color})` // Glow effect
            }}
          />
        )}
      </svg>

      {/* Animated Data Packets that travel along the path */}
      {showPacket && state === "active" && !isStatic && Array.from({ length: packetFrequency }).map((_, i) => (
        <div key={i} style={{ offsetPath: `path("${d}")` }} className="absolute top-0 left-0">
          <DataPacket 
            color={color} 
            duration={packetSpeed} 
            delay={i * (packetSpeed / packetFrequency)} 
          />
        </div>
      ))}
    </div>
  );
}
