"use client";

import { useMemo, useSyncExternalStore } from "react";

export type PerformanceTier = "high" | "medium" | "low";
export type MotionMode = "full" | "reduced" | "static";

export interface MotionCapabilities {
  performanceTier: PerformanceTier;
  motionMode: MotionMode;
}

interface NetworkInformationLike {
  effectiveType?: string;
  saveData?: boolean;
}

const defaultCapabilities: MotionCapabilities = {
  performanceTier: "high",
  motionMode: "full",
};

function isNavigatorWithConnection(navigatorValue: Navigator): navigatorValue is Navigator & { connection?: NetworkInformationLike } {
  return "connection" in navigatorValue;
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

/**
 * Hook to detect device capabilities and user preferences
 * for degrading motion complexity gracefully.
 */
export function useMotionCapabilities(): MotionCapabilities {
  const isHydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const prefersReducedMotion = useSyncExternalStore(subscribeToReducedMotion, getPrefersReducedMotion, () => false);

  return useMemo(() => {
    if (!isHydrated) {
      return defaultCapabilities;
    }

    const connection = isNavigatorWithConnection(navigator) ? navigator.connection : undefined;
    const isSlowConnection = Boolean(
      connection?.saveData || connection?.effectiveType === "2g" || connection?.effectiveType === "3g",
    );
    const cores = navigator.hardwareConcurrency || 4;

    let tier: PerformanceTier = "high";
    if (cores <= 2 || isSlowConnection) {
      tier = "low";
    } else if (cores <= 4) {
      tier = "medium";
    }

    let mode: MotionMode = "full";
    if (prefersReducedMotion) {
      mode = "static";
    } else if (tier === "low") {
      mode = "reduced";
    }

    return { performanceTier: tier, motionMode: mode };
  }, [isHydrated, prefersReducedMotion]);
}
