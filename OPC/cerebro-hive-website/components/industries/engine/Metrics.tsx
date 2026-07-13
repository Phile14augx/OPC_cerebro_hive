"use client";

import React from 'react';
import { EngineConfig } from '@/lib/data/industries/types';
import { motion } from 'framer-motion';

export function Metrics({ overview, config }: { overview: any, config: EngineConfig }) {
  if (!overview?.statistics || overview.statistics.length === 0) return null;

  return (
    <section className="section-pad border-t border-b border-border bg-surface-elevated relative z-10">
      <div className="container-wide">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {overview.statistics.map((stat: any, i: number) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center justify-center p-6 border-l border-border first:border-l-0 text-center group"
            >
              <span className="text-4xl md:text-5xl font-space font-bold mb-2 transition-colors duration-300" style={{ color: config.primaryColor }}>
                {stat.metric}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold group-hover:text-text-primary transition-colors duration-300">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
