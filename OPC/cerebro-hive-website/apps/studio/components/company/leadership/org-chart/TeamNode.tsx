import React from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { OrganizationNodeData } from '@/lib/services/organizationService';
import { cn } from '@/lib/utils';

const themeConfig: Record<string, { colorClass: string }> = {
  engineering: { colorClass: 'border-blue-500' },
  research: { colorClass: 'border-purple-500' },
  consulting: { colorClass: 'border-cyan-500' },
  business: { colorClass: 'border-orange-500' }
};

export const TeamNode = ({ data, selected }: NodeProps<Node<OrganizationNodeData>>) => {
  const config = themeConfig[data.theme as string] || themeConfig.engineering;

  return (
    <div className={cn(
      "relative w-[180px] rounded-lg overflow-hidden transition-all duration-300",
      "bg-surface border border-border shadow-sm",
      selected ? "ring-1 ring-white/20 scale-[1.02]" : "hover:border-border-strong cursor-pointer hover:bg-surface-elevated"
    )}>
      <div className={cn("h-1 w-full bg-surface", config.colorClass, "border-t")} />
      
      <div className="p-3">
        <h5 className="text-xs font-space font-bold text-text-primary mb-1 leading-tight">{data.title}</h5>
        <p className="text-[10px] text-text-muted font-inter mb-3 line-clamp-1">{data.subtitle}</p>
        
        {data.metrics && (
          <div className="flex gap-2">
            <span className="text-[9px] font-mono text-text-secondary bg-background px-1.5 py-0.5 rounded">
              {data.metrics.employees} People
            </span>
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-background !border border-border" />
    </div>
  );
};
