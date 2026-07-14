import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import Image from 'next/image';
import { withBasePath, cn } from '@/lib/utils';
import { OrganizationNodeData } from '@/lib/services/organizationService';
import { Hexagon } from 'lucide-react';

export const CEOExecutiveNode = ({ data, selected }: NodeProps<OrganizationNodeData>) => {
  return (
    <div className={cn(
      "relative w-[320px] rounded-2xl overflow-hidden transition-all duration-300",
      "bg-black/60 backdrop-blur-xl border-2 shadow-2xl",
      selected ? "border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.2)] scale-[1.02] -translate-y-2" : "border-white/10 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:-translate-y-2 cursor-pointer"
    )}>
      {/* Premium Glass reflection */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Hexagon size={20} className="text-amber-500" />
            <span className="text-sm font-space font-bold tracking-widest uppercase text-white">CerebroHive</span>
          </div>
        </div>

        <div className="flex gap-5 items-center mb-6">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface relative shadow-inner border border-white/10">
            {data.avatar && <Image src={withBasePath(data.avatar)} alt={data.title} fill className="object-cover" />}
          </div>
          <div>
            <h3 className="text-xl font-space font-bold text-white leading-tight mb-1">{data.title}</h3>
            <p className="text-xs font-inter text-amber-500 font-medium tracking-wide uppercase">{data.subtitle}</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-4">
          {data.capabilities?.map((cap, i) => (
            <span key={i} className="text-[10px] font-mono text-text-muted bg-white/5 border border-white/5 px-2 py-1 rounded">
              {cap}
            </span>
          ))}
        </div>
        
        {data.metrics && (
          <div className="flex justify-between border-t border-white/10 pt-4 mt-2">
            <div className="text-center">
              <span className="block text-lg font-space font-bold text-white">{data.metrics.employees}</span>
              <span className="block text-[10px] font-inter text-text-muted uppercase">Employees</span>
            </div>
            <div className="text-center">
              <span className="block text-lg font-space font-bold text-white">{data.metrics.teams}</span>
              <span className="block text-[10px] font-inter text-text-muted uppercase">Teams</span>
            </div>
            <div className="text-center">
              <span className="block text-lg font-space font-bold text-white">{data.metrics.countries}</span>
              <span className="block text-[10px] font-inter text-text-muted uppercase">Countries</span>
            </div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-4 h-4 !bg-amber-500 !border-2 !border-black" />
    </div>
  );
};
