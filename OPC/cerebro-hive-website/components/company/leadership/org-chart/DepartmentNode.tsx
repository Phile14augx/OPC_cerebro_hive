import React from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { OrganizationNodeData } from '@/lib/services/organizationService';
import { cn } from '@/lib/utils';
import { Code, Lightbulb, TrendingUp, Briefcase } from 'lucide-react';

const themeConfig: Record<string, { color: string, icon: React.ReactNode, borderClass: string, shadowClass: string, textClass: string }> = {
  engineering: { color: '#3B82F6', icon: <Code size={16} />, borderClass: 'border-blue-500/50', shadowClass: 'shadow-[inset_0_0_20px_rgba(59,130,246,0.1)] hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]', textClass: 'text-blue-500' },
  research: { color: '#A855F7', icon: <Lightbulb size={16} />, borderClass: 'border-purple-500/50', shadowClass: 'shadow-[inset_0_0_20px_rgba(168,85,247,0.1)] hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]', textClass: 'text-purple-500' },
  consulting: { color: '#06B6D4', icon: <Briefcase size={16} />, borderClass: 'border-cyan-500/50', shadowClass: 'shadow-[inset_0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]', textClass: 'text-cyan-500' },
  business: { color: '#F97316', icon: <TrendingUp size={16} />, borderClass: 'border-orange-500/50', shadowClass: 'shadow-[inset_0_0_20px_rgba(249,115,22,0.1)] hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]', textClass: 'text-orange-500' }
};

export const DepartmentNode = ({ data, selected }: NodeProps<Node<OrganizationNodeData>>) => {
  const config = themeConfig[data.theme as string] || themeConfig.engineering;

  return (
    <div className={cn(
      "relative w-[240px] rounded-xl overflow-hidden transition-all duration-300",
      "bg-[#0a0f12]/90 backdrop-blur-md border-t-2 border-b border-l border-r border-border",
      config.borderClass, config.shadowClass,
      selected ? "scale-[1.02] -translate-y-2 ring-1 ring-white/20" : "hover:-translate-y-2 cursor-pointer"
    )}>
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn("w-8 h-8 rounded bg-white/5 flex items-center justify-center", config.textClass)}>
            {config.icon}
          </div>
          <div>
            <h4 className="text-sm font-space font-bold text-text-primary">{data.title}</h4>
          </div>
        </div>

        {data.capabilities && (
          <ul className="mb-5 flex flex-col gap-1">
            {data.capabilities.slice(0, 4).map((cap, i) => (
              <li key={i} className="text-[11px] text-text-secondary font-inter leading-relaxed flex items-center gap-2">
                <span className={cn("w-1 h-1 rounded-full", config.textClass.replace('text', 'bg'))} /> {cap}
              </li>
            ))}
          </ul>
        )}

        {data.metrics && (
          <div className="flex justify-between items-end border-t border-border pt-3">
            <span className="text-[10px] font-inter text-text-muted">{data.metrics.employees} Engineers • {data.metrics.projects} Products</span>
            {data.hasChildren && (
              <span className={cn("text-[10px] font-space font-bold uppercase", config.textClass)}>
                Explore →
              </span>
            )}
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-background !border-2 !border-white/20" />
      <Handle type="source" position={Position.Bottom} className={cn("w-3 h-3 !border-2 !border-black", config.textClass.replace('text-', '!bg-'))} />
    </div>
  );
};
