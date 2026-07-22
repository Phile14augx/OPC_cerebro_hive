"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  icon: LucideIcon;
  color?: "emerald" | "cyan" | "purple" | "amber" | "red";
  delay?: number;
}

const colorMap = {
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: "text-emerald-400",
    text: "text-emerald-500",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    icon: "text-cyan-400",
    text: "text-cyan-500",
  },
  purple: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    icon: "text-purple-400",
    text: "text-purple-500",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: "text-amber-400",
    text: "text-amber-500",
  },
  red: {
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: "text-red-400",
    text: "text-red-500",
  }
};

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon: Icon, 
  color = "emerald", 
  delay = 0 
}: MetricCardProps) {
  const theme = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`p-4 rounded-xl border ${theme.border} bg-slate-900/30 backdrop-blur-sm relative overflow-hidden group hover:bg-slate-900/50 transition-colors`}
    >
      {/* Decorative gradient blob */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${theme.bg} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${theme.bg}`}>
              <Icon className={`w-4 h-4 ${theme.icon}`} />
            </div>
            <h3 className="text-sm font-medium text-slate-400">{title}</h3>
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-bold text-slate-100">{value}</h2>
            {trend && (
              <span className={`text-xs font-medium ${trend.isPositive ? "text-emerald-400" : "text-red-400"}`}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
            )}
          </div>
          {(subtitle || trend?.label) && (
            <p className="text-xs text-slate-500 mt-1">
              {subtitle || trend?.label}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
