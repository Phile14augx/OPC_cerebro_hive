"use client";

import React, { createContext, useContext, useState, useSyncExternalStore, ReactNode } from 'react';

export type ScrollStage = "disconnected" | "core" | "services" | "connections" | "orchestration" | "autonomous";
export type NetworkMode = "idle" | "hover" | "transition" | "active";

export interface ServiceAnimationState {
  activeService: string | null;
  hoveredService: string | null;
  scrollStage: ScrollStage;
  networkMode: NetworkMode;
  cursorPosition: { x: number; y: number };
  backgroundColor: string;
  reducedMotion: boolean;
  
  // Setters
  setActiveService: (id: string | null) => void;
  setHoveredService: (id: string | null) => void;
  setScrollStage: (stage: ScrollStage) => void;
  setNetworkMode: (mode: NetworkMode) => void;
  setCursorPosition: (pos: { x: number; y: number }) => void;
  setBackgroundColor: (color: string) => void;
}

const ServiceAnimationContext = createContext<ServiceAnimationState | undefined>(undefined);

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const subscribeToReducedMotion = (notify: () => void) => {
  const mediaQuery = window.matchMedia(reducedMotionQuery);
  mediaQuery.addEventListener("change", notify);
  return () => mediaQuery.removeEventListener("change", notify);
};
const getReducedMotionSnapshot = () => window.matchMedia(reducedMotionQuery).matches;
const getServerReducedMotionSnapshot = () => false;

export const ServiceAnimationProvider = ({ children }: { children: ReactNode }) => {
  const [activeService, setActiveService] = useState<string | null>(null);
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  const [scrollStage, setScrollStage] = useState<ScrollStage>("disconnected");
  const [networkMode, setNetworkMode] = useState<NetworkMode>("idle");
  const [cursorPosition, setCursorPosition] = useState({ x: -100, y: -100 });
  const [backgroundColor, setBackgroundColor] = useState<string>("transparent");

  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot,
  );

  return (
    <ServiceAnimationContext.Provider
      value={{
        activeService,
        hoveredService,
        scrollStage,
        networkMode,
        cursorPosition,
        backgroundColor,
        reducedMotion,
        setActiveService,
        setHoveredService,
        setScrollStage,
        setNetworkMode,
        setCursorPosition,
        setBackgroundColor,
      }}
    >
      {children}
    </ServiceAnimationContext.Provider>
  );
};

export const useServiceAnimation = () => {
  const context = useContext(ServiceAnimationContext);
  if (context === undefined) {
    throw new Error("useServiceAnimation must be used within a ServiceAnimationProvider");
  }
  return context;
};
