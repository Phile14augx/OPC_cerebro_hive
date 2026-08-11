"use client";

import { useEffect, useState } from "react";
import { platformRegistry } from "../../../app/platform/hiveforge/core/registry/PlatformRegistry";
import { NavigationNode } from "../../../app/platform/hiveforge/core/contracts/plugin";

export function Sidebar() {
  const [nodes, setNodes] = useState<NavigationNode[]>([]);

  useEffect(() => {
    // Fetch generated navigation from metadata
    setNodes(platformRegistry.getNavigationNodes().sort((a, b) => a.priority - b.priority));
  }, []);

  const renderNodesByLocation = (location: string) => {
    return nodes
      .filter((n) => n.location === location)
      .map((node) => (
        <div key={node.id} className="cursor-pointer px-3 py-1.5 text-sm text-text-secondary hover:bg-surface hover:text-text-primary rounded-md transition-colors flex items-center gap-2">
          {node.icon && <span>{node.icon}</span>}
          {node.title}
        </div>
      ));
  };

  return (
    <aside className="w-64 border-r border-border bg-surface/30 flex flex-col h-full overflow-y-auto hidden md:flex">
      <div className="p-4 border-b border-border">
        <div className="font-bold text-lg text-primary-accent tracking-wide">HiveForge 2.0</div>
        <div className="text-xs text-text-secondary">Enterprise Engineering Cloud</div>
      </div>

      <div className="flex-1 p-2 space-y-4 overflow-y-auto">
        <div>
          <div className="px-3 mb-1 text-xs font-semibold text-text-secondary uppercase tracking-wider">Workspace</div>
          {renderNodesByLocation("workspace")}
        </div>
        
        {nodes.some(n => n.location === "pinned") && (
          <div>
            <div className="px-3 mb-1 text-xs font-semibold text-text-secondary uppercase tracking-wider">Pinned</div>
            {renderNodesByLocation("pinned")}
          </div>
        )}

        <div>
          <div className="px-3 mb-1 text-xs font-semibold text-text-secondary uppercase tracking-wider">Clouds</div>
          {renderNodesByLocation("clouds")}
        </div>

        <div>
          <div className="px-3 mb-1 text-xs font-semibold text-text-secondary uppercase tracking-wider">Marketplace</div>
          {renderNodesByLocation("marketplace")}
        </div>
        
        <div>
          <div className="px-3 mb-1 text-xs font-semibold text-text-secondary uppercase tracking-wider">Administration</div>
          {renderNodesByLocation("administration")}
        </div>
      </div>
    </aside>
  );
}
