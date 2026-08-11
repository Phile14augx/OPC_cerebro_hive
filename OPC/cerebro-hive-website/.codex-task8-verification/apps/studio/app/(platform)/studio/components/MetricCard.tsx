"use client";
import React from 'react';
import { GlassPanel } from './GlassPanel';

export function MetricCard({ label, value, trend, colorClass = "text-blue-400" }: { label: string, value: string, trend?: string, colorClass?: string }) {
  return (
    <GlassPanel className="p-4 flex flex-col justify-center">
      <span className="text-neutral-400 text-sm mb-1">{label}</span>
      <div className="flex items-end justify-between">
        <span className={`text-3xl font-bold ${colorClass}`}>{value}</span>
        {trend && (
          <span className="text-xs font-mono text-neutral-500 mb-1">{trend}</span>
        )}
      </div>
    </GlassPanel>
  );
}
