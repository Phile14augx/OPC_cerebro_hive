"use client";

import React, { useEffect, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useOrganizationWorkspace } from './OrganizationWorkspaceContext';
import { Activity, RefreshCw } from 'lucide-react';

export const OrgStatusBar = () => {
  const { getZoom } = useReactFlow();
  const { expandedNodes, selectedNode } = useOrganizationWorkspace();
  const [zoom, setZoom] = useState(100);

  // Simple polling to keep zoom updated in status bar (since useOnViewportChange might cause too many re-renders if not careful)
  useEffect(() => {
    const interval = setInterval(() => {
      setZoom(Math.round(getZoom() * 100));
    }, 500);
    return () => clearInterval(interval);
  }, [getZoom]);

  return (
    <div className="absolute bottom-0 left-16 right-0 h-10 bg-gradient-to-t from-[#030608] to-transparent pointer-events-none flex items-end justify-between px-6 pb-2 z-40">
      
      <div className="flex items-center gap-6 pointer-events-auto">
        <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted">
          <Activity size={12} className="text-emerald-500" />
          <span>System Healthy</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted">
          <RefreshCw size={12} />
          <span>Last Sync: Just now</span>
        </div>
      </div>

      <div className="flex items-center gap-6 pointer-events-auto">
        <div className="text-[10px] font-mono text-text-muted">
          Nodes Expanded: {expandedNodes.size}
        </div>
        <div className="text-[10px] font-mono text-text-muted">
          Selection: {selectedNode ? selectedNode.title : 'None'}
        </div>
        <div className="text-[10px] font-mono text-white bg-white/10 px-2 py-0.5 rounded">
          {zoom}%
        </div>
      </div>
      
    </div>
  );
};
