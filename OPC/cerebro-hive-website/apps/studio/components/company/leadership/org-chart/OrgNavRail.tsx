"use client";

import React from 'react';
import { Hexagon, Briefcase, Code, Lightbulb, TrendingUp, Settings, Search } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { useOrganizationWorkspace } from './OrganizationWorkspaceContext';
import { cn } from '@/lib/utils';

const navItems = [
  { id: 'ceo', label: 'CEO', icon: <Hexagon size={18} />, color: 'hover:text-amber-500 hover:bg-amber-500/10' },
  { id: 'engineering', label: 'Engineering', icon: <Code size={18} />, color: 'hover:text-blue-500 hover:bg-blue-500/10' },
  { id: 'research', label: 'Research', icon: <Lightbulb size={18} />, color: 'hover:text-purple-500 hover:bg-purple-500/10' },
  { id: 'consulting', label: 'Consulting', icon: <Briefcase size={18} />, color: 'hover:text-cyan-500 hover:bg-cyan-500/10' },
  { id: 'business', label: 'Business', icon: <TrendingUp size={18} />, color: 'hover:text-orange-500 hover:bg-orange-500/10' }
];

export const OrgNavRail = () => {
  const { setCenter, getNode } = useReactFlow();
  const { setHoveredNodeId } = useOrganizationWorkspace();

  const handleNavClick = (nodeId: string) => {
    const node = getNode(nodeId);
    if (node) {
      setCenter(node.position.x + (node.width || 0) / 2, node.position.y + (node.height || 0) / 2, { zoom: 1, duration: 800 });
    }
  };

  return (
    <div className="absolute top-0 left-0 bottom-0 w-16 bg-[#030608] border-r border-border flex flex-col items-center py-6 z-40">
      
      {/* Monogram */}
      <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-primary font-space font-bold text-sm mb-8 shadow-inner cursor-pointer" onClick={() => handleNavClick('ceo')}>
        CH
      </div>

      <div className="flex-1 flex flex-col gap-4 w-full px-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            onMouseEnter={() => setHoveredNodeId(item.id)}
            onMouseLeave={() => setHoveredNodeId(null)}
            className={cn(
              "relative group w-10 h-10 rounded-lg flex items-center justify-center text-text-muted transition-all duration-200",
              item.color
            )}
          >
            {item.icon}
            
            {/* Tooltip */}
            <div className="absolute left-14 px-2 py-1 bg-surface-elevated border border-border rounded text-[10px] font-space font-bold text-text-primary uppercase tracking-wider opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
              {item.label}
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 w-full px-3 pt-6 border-t border-border">
        <button className="w-10 h-10 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface transition-all">
          <Search size={18} />
        </button>
        <button className="w-10 h-10 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface transition-all">
          <Settings size={18} />
        </button>
      </div>

    </div>
  );
};
