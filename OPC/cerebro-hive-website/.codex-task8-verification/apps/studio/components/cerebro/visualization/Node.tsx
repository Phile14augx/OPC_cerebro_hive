"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { motionTokens, visualTokens } from "@/lib/design-system/tokens";

interface NodeProps {
  icon: ReactNode;
  label?: string;
  size?: "sm" | "md" | "lg";
  isActive?: boolean;
  className?: string;
  delay?: number;
}

export function Node({
  icon,
  label,
  size = "md",
  isActive = false,
  className = "",
  delay = 0,
}: NodeProps) {
  const sizeClasses = {
    sm: "w-12 h-12 text-lg",
    md: "w-16 h-16 text-2xl",
    lg: "w-24 h-24 text-4xl",
  };

  return (
    <motion.div
      className={`relative flex flex-col items-center justify-center gap-3 ${className}`}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: motionTokens.duration.normal,
        ease: motionTokens.easing.spring,
        delay,
      }}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          flex items-center justify-center rounded-2xl border 
          ${sizeClasses[size]} 
          ${
            isActive
              ? "bg-primary-accent/20 border-primary-accent text-primary-accent shadow-[0_0_20px_rgba(0,229,255,0.4)]"
              : "bg-white/5 dark:bg-black/20 border-white/10 dark:border-white/5 text-slate-400 hover:text-white"
          }
          backdrop-blur-md transition-colors cursor-pointer
        `}
      >
        {icon}
      </motion.div>
      {label && (
        <span className="text-sm font-space font-medium text-slate-300 whitespace-nowrap">
          {label}
        </span>
      )}
    </motion.div>
  );
}
