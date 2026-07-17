"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Solution } from '@/lib/data/solutions/types';
import { X, ChevronLeft, ChevronRight, ArrowRight, CheckCircle2, Box, Users, FileText, Target, Workflow, Network, Zap } from 'lucide-react';
import Link from 'next/link';
import { SVGArchitecturePipeline } from './SVGArchitecturePipeline';

interface SolutionOverlayProps {
  solution: Solution | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export const SolutionOverlay: React.FC<SolutionOverlayProps> = ({ solution, onClose, onNext, onPrev, hasNext, hasPrev }) => {
  // Lock body scroll when overlay is open
  useEffect(() => {
    if (solution) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [solution]);

  if (!solution) return null;

  return (
    <AnimatePresence>
      {solution && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-surface-elevated backdrop-blur-sm cursor-pointer"
          />

          {/* Side Panel */}
          <motion.div 
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full md:w-[600px] lg:w-[800px] h-full bg-surface border-l border-border shadow-2xl flex flex-col z-10 overflow-hidden"
          >
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-surface-elevated/50 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-2">
                <button 
                  onClick={onPrev} 
                  disabled={!hasPrev}
                  className="p-2 rounded-lg hover:bg-background transition-colors text-text-muted hover:text-text-primary disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={onNext} 
                  disabled={!hasNext}
                  className="p-2 rounded-lg hover:bg-background transition-colors text-text-muted hover:text-text-primary disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight size={20} />
                </button>
                <span className="text-xs font-bold text-text-muted uppercase tracking-widest ml-2">Marketplace Viewer</span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-background transition-colors text-text-muted hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
              
              {/* Subtle background glow */}
              <div 
                className="absolute top-0 right-0 w-96 h-96 blur-[100px] opacity-[0.05] pointer-events-none"
                style={{ backgroundColor: solution.color }}
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={solution.slug} // Re-animate when solution changes via Prev/Next
                  initial={{ opacity: 0.4, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col relative z-10"
                >
                  
                  {/* Header Section */}
                  <div className="p-8 lg:p-12 border-b border-border">
                    <div className="flex gap-2 mb-6">
                       <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border" style={{ borderColor: `${solution.color}40`, color: solution.color, backgroundColor: `${solution.color}10` }}>
                         {solution.category}
                       </span>
                    </div>
                    <h2 className="text-4xl font-space font-bold text-text-primary mb-4">{solution.name}</h2>
                    <p className="text-lg text-text-secondary leading-relaxed max-w-2xl">{solution.overview}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-8">
                       <Link href={`/solutions/${solution.slug}`}>
                         <button className="flex items-center gap-2 px-6 py-3 bg-text-primary text-background font-bold text-sm rounded-xl hover:brightness-110 transition-all">
                           Open Full Solution <ArrowRight size={16} />
                         </button>
                       </Link>
                       <Link href="/contact">
                         <button className="flex items-center gap-2 px-6 py-3 bg-background border border-border text-text-primary font-bold text-sm rounded-xl hover:bg-surface-elevated transition-colors">
                           Book Workshop
                         </button>
                       </Link>
                    </div>
                  </div>

                  {/* Business Challenges */}
                  {solution.businessProblems && solution.businessProblems.length > 0 && (
                    <div className="p-8 lg:p-12 border-b border-border bg-background/30">
                      <h3 className="text-xs uppercase tracking-widest text-text-muted font-bold mb-6 flex items-center gap-2">
                        <Target size={14} /> Business Challenges
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {solution.businessProblems.map((prob, i) => (
                           <div key={i} className="p-5 rounded-xl bg-surface border border-border">
                             <h4 className="text-sm font-bold text-text-primary mb-2">{prob.problem}</h4>
                             <p className="text-xs text-text-secondary mb-4">{prob.impact}</p>
                             {prob.aiSolution && (
                               <div className="pt-4 border-t border-border border-dashed">
                                 <span className="text-[10px] uppercase font-bold block mb-1" style={{ color: solution.color }}>Our Solution</span>
                                 <p className="text-xs text-text-primary font-medium">{prob.aiSolution}</p>
                               </div>
                             )}
                           </div>
                         ))}
                      </div>
                    </div>
                  )}

                  {/* Architecture Preview */}
                  <div className="p-8 lg:p-12 border-b border-border">
                    <h3 className="text-xs uppercase tracking-widest text-text-muted font-bold mb-6 flex items-center gap-2">
                      <Network size={14} /> Reference Architecture
                    </h3>
                    <div className="bg-background rounded-2xl border border-border p-6 relative overflow-hidden">
                      <SVGArchitecturePipeline pipeline={solution.pipeline} color={solution.color} />
                    </div>
                  </div>

                  {/* KPIs */}
                  <div className="p-8 lg:p-12 border-b border-border bg-background/30">
                    <h3 className="text-xs uppercase tracking-widest text-text-muted font-bold mb-6 flex items-center gap-2">
                      <Zap size={14} /> Expected Outcomes
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {solution.roi?.slice(0,4).map((roiItem, i) => (
                        <div key={i} className="flex flex-col p-4 rounded-xl bg-surface border border-border text-center">
                          <span className="text-3xl font-space font-bold mb-2" style={{ color: solution.color }}>
                            {roiItem.metric}
                          </span>
                          <span className="text-[11px] font-bold text-text-primary mb-1">{roiItem.label}</span>
                          <span className="text-[9px] text-text-muted">{roiItem.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deliverables & Engagement */}
                  {(solution.deliverables || solution.engagementModels) && (
                    <div className="p-8 lg:p-12 border-b border-border grid grid-cols-1 md:grid-cols-2 gap-12">
                      {solution.deliverables && solution.deliverables.length > 0 && (
                        <div>
                          <h3 className="text-xs uppercase tracking-widest text-text-muted font-bold mb-6 flex items-center gap-2">
                            <FileText size={14} /> Deliverables
                          </h3>
                          <ul className="flex flex-col gap-3">
                            {solution.deliverables.map((item, i) => (
                              <li key={i} className="text-sm font-medium text-text-secondary flex items-start gap-3">
                                <CheckCircle2 size={16} className="shrink-0 mt-0.5" style={{ color: solution.color }} />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {solution.engagementModels && solution.engagementModels.length > 0 && (
                        <div>
                          <h3 className="text-xs uppercase tracking-widest text-text-muted font-bold mb-6 flex items-center gap-2">
                            <Users size={14} /> Engagement Models
                          </h3>
                          <div className="flex flex-col gap-3">
                            {solution.engagementModels.map((item, i) => (
                              <div key={i} className="p-4 rounded-xl border border-border bg-background text-sm font-bold text-text-primary">
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tech Stack */}
                  {solution.techStackFlat && solution.techStackFlat.length > 0 && (
                    <div className="p-8 lg:p-12 border-b border-border bg-background/30">
                      <h3 className="text-xs uppercase tracking-widest text-text-muted font-bold mb-6 flex items-center gap-2">
                        <Box size={14} /> Technology Stack
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {solution.techStackFlat.map((tech, i) => (
                          <div key={i} className="px-4 py-3 rounded-xl bg-surface border border-border flex flex-col min-w-[140px]">
                            <span className="text-sm font-bold text-text-primary mb-1">{tech.name}</span>
                            <span className="text-[10px] uppercase text-text-muted">{tech.role}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom Pad */}
                  <div className="h-24" />

                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
