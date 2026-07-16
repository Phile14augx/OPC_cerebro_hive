"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useMotionCapabilities, MotionCapabilities } from "./accessibility";

interface MotionContextType extends MotionCapabilities {
  // Future global state: e.g. pause all animations
  isPaused: boolean;
}

const MotionContext = createContext<MotionContextType>({
  performanceTier: "high",
  motionMode: "full",
  isPaused: false,
});

export function MotionProvider({ children }: { children: ReactNode }) {
  const capabilities = useMotionCapabilities();

  return (
    <MotionContext.Provider value={{ ...capabilities, isPaused: false }}>
      {children}
    </MotionContext.Provider>
  );
}

export function useMotionConfig() {
  return useContext(MotionContext);
}
