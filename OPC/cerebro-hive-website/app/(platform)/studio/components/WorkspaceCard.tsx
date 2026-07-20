"use client";
import React from 'react';
import { GlassPanel } from './GlassPanel';

export function WorkspaceCard({ title, children, className = "" }: { title: string, children: React.ReactNode, className?: string }) {
  return (
    <GlassPanel className={`flex flex-col overflow-hidden ${className}`}>
      <div className="p-4 border-b border-neutral-700/50 bg-neutral-800/30">
        <h2 className="text-lg font-medium text-neutral-100">{title}</h2>
      </div>
      <div className="flex-grow p-4">
        {children}
      </div>
    </GlassPanel>
  );
}
