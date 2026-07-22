import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { Database, Server, Cpu, Bot, User, Cloud, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  gateway: <Server size={16} />,
  ai: <Cpu size={16} />,
  database: <Database size={16} />,
  agent: <Bot size={16} />,
  client: <User size={16} />,
  cloud: <Cloud size={16} />,
  system: <Server size={16} />
};

export const ArchitectureNode = ({ data }: { data: any }) => {
  const type = data.type || 'system';
  const status = data.status || 'Active';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'bg-accent-primary shadow-[0_0_10px_#00F57A]';
      case 'Warning': return 'bg-[#FFB800] shadow-[0_0_10px_#FFB800]';
      case 'Offline': return 'bg-[#FF3366] shadow-[0_0_10px_#FF3366]';
      case 'Learning': return 'bg-[#00E5FF] shadow-[0_0_10px_#00E5FF] animate-pulse';
      case 'Active': return 'bg-primary-accent shadow-[0_0_10px_rgba(0,245,122,0.5)]';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative group px-4 py-3 rounded-xl bg-surface-elevated border border-border shadow-elevated min-w-[150px] flex items-center gap-3 transition-colors duration-300">
      
      {/* Node Type Icon */}
      <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-text-primary">
        {iconMap[type]}
      </div>

      <div className="flex flex-col">
        <span className="text-sm font-bold text-text-primary whitespace-nowrap">{data.label}</span>
        <span className="text-[10px] uppercase tracking-widest text-text-muted font-space">{type}</span>
      </div>

      {/* Status Indicator */}
      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-surface-elevated z-10">
        <div className={cn("w-full h-full rounded-full", getStatusColor(status))} />
      </div>

      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-primary-accent !border-surface-elevated" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary-accent !border-surface-elevated" />
    </div>
  );
};
