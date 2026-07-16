"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { MotionLevel } from "@/lib/motion/tokens";
import { motionRegistry } from "@/lib/motion/registry";
import { Variants } from "framer-motion";

interface MotionContextValue {
  level: MotionLevel;
  setLevel: (level: MotionLevel) => void;
  getVariant: (component: keyof typeof motionRegistry, intent: string) => Variants;
}

const MotionContext = createContext<MotionContextValue | undefined>(undefined);

/**
 * CerebroMotion™ Provider
 * Resolves the active theme and motion level, providing pre-computed variants to components.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [level, setLevel] = useState<MotionLevel>("immersive");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Respect system preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setLevel("reduced");
    }
  }, []);

  const getVariant = (component: keyof typeof motionRegistry, intent: string): Variants => {
    // If not mounted, safely return dark variants as default to prevent hydration mismatch layout thrashing
    const theme = (mounted ? resolvedTheme : "dark") as "dark" | "light";
    
    // @ts-ignore - dynamic lookup
    const themeVariants = motionRegistry[component]?.[intent];
    
    if (!themeVariants) {
      console.warn(`[CerebroMotion] Missing variant for ${component}.${intent}`);
      return {};
    }
    
    const variant = themeVariants[theme] || themeVariants.dark;
    
    if (level === "reduced") {
      // Create a reduced motion variant (strip out translations/scales, leave only opacity)
      const reducedVariant: Variants = {};
      for (const key in variant) {
        if (typeof variant[key] === 'object' && !Array.isArray(variant[key])) {
            const state = variant[key] as any;
            reducedVariant[key] = {
                opacity: state.opacity !== undefined ? state.opacity : 1,
                transition: { duration: 0 } // instant
            };
        }
      }
      return reducedVariant;
    }
    
    return variant;
  };

  return (
    <MotionContext.Provider value={{ level, setLevel, getVariant }}>
      {children}
    </MotionContext.Provider>
  );
}

export function useMotion() {
  const context = useContext(MotionContext);
  if (context === undefined) {
    throw new Error("useMotion must be used within a MotionProvider");
  }
  return context;
}
