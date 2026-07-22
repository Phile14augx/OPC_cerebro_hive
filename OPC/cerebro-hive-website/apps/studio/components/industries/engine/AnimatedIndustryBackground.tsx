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
            initial={{ pathLength: 0, opacity: 0.4 }}
            animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
          <motion.path
            d="M -100 400 Q 300 200 600 350 T 1400 150 T 2000 400"
            fill="none"
            stroke={config.accentColor}
            strokeWidth="1"
            strokeOpacity="0.2"
            initial={{ pathLength: 0, opacity: 0.4 }}
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

  if (config.backgroundAnimation === 'smart-factory') {
    return (
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ backgroundColor: 'transparent' }}>
        <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="xMidYMid slice">
          {/* Abstract Factory Floor Grid */}
          <pattern id="factoryGrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <rect width="60" height="60" fill="none" stroke={config.primaryColor} strokeWidth="1" strokeOpacity="0.15" />
            <circle cx="30" cy="30" r="1" fill={config.secondaryColor} fillOpacity="0.3" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#factoryGrid)" />
          
          {/* Conveyor Belts / Data Flows */}
          <g stroke={config.accentColor} strokeWidth="2" strokeOpacity="0.3" fill="none">
            <line x1="0" y1="200" x2="100%" y2="200" strokeDasharray="10, 10">
              <animate attributeName="stroke-dashoffset" values="20;0" dur="2s" repeatCount="indefinite" />
            </line>
            <line x1="100%" y1="500" x2="0" y2="500" strokeDasharray="20, 20">
              <animate attributeName="stroke-dashoffset" values="0;40" dur="3s" repeatCount="indefinite" />
            </line>
            <line x1="30%" y1="0" x2="30%" y2="100%" strokeDasharray="15, 15">
              <animate attributeName="stroke-dashoffset" values="30;0" dur="4s" repeatCount="indefinite" />
            </line>
          </g>
          
          {/* Robotic Arms / Arcs */}
          <motion.path
            d="M 200 800 Q 300 500 500 600"
            fill="none"
            stroke={config.primaryColor}
            strokeWidth="4"
            strokeOpacity="0.4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M 800 200 Q 1000 400 1200 300"
            fill="none"
            stroke={config.secondaryColor}
            strokeWidth="3"
            strokeOpacity="0.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          {/* IoT Sensor Pulses */}
          {[...Array(10)].map((_, i) => (
            <g key={`sensor-${i}`}>
              <circle
                cx={`${20 + Math.random() * 60}%`}
                cy={`${20 + Math.random() * 60}%`}
                r="4"
                fill={config.accentColor}
              />
              <motion.circle
                cx={`${20 + Math.random() * 60}%`}
                cy={`${20 + Math.random() * 60}%`}
                r="4"
                fill="none"
                stroke={config.accentColor}
                strokeWidth="2"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 6, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
              />
            </g>
          ))}
        </svg>

        {/* Ambient Industrial Glow */}
        <motion.div 
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[100px] mix-blend-screen pointer-events-none"
          style={{ backgroundColor: config.primaryColor }}
          animate={{ opacity: [0.03, 0.08, 0.03] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] mix-blend-screen pointer-events-none"
          style={{ backgroundColor: config.accentColor }}
          animate={{ opacity: [0.02, 0.05, 0.02] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
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
