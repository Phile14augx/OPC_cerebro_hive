import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  intensity?: "low" | "medium" | "high";
}

export function GlassCard({
  children,
  className,
  interactive = false,
  intensity = "medium",
  ...props
}: GlassCardProps) {
  const intensityClasses = {
    low: "bg-card/30 border-border backdrop-blur-md",
    medium: "bg-card/50 border-border backdrop-blur-lg",
    high: "bg-card/80 border-border backdrop-blur-xl",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-300",
        intensityClasses[intensity],
        interactive && "hover:bg-card/70 hover:border-primary-accent/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4),0_0_20px_rgba(0,245,122,0.15)] hover:-translate-y-1 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
