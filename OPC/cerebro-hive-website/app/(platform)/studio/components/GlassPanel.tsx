"use client";
import React from 'react';

export function GlassPanel({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-neutral-800/60 backdrop-blur-md rounded-2xl border border-neutral-700/50 shadow-xl ${className}`}>
      {children}
    </div>
  );
}
