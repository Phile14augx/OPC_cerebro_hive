"use client";

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { EngineConfig } from '@/lib/data/industries/types';
import { Network } from 'lucide-react';

export function IndustryTopology({ segments, config }: { segments: string[], config: EngineConfig }) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodes = useMemo(() => {
    return segments.map((seg, index) => {
      const total = segments.length;
      const angle = (index / total) * (2 * Math.PI);
      
      const isInner = index % 2 === 0;
      const radiusX = isInner ? 160 : 250;
      const radiusY = isInner ? 160 : 250;
      
      const x = Math.cos(angle) * radiusX;
      const y = Math.sin(angle) * radiusY;
      
      return {
        id: seg,
        name: seg,
        x,
        y,
        isInner
      };
    });
  }, [segments]);

  return (
    <div className="absolute inset-y-0 right-0 w-full lg:w-1/2 flex items-center justify-center pointer-events-none overflow-hidden">
      <div className="relative w-[500px] h-[500px] scale-[0.6] sm:scale-75 lg:scale-100 flex items-center justify-center pointer-events-auto">
        
        {/* Core Node */}
        <div className="relative flex items-center justify-center w-24 h-24 z-10 group">
          <motion.div 
            className="absolute inset-0 rounded-full border border-dashed"
            style={{ borderColor: config.secondaryColor }}
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="w-16 h-16 rounded-full bg-surface border flex items-center justify-center shadow-lg"
            style={{ borderColor: config.primaryColor }}
            animate={{ scale: [1, 1.05, 1], boxShadow: [`0 0 10px ${config.primaryColor}40`, `0 0 30px ${config.primaryColor}80`, `0 0 10px ${config.primaryColor}40`] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
             <Network size={24} style={{ color: config.primaryColor }} />
          </motion.div>
        </div>

        {/* Connections and Particles */}
        <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" style={{ zIndex: 0 }}>
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.primaryColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor={config.secondaryColor} stopOpacity="0.1" />
            </linearGradient>
            
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {nodes.map((node) => {
            const isHovered = hoveredNode === node.id;
            
            return (
              <g key={`line-${node.id}`}>
                <motion.line
                  x1="50%"
                  y1="50%"
                  x2={`calc(50% + ${node.x}px)`}
                  y2={`calc(50% + ${node.y}px)`}
                  stroke={isHovered ? "url(#lineGrad)" : "var(--border)"}
                  strokeWidth={isHovered ? 2 : 1}
                  strokeOpacity={isHovered ? 1 : 0.4}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                
                {isHovered && (
                  <circle r="3" fill={config.accentColor} filter="url(#glow)">
                    <animateMotion
                      dur="1.5s"
                      repeatCount="indefinite"
                      path={`M 50% 50% L calc(50% + ${node.x}px) calc(50% + ${node.y}px)`}
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* Orbiting Nodes */}
        {nodes.map((node) => {
          const isHovered = hoveredNode === node.id;
          const isDimmed = hoveredNode && !isHovered;

          return (
            <motion.div
              key={node.id}
              className={`absolute cursor-pointer flex items-center justify-center transition-all duration-300
                ${isDimmed ? 'opacity-30 grayscale' : 'opacity-100'}`}
              style={{
                transform: `translate(${node.x}px, ${node.y}px)`,
                zIndex: isHovered ? 50 : 20
              }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              whileHover={{ scale: 1.1 }}
            >
              <div 
                className={`relative flex items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300
                  ${isHovered 
                    ? 'bg-surface shadow-[0_0_20px_rgba(255,255,255,0.1)] w-3 h-3' 
                    : 'w-2 h-2 bg-surface/50 border-border hover:border-white/50'
                  }`}
                style={{ borderColor: isHovered ? config.primaryColor : undefined }}
              />
              <div 
                className={`absolute top-full mt-2 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-all duration-300
                  ${isHovered 
                    ? 'bg-surface border text-text-primary shadow-lg scale-100' 
                    : 'bg-transparent text-text-muted scale-90 opacity-0 md:opacity-100'
                  }`}
                style={{ borderColor: isHovered ? config.secondaryColor : 'transparent' }}
              >
                {node.name}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
