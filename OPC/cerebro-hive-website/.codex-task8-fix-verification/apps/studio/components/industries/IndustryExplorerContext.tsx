"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface IndustryExplorerState {
  activeIndustry: string | null;
  hoveredIndustry: string | null;
  selectedCapability: string | null;
  selectedSolution: string | null;
  backgroundTheme: string;
  animationState: 'idle' | 'transitioning' | 'active';
  globeRotation: number;
  reducedMotion: boolean;
  
  setActiveIndustry: (id: string | null) => void;
  setHoveredIndustry: (id: string | null) => void;
  setSelectedCapability: (id: string | null) => void;
  setGlobeRotation: (rotation: number) => void;
}

const IndustryExplorerContext = createContext<IndustryExplorerState | undefined>(undefined);

export function IndustryExplorerProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlIndustry = searchParams?.get('industry');

  const [activeIndustry, setActiveIndustryState] = useState<string | null>(urlIndustry || 'healthcare');
  const [hoveredIndustry, setHoveredIndustry] = useState<string | null>(null);
  const [selectedCapability, setSelectedCapability] = useState<string | null>(null);
  const [selectedSolution, setSelectedSolution] = useState<string | null>(null);
  const [backgroundTheme, setBackgroundTheme] = useState<string>('default');
  const [animationState, setAnimationState] = useState<'idle' | 'transitioning' | 'active'>('idle');
  const [globeRotation, setGlobeRotation] = useState<number>(0);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const setActiveIndustry = (id: string | null) => {
    if (id === activeIndustry) return;
    
    setAnimationState('transitioning');
    setActiveIndustryState(id);
    
    // Update URL without full navigation
    if (id) {
      router.push(`/industries?industry=${id}`, { scroll: false });
    } else {
      router.push(`/industries`, { scroll: false });
    }

    // Simulate transition end
    setTimeout(() => {
      setAnimationState('active');
    }, 800);
  };

  return (
    <IndustryExplorerContext.Provider
      value={{
        activeIndustry,
        hoveredIndustry,
        selectedCapability,
        selectedSolution,
        backgroundTheme,
        animationState,
        globeRotation,
        reducedMotion,
        setActiveIndustry,
        setHoveredIndustry,
        setSelectedCapability,
        setGlobeRotation,
      }}
    >
      {children}
    </IndustryExplorerContext.Provider>
  );
}

export function useIndustryExplorer() {
  const context = useContext(IndustryExplorerContext);
  if (context === undefined) {
    throw new Error('useIndustryExplorer must be used within an IndustryExplorerProvider');
  }
  return context;
}
