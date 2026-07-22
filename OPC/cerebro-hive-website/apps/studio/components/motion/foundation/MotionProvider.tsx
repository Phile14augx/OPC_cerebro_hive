"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useTheme } from "next-themes";
import { motionRegistry, MotionComponent } from "../registry";
import { Variants } from "framer-motion";

export type MotionLevel = "reduced" | "balanced" | "immersive";

interface MotionContextValue {
  level: MotionLevel;
  setLevel: (level: MotionLevel) => void;
  getVariant: (component: MotionComponent, intent: string) => Variants;
}

const MotionContext = createContext<MotionContextValue | undefined>(undefined);

export function MotionProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [level, setLevel] = useState<MotionLevel>("immersive");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setLevel("reduced");
    }
  }, []);

  const getVariant = (component: MotionComponent, intent: string): Variants => {
    const theme = (mounted ? resolvedTheme : "dark") as "dark" | "light";
    
    // @ts-ignore
    const themeVariants = motionRegistry[component]?.[intent];
    
    if (!themeVariants) {
      console.warn(`[CerebroMotion] Missing variant for ${component}.${intent}`);
      return {};
    }
    
    const variant = themeVariants[theme] || themeVariants.dark;
    
    if (level === "reduced") {
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

export function useCerebroMotion() {
  const context = useContext(MotionContext);
  if (context === undefined) {
    throw new Error("useCerebroMotion must be used within a MotionProvider");
  }
  return context;
}

