"use client";

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PipelineStep } from '@/lib/data/solutions/types';

interface SVGArchitecturePipelineProps {
  pipeline: PipelineStep[];
  color: string;
}

export const SVGArchitecturePipeline: React.FC<SVGArchitecturePipelineProps> = ({ pipeline, color }) => {
  // If no pipeline is defined, show a placeholder
  if (!pipeline || pipeline.length === 0) {
    return <div className="h-64 flex items-center justify-center text-text-muted">No pipeline defined</div>;
  }

  // Calculate layout dynamically
  const nodeWidth = 140;
  const nodeHeight = 80;
  const gap = 60;
  const totalWidth = pipeline.length * nodeWidth + (pipeline.length - 1) * gap;
  const height = 200; // Fixed height for the SVG container
  
  // Center the pipeline vertically
  const startY = height / 2;

  // Generate nodes with positions
  const nodes = pipeline.map((step, index) => {
    const x = index * (nodeWidth + gap);
    return {
      ...step,
      x,
      y: startY,
      centerX: x + nodeWidth / 2,
      centerY: startY,
    };
  });

  return (
    <div className="w-full overflow-x-auto custom-scrollbar py-8">
      <div className="min-w-max mx-auto relative" style={{ width: totalWidth, height }}>
        
        {/* SVG layer for edges and flowing packets */}
        <svg className="absolute inset-0 pointer-events-none z-0" width={totalWidth} height={height}>
          <defs>
            <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-border)" stopOpacity="0.5" />
              <stop offset="50%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--color-border)" stopOpacity="0.5" />
            </linearGradient>
            
            {/* Glow filter for packets */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {nodes.map((node, index) => {
            if (index === nodes.length - 1) return null;
            const nextNode = nodes[index + 1];
            
            // Start edge from right side of current node, end at left side of next node
            const startX = node.x + nodeWidth;
            const endX = nextNode.x;
            
            return (
              <g key={`edge-${node.id}`}>
                {/* Static base line */}
                <line 
                  x1={startX} 
                  y1={node.centerY} 
                  x2={endX} 
                  y2={nextNode.centerY} 
                  stroke="var(--color-border)" 
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                
                {/* Flowing animated packet (circle) */}
                <motion.circle
                  r="3"
                  fill={color}
                  filter="url(#glow)"
                  initial={{ cx: startX, cy: node.centerY, opacity: 0.4 }}
                  animate={{ 
                    cx: [startX, endX], 
                    opacity: [0, 1, 1, 0] 
                  }}
                  transition={{
                    duration: 2,
                    ease: "linear",
                    repeat: Infinity,
                    delay: index * 0.5 // Stagger packet flow
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* HTML layer for nodes (easier styling and text wrapping) */}
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence mode="popLayout">
            {nodes.map((node, index) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0.4, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="absolute flex flex-col items-center justify-center bg-surface-elevated border border-border rounded-xl shadow-sm z-10 pointer-events-auto"
                style={{
                  left: node.x,
                  top: node.y - nodeHeight / 2,
                  width: nodeWidth,
                  height: nodeHeight,
                }}
              >
                {/* Node Label */}
                <span className="text-xs font-bold text-text-primary text-center px-2 leading-tight">
                  {node.label}
                </span>
                
                {/* Sublabels */}
                {node.subLabels && node.subLabels.length > 0 && (
                  <div className="flex flex-col gap-0.5 mt-2">
                    {node.subLabels.map((sub, i) => (
                      <span key={i} className="text-[9px] text-text-muted uppercase tracking-widest font-semibold text-center">
                        {sub}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Pulsing accent dot */}
                <motion.div 
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
      </div>
    </div>
  );
};
