"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ORB_SIZES, ORB_COLORS, ORB_TIMING } from "./config";
import type { NeuralOrbProps } from "./types";

export const NeuralOrb = ({
  size = "md",
  color = "cyan",
  state = "idle",
  variant = "default",
  pulse = true,
  interactive = true,
  scrollProgress,
  children,
  className,
  onClick,
}: NeuralOrbProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

  const S = ORB_SIZES[size];
  const C = ORB_COLORS[color];

  const isActive    = state === "active";
  const isCompleted = state === "completed";
  const isThinking  = state === "thinking";
  const isUpcoming  = state === "upcoming";
  const isIdle      = state === "idle";

  // Scroll-sync: if scrollProgress provided, use it to scale brightness
  const brightness = scrollProgress !== undefined
    ? scrollProgress
    : isActive ? 1 : isCompleted ? 0.65 : isIdle ? 0.4 : 0.15;

  // Dynamic animation speeds on hover / thinking
  const ringSpeed     = isHovered ? ORB_TIMING.rotate / 3 : isThinking ? ORB_TIMING.rotate / 4 : ORB_TIMING.rotate;
  const particleSpeed = isHovered ? ORB_TIMING.particle / 2.5 : isThinking ? ORB_TIMING.particle / 2 : ORB_TIMING.particle;

  // Trigger periodic pulse wave
  useEffect(() => {
    if (!pulse || isUpcoming) return;
    const id = setInterval(() => setPulseKey(k => k + 1), ORB_TIMING.pulseInterval * 1000);
    return () => clearInterval(id);
  }, [pulse, isUpcoming]);

  // ─── Derived visual values ────────────────────────────────────────
  const haloOpacity  = isUpcoming ? 0.05 : brightness * (isHovered ? 0.35 : 0.22);
  const haloScale    = isHovered ? [1, 1.10, 1] : [1, 1.06, 1];
  const ringOpacity  = isUpcoming ? 0.1 : isCompleted ? 0.4 : brightness * (isHovered ? 0.7 : 0.45);

  // Border color cycling for active / thinking states
  const borderColors = (isActive || isThinking || isHovered)
    ? C.gradient
    : isCompleted
    ? [`rgba(${C.rgb},0.6)`, `rgba(${C.rgb},0.4)`, `rgba(${C.rgb},0.6)`]
    : [`rgba(128,128,128,${isHovered ? 0.35 : 0.18})`];

  const borderTransition = (isActive || isThinking)
    ? { duration: 20, ease: "linear" as const, repeat: Infinity }
    : isCompleted
    ? { duration: 3, ease: "easeInOut" as const, repeat: Infinity }
    : { duration: ORB_TIMING.hover };

  return (
    <div
      className={cn("relative flex items-center justify-center shrink-0 select-none", className)}
      style={{ width: S.outer, height: S.outer }}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >

      {/* ── Layer 1: Ambient Halo (breathing glow) ─────────────────── */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        animate={{
          scale:   haloScale,
          opacity: isUpcoming
            ? [0.04, 0.07, 0.04]
            : [haloOpacity * 0.65, haloOpacity, haloOpacity * 0.65],
        }}
        transition={{
          duration: ORB_TIMING.breathe,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        style={{
          boxShadow: `0 0 ${S.haloBlur * 2.5}px ${S.haloBlur * 0.6}px rgba(${C.rgb},${haloOpacity})`,
          willChange: "transform, opacity",
        }}
      />

      {/* ── Layer 2: Rotating Segmented Ring (SVG) ─────────────────── */}
      {!isUpcoming && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: ringSpeed, ease: "linear", repeat: Infinity }}
          style={{ willChange: "transform" }}
        >
          <svg
            width={S.outer}
            height={S.outer}
            viewBox={`0 0 ${S.outer} ${S.outer}`}
            className="absolute inset-0 overflow-visible"
          >
            <circle
              cx={S.outer / 2}
              cy={S.outer / 2}
              r={S.outer / 2 - 1}
              fill="none"
              stroke={`rgba(${C.rgb},${ringOpacity})`}
              strokeWidth={S.ringStroke}
              strokeDasharray="3 6"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
      )}

      {/* ── Layer 3: Gradient Border Sweep (color-cycling border) ───── */}
      {/* Sits just outside the core; visible only when active/hovering */}
      <AnimatePresence>
        {(isActive || isThinking || isHovered) && (
          <motion.div
            key="gradient-ring"
            className="absolute rounded-full pointer-events-none"
            style={{
              width: S.core + 4,
              height: S.core + 4,
              top: "50%",
              left: "50%",
              translate: "-50% -50%",
              padding: "1.5px",
              background: `conic-gradient(from 0deg, ${C.gradient.join(", ")})`,
              borderRadius: "50%",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, ease: "linear", repeat: Infinity }}
            initial={{ opacity: 0, scale: 0.9 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {/* Inner cutout — transparent so core shows through */}
            <div
              className="w-full h-full rounded-full"
              style={{ background: "transparent" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Layer 4: Orbital Particle ───────────────────────────────── */}
      {!isUpcoming && (
        <motion.div
          className="absolute pointer-events-none"
          style={{ width: S.outer, height: S.outer, willChange: "transform" }}
          animate={{ rotate: 360 }}
          transition={{ duration: particleSpeed, ease: "linear", repeat: Infinity }}
        >
          {/* Particle sits at 12 o'clock, orbits via parent rotation */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: S.particle,
              height: S.particle,
              top: 0,
              left: "50%",
              marginLeft: -(S.particle / 2),
              marginTop: -(S.particle / 2),
              backgroundColor: `rgba(${C.rgb},${isActive || isHovered ? 1 : 0.6})`,
              boxShadow: `0 0 ${S.particle * 3}px ${S.particle}px rgba(${C.rgb},${isActive ? 0.7 : 0.3})`,
            }}
          />
        </motion.div>
      )}

      {/* ── Layer 5: Pulse Wave (radar ripple) ─────────────────────── */}
      <AnimatePresence mode="wait">
        {pulse && !isUpcoming && (
          <motion.div
            key={pulseKey}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              border: `1px solid rgba(${C.rgb},0.6)`,
            }}
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 2.4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: ORB_TIMING.pulseDuration, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* ── Layer 6: Core ──────────────────────────────────────────── */}
      <motion.div
        className="relative z-10 rounded-full flex items-center justify-center overflow-hidden"
        style={{ width: S.core, height: S.core }}
        animate={{
          borderColor: borderColors,
          boxShadow: isActive
            ? [
                `0 0 ${S.haloBlur}px rgba(${C.rgb},0.4), inset 0 0 ${S.haloBlur / 2}px rgba(${C.rgb},0.12)`,
                `0 0 ${S.haloBlur * 1.5}px rgba(${C.rgb},0.6), inset 0 0 ${S.haloBlur}px rgba(${C.rgb},0.2)`,
                `0 0 ${S.haloBlur}px rgba(${C.rgb},0.4), inset 0 0 ${S.haloBlur / 2}px rgba(${C.rgb},0.12)`,
              ]
            : isHovered
            ? `0 0 ${S.haloBlur * 0.75}px rgba(${C.rgb},0.35)`
            : "0 0 0px rgba(0,0,0,0)",
          backgroundColor: isActive
            ? `rgba(${C.rgb},0.07)`
            : isThinking
            ? `rgba(${C.rgb},0.05)`
            : "transparent",
          scale: isHovered ? 1.06 : 1,
        }}
        transition={borderTransition}
        style={{
          border: "1px solid transparent",
          willChange: "transform, box-shadow",
        }}
      >
        {/* Inner core dot — shown when no children */}
        {!children && (
          <motion.div
            className="rounded-full"
            style={{ width: S.core * 0.38, height: S.core * 0.38 }}
            animate={{
              backgroundColor: isActive || isCompleted
                ? `rgba(${C.rgb},${isHovered ? 1 : 0.9})`
                : `rgba(160,160,160,0.4)`,
              scale: isActive
                ? [1, 1.25, 1]
                : isThinking
                ? [1, 1.15, 0.9, 1]
                : 1,
              boxShadow: isActive
                ? [
                    `0 0 6px rgba(${C.rgb},0.7)`,
                    `0 0 ${S.haloBlur}px rgba(${C.rgb},1)`,
                    `0 0 6px rgba(${C.rgb},0.7)`,
                  ]
                : isCompleted
                ? `0 0 4px rgba(${C.rgb},0.5)`
                : "0 0 0px rgba(0,0,0,0)",
            }}
            transition={
              isActive
                ? { duration: 2, ease: "easeInOut", repeat: Infinity }
                : isThinking
                ? { duration: 1.2, ease: "easeInOut", repeat: Infinity }
                : { duration: ORB_TIMING.hover }
            }
          />
        )}

        {/* ── Layer 7: Icon / Content Slot ─────────────────────────── */}
        {children && (
          <motion.div
            animate={{
              opacity: isUpcoming ? 0.35 : 1,
              scale: isHovered ? 1.08 : 1,
            }}
            transition={{ duration: ORB_TIMING.hover }}
            className="flex items-center justify-center"
          >
            {children}
          </motion.div>
        )}
      </motion.div>

    </div>
  );
};

export default NeuralOrb;
