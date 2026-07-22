"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface MarketplaceFilterProps {
  categories: { id: string; label: string; count: number; icon: string }[];
  activeCategory: string;
  onSelect: (id: string) => void;
}

export const MarketplaceFilter: React.FC<MarketplaceFilterProps> = ({ categories, activeCategory, onSelect }) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;
        
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-colors ${
              isActive ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeFilter"
                className="absolute inset-0 bg-surface-elevated border border-border rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <span>{cat.icon}</span>
              {cat.label}
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${isActive ? 'bg-background text-text-secondary' : 'bg-surface border border-border'}`}>
                {cat.count}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
};
