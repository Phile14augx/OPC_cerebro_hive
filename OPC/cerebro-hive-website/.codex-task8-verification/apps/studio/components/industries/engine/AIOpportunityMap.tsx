"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Industry } from '@/lib/data/industries/types';

interface AIOpportunityMapProps {
  opportunities: Industry['aiOpportunities'];
  color: string;
}

const OpportunityBar = ({ label, value, color, delay }: { label: string, value: number, color: string, delay: number }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-text-muted">
        <span>{label}</span>
      </div>
      <div className="h-4 w-full flex gap-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.4, scale: 0.8 }}
            whileInView={{ opacity: i < value ? 1 : 0.1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: delay + (i * 0.05), duration: 0.3 }}
            className="flex-1 h-full rounded-sm"
            style={{ backgroundColor: i < value ? color : 'var(--border)' }}
          />
        ))}
      </div>
    </div>
  );
};

export function AIOpportunityMap({ opportunities, color }: AIOpportunityMapProps) {
  if (!opportunities || opportunities.length === 0) return null;

  return (
    <div className="p-8 rounded-[2rem] bg-surface-elevated border border-border h-full">
      <h3 className="text-xl font-space font-bold text-text-primary mb-2">AI Opportunity Map</h3>
      <p className="text-sm text-text-secondary mb-8">Where can AI create the most value?</p>
      <div className="flex flex-col gap-6">
        {opportunities.map((opp, index) => (
          <OpportunityBar 
            key={opp.domain} 
            label={opp.domain} 
            value={opp.score} 
            color={color} 
            delay={index * 0.2} 
          />
        ))}
      </div>
    </div>
  );
}
