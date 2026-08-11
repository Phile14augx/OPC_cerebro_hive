"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Industry } from '@/lib/data/industries/types';
import { ShieldCheck, ArrowRight, Layers, Workflow } from 'lucide-react';
import { HoverCard } from '@/components/motion/primitives/HoverCard';

interface ComplianceEngineProps {
  compliance: Industry['compliance'];
  color: string;
}

export function ComplianceEngine({ compliance, color }: ComplianceEngineProps) {
  if (!compliance || compliance.length === 0) return null;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {compliance.map((item, i) => (
          <HoverCard key={item.badge} className="p-6 bg-surface border border-border group flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-border flex items-center justify-center group-hover:border-primary-accent/50 transition-colors">
                <ShieldCheck size={20} style={{ color }} />
              </div>
              <h4 className="font-space font-bold text-lg text-text-primary">{item.badge}</h4>
            </div>
            
            <p className="text-sm text-text-secondary">{item.description}</p>
            
            {item.whyItMatters && (
              <div className="mt-2 text-xs text-text-muted bg-background p-3 rounded-xl border border-border/50">
                <span className="font-bold text-text-primary block mb-1">Why it matters:</span>
                {item.whyItMatters}
              </div>
            )}
            
            {(item.affectedWorkflows || item.supportedProducts) && (
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border/50">
                {item.affectedWorkflows && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-text-muted flex items-center gap-1">
                      <Workflow size={12} /> Affected Workflows
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {item.affectedWorkflows.map(wf => (
                        <span key={wf} className="text-xs px-2 py-1 bg-surface-elevated rounded-md border border-border text-text-secondary">
                          {wf}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {item.supportedProducts && (
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="text-[10px] uppercase tracking-wider text-text-muted flex items-center gap-1">
                      <Layers size={12} /> Supported Products
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {item.supportedProducts.map(prod => (
                        <span key={prod} className="text-xs px-2 py-1 bg-surface-elevated rounded-md border border-border text-text-secondary">
                          {prod}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </HoverCard>
        ))}
      </div>
    </div>
  );
}
