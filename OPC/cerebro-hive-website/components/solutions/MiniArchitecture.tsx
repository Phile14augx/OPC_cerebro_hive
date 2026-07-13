"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PipelineStep } from '@/lib/data/solutions/types';

interface MiniArchitectureProps {
  pipeline: PipelineStep[];
  color: string;
  isHovered: boolean;
}

export const MiniArchitecture: React.FC<MiniArchitectureProps> = ({ pipeline, color, isHovered }) => {
  if (!pipeline || pipeline.length === 0) return null;

  // Use a max of 5 nodes for the mini view
  const nodes = pipeline.slice(0, 5);
  
  const nodeWidth = 40;
  const gap = 30;
  const height = 40;
  const startY = height / 2;

  return (
    <div className="w-full flex justify-center py-4 relative z-0 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
      <svg width={nodes.length * nodeWidth + (nodes.length - 1) * gap} height={height} className="overflow-visible">
        
        {/* Edges */}
        {nodes.map((node, i) => {
          if (i === nodes.length - 1) return null;
          const startX = i * (nodeWidth + gap) + nodeWidth;
          const endX = (i + 1) * (nodeWidth + gap);
          
          return (
            <g key={`edge-${i}`}>
              <line 
                x1={startX} 
                y1={startY} 
                x2={endX} 
                y2={startY} 
                stroke="var(--color-border)" 
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              {/* Flowing packet - only animates when hovered */}
              <AnimatePresence>
                {isHovered && (
                  <motion.circle
                    r="2"
                    fill={color}
                    initial={{ cx: startX, cy: startY, opacity: 0 }}
                    animate={{ 
                      cx: [startX, endX], 
                      opacity: [0, 1, 1, 0] 
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 1.5,
                      ease: "linear",
                      repeat: Infinity,
                      delay: i * 0.4
                    }}
                  />
                )}
              </AnimatePresence>
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node, i) => {
          const x = i * (nodeWidth + gap);
          return (
            <g key={`node-${i}`}>
              <rect
                x={x}
                y={startY - 12}
                width={nodeWidth}
                height={24}
                rx="4"
                fill="var(--color-surface)"
                stroke="var(--color-border)"
                strokeWidth="1"
              />
              <text
                x={x + nodeWidth / 2}
                y={startY + 3}
                fontSize="7"
                fill="var(--color-text-muted)"
                textAnchor="middle"
                fontWeight="bold"
                className="group-hover:fill-[var(--color-text-primary)] transition-colors duration-500"
              >
                {node.label.length > 8 ? node.label.substring(0, 7) + '...' : node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
