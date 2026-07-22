import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SolutionFlowNodeData {
  label: string;
  description: string;
  roi?: 'High' | 'Medium' | 'Emerging';
  color?: string;
  status?: string;
  href?: string;
}

const roiStyles: Record<string, string> = {
  High: 'text-accent-primary border-accent-primary/30 bg-accent-primary/10',
  Medium: 'text-warning border-warning/30 bg-warning/10',
  Emerging: 'text-accent-secondary border-accent-secondary/30 bg-accent-secondary/10',
};

export const SolutionFlowNode = ({ data }: { data: SolutionFlowNodeData }) => {
  const color = data.color || '#00F57A';
  const status = data.status || 'Active';

  return (
    <div
      className="relative w-[280px] rounded-2xl border border-border shadow-elevated overflow-hidden bg-surface-elevated/85 backdrop-blur-xl"
      style={{ borderColor: `${color}59` }}
    >
      {/* Accent top bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border"
              style={{ backgroundColor: `${color}24`, borderColor: `${color}4D`, color }}
            >
              <Sparkles size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-space font-bold text-text-primary leading-tight truncate">{data.label}</div>
              <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold">AI Solution</div>
            </div>
          </div>

          <span className="flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-text-secondary leading-relaxed mb-4 line-clamp-3">
          {data.description}
        </p>

        {/* Footer meta row */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/60">
          {data.roi && (
            <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border', roiStyles[data.roi])}>
              {data.roi} ROI
            </span>
          )}
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            {status}
          </span>
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-primary-accent !border-surface-elevated" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-primary-accent !border-surface-elevated" />
    </div>
  );
};
