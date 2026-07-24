"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MissionControl } from "./backgrounds/MissionControl";
import { ExecutiveBlueprint } from "./backgrounds/ExecutiveBlueprint";
import { withBasePath } from "@/lib/utils";

interface BackgroundEngineProps {
  // We can support specific overrides later (e.g. type="dashboard")
  type?: "hero" | "research" | "minimal";
}

/**
 * CerebroMotion™: Background Engine
 * Orchestrates ambient backgrounds, delegating to the appropriate theme-aware system.
 */
export function BackgroundEngine({ type = "hero" }: BackgroundEngineProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="absolute inset-0 z-0 bg-background pointer-events-none" />;
  }

  const isLight = resolvedTheme === "light";

  return (
    <div className="absolute inset-0 z-0 pointer-events-none bg-background overflow-hidden">
      {isLight ? <ExecutiveBlueprint /> : <MissionControl />}
      
      {/* Universal Noise Overlay for texture */}
      <div 
        className="absolute inset-0 mix-blend-overlay opacity-[0.03] dark:opacity-[0.05]" 
        style={{ backgroundImage: `url('${withBasePath('/images/noise.png')}')` }} 
      />
    </div>
  );
}
