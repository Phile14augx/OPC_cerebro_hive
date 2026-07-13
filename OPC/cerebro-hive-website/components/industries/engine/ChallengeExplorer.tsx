"use client";

import React, { useState } from 'react';
import { IndustryChallenge, EngineConfig } from '@/lib/data/industries/types';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export function ChallengeExplorer({ challenges, config }: { challenges: IndustryChallenge[], config: EngineConfig }) {
  const [activeChallenge, setActiveChallenge] = useState<number | null>(null);

  if (!challenges || challenges.length === 0) return null;

  return (
    <section className="section-pad relative z-10 bg-background">
      <div className="container-wide">
        <SectionHeading label="The Friction" title="Enterprise Challenges" description="Critical bottlenecks slowing transformation." />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {challenges.map((challenge, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onMouseEnter={() => setActiveChallenge(i)}
              onMouseLeave={() => setActiveChallenge(null)}
              className="relative p-8 rounded-2xl bg-surface border transition-all duration-500 overflow-hidden group cursor-default h-64"
              style={{
                borderColor: activeChallenge === i ? config.secondaryColor : 'var(--border)'
              }}
            >
              {/* Animated Background Gradient on Hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at top right, ${config.secondaryColor}, transparent 70%)` }}
              />

              <div className="relative z-10 h-full flex flex-col">
                <AlertCircle size={24} className="mb-4 text-text-muted transition-colors duration-300" style={{ color: activeChallenge === i ? config.secondaryColor : undefined }} />
                
                <h3 className="text-xl font-bold text-text-primary mb-2">{challenge.title}</h3>
                <p className="text-sm text-text-secondary line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                  {challenge.pain}
                </p>
                
                <div className="mt-auto pt-4 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                  <div className="flex justify-between items-end text-xs font-bold">
                    <span className="text-text-muted">Cost Impact:</span>
                    <span style={{ color: config.accentColor }}>{challenge.cost}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
