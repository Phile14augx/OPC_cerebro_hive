"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Minus, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SoftwarePlatform, CompetitorComparison } from '@/lib/data/products/types';

interface ProductComparisonCardProps {
  platform: SoftwarePlatform;
}

export const ProductComparisonCard: React.FC<ProductComparisonCardProps> = ({ platform }) => {
  const [activeCompetitorIdx, setActiveCompetitorIdx] = useState(0);

  if (!platform.comparisons || !platform.comparisons.competitors || platform.comparisons.competitors.length === 0) {
    return null;
  }

  const activeCompetitor = platform.comparisons.competitors[activeCompetitorIdx];

  const renderIcon = (status: "yes" | "no" | "partial" | "limited") => {
    switch(status) {
      case "yes": return <CheckCircle2 size={18} className="text-primary-accent" />;
      case "no": return <XCircle size={18} className="text-red-500/50" />;
      case "partial":
      case "limited": return <Minus size={18} className="text-yellow-500/80" />;
      default: return null;
    }
  };

  const renderText = (status: "yes" | "no" | "partial" | "limited") => {
    switch(status) {
      case "yes": return <span className="text-xs font-bold text-text-primary">Supported</span>;
      case "no": return <span className="text-xs text-text-muted">Not Supported</span>;
      case "partial": return <span className="text-xs text-text-secondary">Partial</span>;
      case "limited": return <span className="text-xs text-text-secondary">Limited</span>;
      default: return null;
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-border bg-background flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h4 className="text-lg font-space font-bold text-text-primary">Feature Comparison</h4>
          <p className="text-xs text-text-secondary mt-1">Based on standard enterprise capabilities.</p>
        </div>
        
        {/* Competitor Selector */}
        <div className="flex gap-2">
          {platform.comparisons.competitors.map((comp, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCompetitorIdx(idx)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-colors border",
                activeCompetitorIdx === idx 
                  ? "bg-surface border-primary-accent text-primary-accent" 
                  : "bg-background border-border text-text-muted hover:text-text-primary hover:border-text-muted"
              )}
            >
              vs {comp.competitor}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-3 bg-background border-b border-border">
        <div className="col-span-1 p-4 font-bold text-xs uppercase tracking-widest text-text-muted">Capability</div>
        <div className="col-span-1 p-4 font-bold text-xs uppercase tracking-widest text-text-primary border-l border-border bg-primary-accent/5">
          {platform.name}
        </div>
        <div className="col-span-1 p-4 font-bold text-xs uppercase tracking-widest text-text-secondary border-l border-border flex items-center justify-between">
          <AnimatePresence mode="wait">
            <motion.span
              key={activeCompetitor.competitor}
              initial={{ opacity: 0.4, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
            >
              {activeCompetitor.competitor}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-col">
        {platform.comparisons.featuresList.map((feature, idx) => {
          const cerebroStatus = platform.comparisons.cerebro[feature];
          const competitorStatus = activeCompetitor.features[feature];

          return (
            <div key={idx} className="grid grid-cols-3 border-b border-border last:border-b-0 hover:bg-surface-elevated transition-colors">
              <div className="col-span-1 p-4 flex items-center">
                <span className="text-sm font-bold text-text-primary">{feature}</span>
              </div>
              <div className="col-span-1 p-4 border-l border-border flex items-center gap-3 bg-primary-accent/5">
                {renderIcon(cerebroStatus)}
                {renderText(cerebroStatus)}
              </div>
              <div className="col-span-1 p-4 border-l border-border flex items-center gap-3">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeCompetitor.competitor}-${feature}`}
                    initial={{ opacity: 0.4, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-3"
                  >
                    {renderIcon(competitorStatus)}
                    {renderText(competitorStatus)}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
      </div>
      </div>
    </div>
  );
};
