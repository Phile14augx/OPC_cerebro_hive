"use client";

import React from 'react';
import { EngineConfig } from '@/lib/data/industries/types';
import { motion } from 'framer-motion';

export function AnimatedIndustryBackground({ config }: { config: EngineConfig }) {
  
  if (config.backgroundAnimation === 'transaction-network') {
    return (
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ backgroundColor: 'transparent' }}>
        <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="xMidYMid slice">
          {/* Abstract Network Grid */}
          <pattern id="networkGrid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 100" fill="none" stroke={config.primaryColor} strokeWidth="0.5" strokeOpacity="0.2" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#networkGrid)" />
          
          {/* Market Trend Lines */}
          <motion.path
            d="M -100 600 Q 200 400 500 500 T 1200 300 T 2000 200"
            fill="none"
            stroke={config.secondaryColor}
            strokeWidth="1"
            strokeOpacity="0.4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
          <motion.path
            d="M -100 400 Q 300 200 600 350 T 1400 150 T 2000 400"
            fill="none"
            stroke={config.accentColor}
            strokeWidth="1"
            strokeOpacity="0.2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.2 }}
            transition={{ duration: 4, ease: "easeInOut", delay: 0.5 }}
          />
          
          {/* Glowing Nodes (Transactions) */}
          {[...Array(15)].map((_, i) => (
            <motion.circle
              key={i}
              r={Math.random() * 3 + 1}
              fill={i % 3 === 0 ? config.secondaryColor : config.primaryColor}
              initial={{ 
                cx: `${Math.random() * 100}%`, 
                cy: `${Math.random() * 100}%`,
                opacity: 0
              }}
              animate={{ 
                opacity: [0, 0.8, 0],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
            />
          ))}
        </svg>

        {/* Ambient Color Gradients */}
        <motion.div 
          className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-[120px] mix-blend-screen pointer-events-none"
          style={{ backgroundColor: config.primaryColor }}
          animate={{ opacity: [0.05, 0.1, 0.05], scale: [1, 1.05, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[100px] mix-blend-screen pointer-events-none"
          style={{ backgroundColor: config.secondaryColor }}
          animate={{ opacity: [0.02, 0.06, 0.02], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>
    );
  }

  // Default / Fallback background
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] transition-colors duration-1000" 
      style={{ backgroundColor: config.primaryColor }}
    />
  );
}
