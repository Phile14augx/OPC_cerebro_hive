"use client";

import React, { useState } from 'react';
import { AI_Agent, EngineConfig } from '@/lib/data/industries/types';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, X } from 'lucide-react';

export function AgentEcosystem({ agents, config }: { agents: AI_Agent[], config: EngineConfig }) {
  const [selectedAgent, setSelectedAgent] = useState<AI_Agent | null>(null);

  if (!agents || agents.length === 0) return null;

  return (
    <section className="section-pad bg-background relative z-10 overflow-hidden">
      <div className="container-wide">
        <SectionHeading label="Ecosystem" title="Agent Swarm" description="Autonomous, domain-specific AI agents that collaborate to execute complex workflows." />

        <div className="mt-16 flex flex-col lg:flex-row gap-12 items-center">
          
          {/* Left: The Swarm Orbital Visualization */}
          <div className="relative w-full lg:w-1/2 aspect-square flex items-center justify-center max-w-[600px] mx-auto">
            {/* AI Core */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <motion.div 
                className="w-24 h-24 rounded-full bg-surface-elevated border flex items-center justify-center shadow-lg"
                style={{ borderColor: config.primaryColor }}
                animate={{ scale: [1, 1.05, 1], boxShadow: [`0 0 20px ${config.primaryColor}40`, `0 0 40px ${config.primaryColor}80`, `0 0 20px ${config.primaryColor}40`] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <BrainCircuit size={32} style={{ color: config.primaryColor }} />
              </motion.div>
            </div>

            {/* Orbiting Agents */}
            <div className="absolute inset-0 z-20 pointer-events-auto">
              {agents.map((agent, i) => {
                const angle = (i / agents.length) * (2 * Math.PI);
                const radius = i % 2 === 0 ? 150 : 220; // Two orbital rings
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const isSelected = selectedAgent?.name === agent.name;

                return (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 flex items-center justify-center cursor-pointer group"
                    style={{ x, y, originX: "-50%", originY: "-50%" }}
                    initial={{ x, y, opacity: 0.4 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setSelectedAgent(agent)}
                  >
                    <div 
                      className={`relative flex items-center justify-center transition-all duration-300
                        ${isSelected ? 'w-12 h-12 bg-surface border-2 shadow-lg z-50' : 'w-10 h-10 bg-surface-elevated border hover:scale-110'} 
                        rounded-full`}
                      style={{ borderColor: isSelected ? config.secondaryColor : 'var(--border)' }}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest text-center leading-tight p-1" style={{ color: isSelected ? config.secondaryColor : 'var(--text-muted)' }}>
                        {agent.name.replace('Agent', '').trim()}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Orbital Rings */}
            <div className="absolute inset-0 pointer-events-none border border-dashed rounded-full scale-[0.6] opacity-20" style={{ borderColor: config.primaryColor }} />
            <div className="absolute inset-0 pointer-events-none border border-dashed rounded-full scale-[0.9] opacity-20" style={{ borderColor: config.primaryColor }} />
          </div>

          {/* Right: Agent Details Panel */}
          <div className="w-full lg:w-1/2">
            <div className="h-[450px] p-8 rounded-2xl bg-surface-elevated border border-border relative overflow-hidden flex flex-col">
              {selectedAgent ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedAgent.name}
                    initial={{ opacity: 0.4, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full flex flex-col relative z-10"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-3xl font-space font-bold text-text-primary" style={{ color: config.primaryColor }}>
                        {selectedAgent.name}
                      </h3>
                      <button onClick={() => setSelectedAgent(null)} className="p-2 hover:bg-surface rounded-full text-text-muted hover:text-text-primary transition-colors">
                        <X size={20} />
                      </button>
                    </div>

                    <p className="text-text-secondary text-lg mb-8">{selectedAgent.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2 custom-scrollbar">
                      {selectedAgent.capabilities && selectedAgent.capabilities.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3 border-b border-border pb-2">Capabilities</h4>
                          <ul className="flex flex-col gap-2">
                            {selectedAgent.capabilities.map((c, i) => (
                              <li key={i} className="text-sm text-text-primary">{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {selectedAgent.tools && selectedAgent.tools.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3 border-b border-border pb-2">Tools / Integration</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedAgent.tools.map((t, i) => (
                              <span key={i} className="px-2 py-1 bg-surface border border-border rounded text-xs text-text-secondary">{t}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedAgent.outputs && selectedAgent.outputs.length > 0 && (
                        <div className="md:col-span-2 mt-4">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3 border-b border-border pb-2">Primary Outputs</h4>
                          <div className="flex flex-wrap gap-3">
                            {selectedAgent.outputs.map((o, i) => (
                              <span key={i} className="text-sm font-bold" style={{ color: config.secondaryColor }}>{o}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 relative z-10">
                  <BrainCircuit size={48} className="text-text-muted mb-4" />
                  <p className="text-text-secondary">Select an agent from the swarm to view its specialized configuration and capabilities.</p>
                </div>
              )}
              
              {/* Background Glow */}
              <div 
                className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none transition-colors duration-500" 
                style={{ backgroundColor: selectedAgent ? config.primaryColor : 'transparent' }} 
              />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
