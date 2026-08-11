"use client";

import { useEffect, useState } from "react";
import { URD } from "../../../app/platform/hiveforge/core/contracts/resource";

export function Topbar() {
  const [activeResource, setActiveResource] = useState<URD | null>(null);

  // Dynamic Graph-Aware Breadcrumbs
  const breadcrumbs = [
    "CerebroHive Corp", // Org
    "Data Platform",    // Workspace
    "Production",       // Env
    activeResource ? activeResource.type : "Dashboard"
  ];

  return (
    <header className="h-14 border-b border-border bg-surface/20 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center text-sm text-text-secondary gap-2">
        {breadcrumbs.map((crumb, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className={idx === breadcrumbs.length - 1 ? "text-text-primary font-medium" : "hover:text-text-primary cursor-pointer transition-colors"}>
              {crumb}
            </span>
            {idx < breadcrumbs.length - 1 && <span>/</span>}
          </div>
        ))}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-xs text-text-secondary border border-border bg-surface/50 px-2 py-1 rounded shadow-sm">
          Press <kbd className="font-mono text-primary-accent">Ctrl+K</kbd> to search
        </div>
        <div className="h-8 w-8 rounded-full bg-primary-accent/20 border border-primary-accent/30 flex items-center justify-center text-primary-accent text-xs font-bold cursor-pointer hover:bg-primary-accent/30 transition-colors">
          CH
        </div>
      </div>
    </header>
  );
}
