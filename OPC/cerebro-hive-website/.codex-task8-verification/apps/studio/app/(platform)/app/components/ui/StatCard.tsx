import React from "react";
import { ArrowUpRight, AlertCircle, LucideIcon } from "lucide-react";
import { Card, CardContent } from "./Card";
import { cn } from "./utils";

export interface StatCardProps {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatCard({ label, value, change, icon: Icon, trend = "neutral", className }: StatCardProps) {
  return (
    <Card className={cn("flex flex-col gap-4 p-5", className)}>
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
          <Icon size={18} className="text-text-primary" />
        </div>
        
        {trend === 'up' && (
          <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">
            <ArrowUpRight size={12} /> {change.split(' ')[0]}
          </span>
        )}
        
        {trend === 'down' && (
          <span className="flex items-center gap-1 text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-lg">
            <AlertCircle size={12} /> Issues
          </span>
        )}
        
        {trend === 'neutral' && (
          <span className="flex items-center gap-1 text-xs font-bold text-text-secondary bg-surface-elevated px-2 py-1 rounded-lg">
            {change.split(' ')[0]}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-bold text-text-muted">{label}</p>
        <h3 className="text-2xl font-space font-bold text-text-primary mt-1">{value}</h3>
        <p className="text-xs text-text-secondary mt-2">{change}</p>
      </div>
    </Card>
  );
}
