"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MetricChipProps {
  label: string;
  initialValue: string | number;
  status?: "success" | "warning" | "error" | "neutral";
  simulateUpdates?: boolean;
  className?: string;
}

export const MetricChip = ({ label, initialValue, status = "success", simulateUpdates = false, className }: MetricChipProps) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (!simulateUpdates || typeof initialValue !== "string") return;
    
    // Simulate tiny telemetry updates if it's a number ending in ms or %
    const isMs = initialValue.endsWith("ms");
    const isPercent = initialValue.endsWith("%");
    
    if (!isMs && !isPercent) return;
    
    const baseValue = parseFloat(initialValue.replace(/[^0-9.]/g, ""));
    if (isNaN(baseValue)) return;

    const interval = setInterval(() => {
      // Fluctuate by -1 to +1
      const fluctuation = (Math.random() * 2) - 1;
      const newValue = (baseValue + fluctuation).toFixed(isPercent ? 2 : 0);
      setValue(`${newValue}${isMs ? "ms" : "%"}`);
    }, 2500);

    return () => clearInterval(interval);
  }, [initialValue, simulateUpdates]);

  // Color mapping based on status
  const colors = {
    success: { border: "border-success/30", text: "text-success", bg: "bg-success/10", dot: "bg-success" },
    warning: { border: "border-warning/30", text: "text-warning", bg: "bg-warning/10", dot: "bg-warning" },
    error: { border: "border-error/30", text: "text-error", bg: "bg-error/10", dot: "bg-error" },
    neutral: { border: "border-border", text: "text-text-primary", bg: "bg-surface", dot: "bg-surface-elevated" }
  };

  const currentColors = colors[status];

  return (
    <div className={cn(
      "flex flex-col gap-1.5 p-3 rounded-lg border backdrop-blur-md transition-all duration-300",
      currentColors.border,
      currentColors.bg,
      "shadow-[0_4px_12px_rgba(0,0,0,0.2)]",
      className
    )}>
      <div className="flex items-center justify-between gap-4">
        <span className="text-[10px] font-space uppercase tracking-wider text-text-muted">
          {label}
        </span>
        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse shadow-sm", currentColors.dot)} />
      </div>
      <span className={cn("text-sm font-mono font-bold transition-all duration-300", currentColors.text)}>
        {value}
      </span>
    </div>
  );
};
