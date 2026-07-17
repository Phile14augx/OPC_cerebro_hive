"use client";

import React from 'react';
import { EngineConfig } from '@/lib/data/industries/types';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { motion } from 'framer-motion';
import { Database, Server, User, Box, BrainCircuit, Activity } from 'lucide-react';

const iconMap: Record<string, any> = {
  client: User,
  gateway: Server,
  database: Database,
  ai: BrainCircuit,
  agent: Activity,
  system: Box
};

export function ArchitectureViewer({ architecture, config }: { architecture: { nodes: any[], edges: any[] }, config: EngineConfig }) {
  if (!architecture || !architecture.nodes || architecture.nodes.length === 0) return null;

  // Let's determine boundaries to make the SVG responsive
  const minX = Math.min(...architecture.nodes.map(n => n.position.x));
  const maxX = Math.max(...architecture.nodes.map(n => n.position.x));
  const minY = Math.min(...architecture.nodes.map(n => n.position.y));
  const maxY = Math.max(...architecture.nodes.map(n => n.position.y));
  
  const width = maxX - minX + 200;
  const height = maxY - minY + 200;

  return (
    <section className="section-pad border-t border-border bg-surface-elevated relative z-10 overflow-hidden">
      <div className="container-wide">
        <SectionHeading label="Platform" title="Reference Architecture" description="Enterprise-grade data, AI, and integration topology." />

        <div className="mt-16 p-8 md:p-12 rounded-[2.5rem] bg-surface border border-border relative overflow-x-auto hide-scrollbar">
          
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          
          <div className="relative min-w-[1000px] h-[500px]" style={{ width: `${width}px`, height: `${height}px`, margin: '0 auto' }}>
            
            {/* Draw sequential connection line from node to node sorted by X */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              <defs>
                <filter id="glowArch">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Dynamic Path based on sorted nodes */}
              {(() => {
                const sorted = [...architecture.nodes].sort((a, b) => a.position.x - b.position.x);
                let d = `M ${sorted[0].position.x - minX + 50} ${sorted[0].position.y - minY + 50}`;
                for (let i = 1; i < sorted.length; i++) {
                  d += ` L ${sorted[i].position.x - minX + 50} ${sorted[i].position.y - minY + 50}`;
                }
                
                return (
                  <g>
                    <path d={d} fill="none" stroke="var(--border)" strokeWidth="2" strokeDasharray="5,5" />
                    
                    <motion.circle r="4" fill={config.primaryColor} filter="url(#glowArch)">
                      <animateMotion dur={`${sorted.length}s`} repeatCount="indefinite" path={d} />
                    </motion.circle>
                    
                    <motion.circle r="3" fill={config.accentColor} filter="url(#glowArch)">
                      <animateMotion dur={`${sorted.length}s`} begin="2s" repeatCount="indefinite" path={d} />
                    </motion.circle>
                  </g>
                );
              })()}
            </svg>

            {/* Nodes */}
            {architecture.nodes.map((node, i) => {
              const Icon = iconMap[node.data.type || 'system'] || Box;
              return (
                <motion.div
                  key={node.id}
                  className="absolute flex flex-col items-center justify-center gap-3 z-10 w-32"
                  style={{ left: node.position.x - minX, top: node.position.y - minY }}
                  initial={{ opacity: 0.4, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div 
                    className="w-16 h-16 rounded-2xl bg-surface-elevated border border-border shadow-md flex items-center justify-center group hover:border-primary-accent/50 transition-all cursor-pointer relative"
                  >
                    <Icon className="text-text-secondary group-hover:text-primary-accent transition-colors" size={28} style={{ color: config.primaryColor }} />
                    
                    {node.data.status === 'Active' && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse shadow-lg" style={{ backgroundColor: config.secondaryColor, boxShadow: `0 0 10px ${config.secondaryColor}` }} />
                    )}
                    {node.data.status === 'Healthy' && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{ backgroundColor: config.accentColor }} />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-text-primary">{node.data.label}</p>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider">{node.data.type}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
