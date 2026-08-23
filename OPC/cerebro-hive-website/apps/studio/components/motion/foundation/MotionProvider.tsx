"use client";

import React, { createContext, useContext, useState, useSyncExternalStore, ReactNode } from "react";
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

type ThemeVariants = {
  dark: Variants;
  light: Variants;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isThemeVariants(value: unknown): value is ThemeVariants {
  return isRecord(value) && isRecord(value.dark) && isRecord(value.light);
}

function subscribeToReducedMotion(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getPrefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribeToHydration() {
  return () => undefined;
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [requestedLevel, setLevel] = useState<MotionLevel>("immersive");
  const mounted = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const prefersReducedMotion = useSyncExternalStore(subscribeToReducedMotion, getPrefersReducedMotion, () => false);
  const level = prefersReducedMotion ? "reduced" : requestedLevel;

  const getVariant = (component: MotionComponent, intent: string): Variants => {
    const theme = mounted && (resolvedTheme === "dark" || resolvedTheme === "light") ? resolvedTheme : "dark";
    const themeVariants: unknown = Reflect.get(motionRegistry[component], intent);
    
    if (!isThemeVariants(themeVariants)) {
      console.warn(`[CerebroMotion] Missing variant for ${component}.${intent}`);
      return {};
    }
    
    const variant = themeVariants[theme] || themeVariants.dark;
    
    if (level === "reduced") {
      const reducedVariant: Variants = {};
      for (const key in variant) {
        const source = variant[key];
        if (isRecord(source)) {
            const opacity = source.opacity;
            reducedVariant[key] = {
                opacity: typeof opacity === "number" || typeof opacity === "string" ? opacity : 1,
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

