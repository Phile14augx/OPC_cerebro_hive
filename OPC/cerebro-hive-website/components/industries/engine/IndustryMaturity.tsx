"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Industry } from '@/lib/data/industries/types';

interface IndustryMaturityProps {
  maturity: Industry['maturity'];
  color: string;
}

const ProgressBar = ({ label, value, color }: { label: string, value: number, color: string }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-text-muted">
        <span>{label}</span>
        <span>{value}/10</span>
      </div>
      <div className="h-2 w-full bg-surface-elevated rounded-full overflow-hidden border border-border">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${(value / 10) * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
};

export function IndustryMaturity({ maturity, color }: IndustryMaturityProps) {
  if (!maturity) return null;

  return (
    <div className="p-8 rounded-[2rem] bg-surface border border-border h-full flex flex-col justify-center">
      <h3 className="text-xl font-space font-bold text-text-primary mb-8">Industry Maturity</h3>
      <div className="flex flex-col gap-8">
        <ProgressBar label="AI Adoption" value={maturity.aiAdoption} color={color} />
        <ProgressBar label="Automation" value={maturity.automation} color={color} />
        <ProgressBar label="Knowledge Engine" value={maturity.knowledge} color={color} />
      </div>
    </div>
  );
}
