import React from "react";
import { cn } from "@/lib/utils";

interface PrincipleBadgeProps {
  title: string;
  variant: "cyan" | "green" | "blue" | "purple";
  className?: string;
}

const colorMap = {
  cyan: {
    bg: "bg-[#00E5FF]/5",
    border: "border-[#00E5FF]/20",
    text: "text-accent-secondary",
    glow: "shadow-[0_0_15px_rgba(0,229,255,0.1)]",
  },
  green: {
    bg: "bg-[#00F57A]/5",
    border: "border-[#00F57A]/20",
    text: "text-accent-primary",
    glow: "shadow-[0_0_15px_rgba(0,245,122,0.1)]",
  },
  blue: {
    bg: "bg-blue-500/5",
    border: "border-blue-500/20",
    text: "text-blue-500",
    glow: "shadow-[0_0_15px_rgba(59,130,246,0.1)]",
  },
  purple: {
    bg: "bg-[#9D00FF]/5",
    border: "border-[#9D00FF]/20",
    text: "text-[#9D00FF]",
    glow: "shadow-[0_0_15px_rgba(157,0,255,0.1)]",
  }
};

export const PrincipleBadge = ({ title, variant, className }: PrincipleBadgeProps) => {
  const colors = colorMap[variant];

  return (
    <div className={cn(
      "group relative inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border backdrop-blur-sm transition-all duration-300",
      "hover:-translate-y-1 hover:border-opacity-40",
      colors.bg,
      colors.border,
      colors.glow,
      className
    )}>
      {/* Outer subtle animated glow on hover */}
      <div className={cn(
        "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        "bg-gradient-to-r from-transparent via-current to-transparent mix-blend-overlay",
        colors.text
      )} />
      
      {/* Indicator dot */}
      <span className={cn("w-1.5 h-1.5 rounded-full shadow-sm", "bg-current", colors.text)} />
      
      {/* Title */}
      <span className={cn("text-xs font-space font-bold uppercase tracking-wider", colors.text)}>
        {title}
      </span>
    </div>
  );
};
