"use client";

import { useState, useEffect } from "react";

export type PerformanceTier = "high" | "medium" | "low";
export type MotionMode = "full" | "reduced" | "static";

export interface MotionCapabilities {
  performanceTier: PerformanceTier;
  motionMode: MotionMode;
}

/**
 * Hook to detect device capabilities and user preferences
 * for degrading motion complexity gracefully.
 */
export function useMotionCapabilities(): MotionCapabilities {
  const [capabilities, setCapabilities] = useState<MotionCapabilities>({
    performanceTier: "high",
    motionMode: "full"
  });

  useEffect(() => {
    // Detect prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isReduced = mediaQuery.matches;

    // Detect connection speed (NetworkInformation API if available)
    const nav = navigator as any;
    const isSlowConnection = nav.connection && (nav.connection.saveData || nav.connection.effectiveType === "2g" || nav.connection.effectiveType === "3g");

    // Hardware concurrency as a rough proxy for CPU power
    const cores = navigator.hardwareConcurrency || 4;
    
    let tier: PerformanceTier = "high";
    if (cores <= 2 || isSlowConnection) {
      tier = "low";
    } else if (cores <= 4) {
      tier = "medium";
    }

    let mode: MotionMode = "full";
    if (isReduced) {
      mode = "static";
    } else if (tier === "low") {
      mode = "reduced";
    }

    setCapabilities({ performanceTier: tier, motionMode: mode });

    const handleChange = (e: MediaQueryListEvent) => {
      setCapabilities(prev => ({
        ...prev,
        motionMode: e.matches ? "static" : (prev.performanceTier === "low" ? "reduced" : "full")
      }));
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return capabilities;
}
