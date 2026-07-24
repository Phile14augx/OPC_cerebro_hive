"use client";

import React from "react";

interface MetricTileProps {
  label:      string;
  value:      string | number;
  sub?:       string;
  trend?:     { value: string; positive: boolean };
  icon?:      React.ReactNode;
  className?: string;
  loading?:   boolean;
}

export function MetricTile({ label, value, sub, trend, icon, className = "", loading }: MetricTileProps) {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur-sm ${className}`}>
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 opacity-30"
           style={{ background: "radial-gradient(circle at 80% 20%, rgba(99,102,241,0.15), transparent 60%)" }} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-24 animate-pulse rounded-md bg-neutral-800" />
          ) : (
            <p className="mt-1 text-3xl font-bold tracking-tight text-white">{value}</p>
          )}
          {sub && <p className="mt-1 text-xs text-neutral-500">{sub}</p>}
          {trend && (
            <span className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${
              trend.positive ? "text-emerald-400" : "text-red-400"
            }`}>
              <span>{trend.positive ? "↑" : "↓"}</span>
              {trend.value}
            </span>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-800/60 text-neutral-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
