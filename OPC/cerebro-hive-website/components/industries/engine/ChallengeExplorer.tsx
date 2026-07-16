"use client";

import React, { useState } from 'react';
import { IndustryChallenge, EngineConfig } from '@/lib/data/industries/types';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  Activity, 
  Settings, 
  Truck, 
  Package, 
  DollarSign, 
  ArrowRight,
  BrainCircuit,
  Database,
  Cpu
} from 'lucide-react';

const categoryConfig: Record<string, { color: string, icon: any }> = {
  Fraud: { color: "#EF4444", icon: ShieldAlert },
  Compliance: { color: "#3B82F6", icon: ShieldCheck },
  Customer: { color: "#8B5CF6", icon: Users },
  Risk: { color: "#F97316", icon: Activity },
  Operations: { color: "#10B981", icon: Settings },
  "Supply Chain": { color: "#06B6D4", icon: Truck },
  Inventory: { color: "#F59E0B", icon: Package },
  Pricing: { color: "#14B8A6", icon: DollarSign },
};

const ArchitectureFlow = ({ color }: { color: string }) => {
  return (
    <div className="w-full h-16 relative flex items-center justify-between px-2 mt-4 border border-border rounded-lg bg-surface-elevated">
      <div className="flex flex-col items-center">
        <Database size={14} className="text-text-muted" />
        <span className="text-[9px] text-text-muted mt-1 uppercase tracking-widest">Data</span>
      </div>
      
      {/* Animated Path */}
      <div className="flex-1 relative mx-2 h-0.5 bg-surface-elevated overflow-hidden">
        <motion.div 
          className="absolute inset-y-0 left-0 w-1/3 blur-sm"
          style={{ backgroundColor: color }}
          animate={{ x: ["-100%", "300%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="flex flex-col items-center">
        <BrainCircuit size={16} style={{ color }} />
        <span className="text-[9px] text-text-primary mt-1 uppercase tracking-widest font-bold">AI Agent</span>
      </div>

      {/* Animated Path */}
      <div className="flex-1 relative mx-2 h-0.5 bg-surface-elevated overflow-hidden">
        <motion.div 
          className="absolute inset-y-0 left-0 w-1/3 blur-sm"
          style={{ backgroundColor: color }}
          animate={{ x: ["-100%", "300%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.5 }}
        />
      </div>

      <div className="flex flex-col items-center">
        <Cpu size={14} className="text-text-muted" />
        <span className="text-[9px] text-text-muted mt-1 uppercase tracking-widest">System</span>
      </div>
    </div>
  );
};

export function ChallengeExplorer({ challenges, config }: { challenges: IndustryChallenge[], config: EngineConfig }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!challenges || challenges.length === 0) return null;

  return (
    <section className="section-pad relative z-10 bg-background overflow-hidden" id="opportunities">
      <div className="container-wide">
        <SectionHeading 
          label="Enterprise Transformation Opportunities" 
          title="From Challenge to Intelligence" 
          description="How AI agents resolve critical bottlenecks in your operations." 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 items-start">
          {challenges.map((challenge, i) => {
            const catConfig = categoryConfig[challenge.category || ""] || { color: config.secondaryColor, icon: Activity };
            const Icon = catConfig.icon;
            const isHovered = hoveredIndex === i;
            
            return (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="relative flex flex-col rounded-2xl bg-surface-elevated/40 backdrop-blur-xl border border-border transition-all duration-500 overflow-hidden group cursor-default"
                style={{
                  minHeight: "320px",
                  boxShadow: isHovered ? `0 20px 40px -10px ${catConfig.color}20` : "none",
                  transform: isHovered ? "translateY(-12px)" : "none",
                  borderColor: isHovered ? `${catConfig.color}50` : "rgba(255,255,255,0.1)"
                }}
              >
                {/* Background SVG Morph */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-1000 pointer-events-none"
                  style={{ background: `radial-gradient(circle at center, ${catConfig.color}, transparent 80%)` }}
                />

                {/* Top Border Glow */}
                <motion.div 
                  className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100"
                  style={{ color: catConfig.color, width: isHovered ? "100%" : "0%" }}
                  transition={{ duration: 0.5 }}
                />

                <div className="relative z-10 p-6 flex flex-col flex-1">
                  
                  {/* Header Row */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-surface-elevated border border-border group-hover:rotate-12 transition-transform duration-500">
                        <Icon size={24} style={{ color: catConfig.color }} />
                      </div>
                      <h3 className="text-xl font-bold text-text-primary leading-tight group-hover:translate-x-1 transition-transform duration-300">
                        {challenge.title}
                      </h3>
                    </div>
                    {challenge.priority && (
                      <span 
                        className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border"
                        style={{ 
                          color: challenge.priority === 'Critical' ? '#EF4444' : (challenge.priority === 'High' ? '#F59E0B' : '#10B981'),
                          borderColor: challenge.priority === 'Critical' ? '#EF444440' : (challenge.priority === 'High' ? '#F59E0B40' : '#10B98140'),
                          backgroundColor: challenge.priority === 'Critical' ? '#EF444410' : (challenge.priority === 'High' ? '#F59E0B10' : '#10B98110')
                        }}
                      >
                        {challenge.priority}
                      </span>
                    )}
                  </div>

                  {/* Base Content (Always visible) */}
                  <div className="mb-4">
                    <span className="text-xs uppercase tracking-widest text-text-muted font-bold block mb-2">Problems</span>
                    {challenge.problems ? (
                      <ul className="space-y-1.5">
                        {challenge.problems.slice(0, 3).map((prob, idx) => (
                          <li key={idx} className="text-sm text-text-secondary flex items-start gap-2">
                            <span className="text-text-muted mt-0.5">•</span>
                            {prob}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-text-secondary">{challenge.pain}</p>
                    )}
                  </div>

                  {/* Expandable Content */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col gap-5 overflow-hidden border-t border-border pt-4 mt-2"
                      >
                        {/* Architecture Flow */}
                        <div>
                          <span className="text-xs uppercase tracking-widest text-text-muted font-bold block mb-1">Architecture</span>
                          <ArchitectureFlow color={catConfig.color} />
                        </div>

                        {/* Solutions */}
                        {challenge.solutions && (
                          <div>
                            <span className="text-xs uppercase tracking-widest text-text-muted font-bold block mb-2">AI Response</span>
                            <ul className="space-y-1.5">
                              {challenge.solutions.map((sol, idx) => (
                                <li key={idx} className="text-sm text-text-primary flex items-start gap-2">
                                  <span style={{ color: catConfig.color }} className="mt-0.5">✓</span>
                                  {sol}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Outcomes */}
                        {challenge.outcomes && (
                          <div>
                            <span className="text-xs uppercase tracking-widest text-text-muted font-bold block mb-2">Business Impact</span>
                            <div className="flex flex-col gap-1.5">
                              {challenge.outcomes.map((out, idx) => (
                                <span key={idx} className="text-sm font-medium" style={{ color: config.secondaryColor }}>
                                  {out}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tech Stack */}
                        {challenge.techStack && (
                          <div>
                            <span className="text-xs uppercase tracking-widest text-text-muted font-bold block mb-2">Technologies</span>
                            <div className="flex flex-wrap gap-2">
                              {challenge.techStack.map((tech, idx) => (
                                <span key={idx} className="text-xs px-2 py-1 rounded bg-surface-elevated text-text-secondary border border-border">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Explore CTA */}
                        <div className="mt-2 flex justify-end">
                          <button className="flex items-center gap-2 text-sm font-bold transition-colors" style={{ color: catConfig.color }}>
                            Explore Architecture <ArrowRight size={14} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Readiness Bar (Always at bottom) */}
                  {challenge.readiness && (
                    <motion.div layout className="mt-auto pt-6 border-t border-border flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                      <div className="flex flex-col">
                        <span className="text-text-muted">Time</span>
                        <span className="text-text-primary">{challenge.readiness.implementation}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-text-muted">ROI</span>
                        <span style={{ color: config.accentColor }}>{challenge.readiness.roi}</span>
                      </div>
                    </motion.div>
                  )}

                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
