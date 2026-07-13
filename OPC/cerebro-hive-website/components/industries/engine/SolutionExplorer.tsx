"use client";

import React, { useState } from 'react';
import { MatrixItem, EngineConfig } from '@/lib/data/industries/types';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Box } from 'lucide-react';

export function SolutionExplorer({ matrix, config }: { matrix: MatrixItem[], config: EngineConfig }) {
  const [activeSolution, setActiveSolution] = useState<number>(0);

  if (!matrix || matrix.length === 0) return null;

  const current = matrix[activeSolution];
  // Parse descriptions like "Transactions -> Behavior Analytics -> Graph Engine -> LLM"
  const flowSteps = current.description.split('->').map(s => s.trim()).filter(Boolean);

  return (
    <section className="section-pad border-t border-border bg-surface-elevated relative z-10">
      <div className="container-wide">
        <SectionHeading label="Solutions" title="AI Transformation Solutions" description="Modular intelligent systems mapped to domain workflows." />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-16">
          
          {/* Left: Solution Selector */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            {matrix.map((sol, i) => (
              <button
                key={i}
                onClick={() => setActiveSolution(i)}
                className={`text-left p-4 rounded-xl transition-all duration-300 font-bold ${
                  activeSolution === i 
                    ? 'bg-surface border-l-4 shadow-sm' 
                    : 'bg-transparent text-text-muted hover:text-text-primary hover:bg-surface/50'
                }`}
                style={{
                  borderLeftColor: activeSolution === i ? config.primaryColor : 'transparent',
                  color: activeSolution === i ? config.primaryColor : undefined
                }}
              >
                {sol.name}
              </button>
            ))}
          </div>

          {/* Right: Solution Flow Visualization */}
          <div className="lg:col-span-8">
            <div className="h-full min-h-[300px] p-8 rounded-2xl bg-surface border border-border relative overflow-hidden flex flex-col justify-center">
               <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
               
               <AnimatePresence mode="wait">
                 <motion.div
                   key={activeSolution}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   transition={{ duration: 0.3 }}
                   className="relative z-10 w-full"
                 >
                   <h3 className="text-2xl font-space font-bold text-text-primary mb-12">{current.name} Flow</h3>
                   
                   <div className="flex flex-wrap items-center gap-4">
                     {flowSteps.map((step, idx) => (
                       <React.Fragment key={idx}>
                         <div className="flex flex-col items-center gap-2">
                           <div 
                             className="w-24 h-16 rounded-lg border bg-surface-elevated flex items-center justify-center p-2 text-center text-xs font-bold text-text-secondary shadow-sm"
                             style={{ borderColor: idx === flowSteps.length - 1 ? config.primaryColor : 'var(--border)' }}
                           >
                             {step}
                           </div>
                         </div>
                         {idx < flowSteps.length - 1 && (
                           <ArrowRight size={16} className="text-text-muted" />
                         )}
                       </React.Fragment>
                     ))}
                   </div>
                 </motion.div>
               </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
