"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { industriesData, getAllCategories, getIndustriesByTier } from '@/lib/data/industries';
import { Search, ChevronRight, ChevronDown, Hexagon, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { AnimatedConnector } from '../motion/primitives/AnimatedConnector';
import { IntelligentOrb } from '../motion/primitives/IntelligentOrb';

export function InteractiveIndustryExplorer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(getAllCategories());
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const filteredIndustries = useMemo(() => {
    if (!searchQuery) return industriesData;
    const q = searchQuery.toLowerCase();
    return industriesData.filter(i => 
      i.name.toLowerCase().includes(q) || 
      i.category?.toLowerCase().includes(q) ||
      i.slug.includes(q)
    );
  }, [searchQuery]);

  const categories = useMemo(() => {
    const cats = new Set(filteredIndustries.map(i => i.category || 'Other'));
    return Array.from(cats).sort();
  }, [filteredIndustries]);

  return (
    <div className="w-full min-h-[80vh] flex flex-col md:flex-row border border-border rounded-3xl overflow-hidden bg-background mt-8 relative z-10">
      
      {/* Sidebar Tree */}
      <div className="w-full md:w-80 border-r border-border bg-surface flex flex-col h-[500px] md:h-auto">
        <div className="p-6 border-b border-border">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text"
              placeholder="Search industries, frameworks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-surface-elevated border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary-accent transition-colors"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {categories.map(cat => {
            const isExpanded = expandedCategories.includes(cat);
            const categoryIndustries = filteredIndustries.filter(i => (i.category || 'Other') === cat);
            
            if (categoryIndustries.length === 0) return null;

            return (
              <div key={cat} className="mb-2">
                <button 
                  onClick={() => toggleCategory(cat)}
                  className="flex items-center gap-2 w-full text-left py-2 px-2 rounded-md hover:bg-surface-elevated transition-colors group"
                >
                  <span className="text-text-muted group-hover:text-primary-accent transition-colors">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                  <span className="font-bold text-sm text-text-primary">{cat}</span>
                </button>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0.4 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-6 flex flex-col gap-1 mt-1"
                    >
                      {categoryIndustries.map(ind => (
                        <div key={ind.slug} className="flex items-center group/item">
                          <div className="w-px h-8 bg-border absolute -ml-3" />
                          <div className="w-3 h-px bg-border absolute -ml-3" />
                          <Link 
                            href={`/industries/${ind.slug}`}
                            onMouseEnter={() => setActiveNode(ind.slug)}
                            onMouseLeave={() => setActiveNode(null)}
                            className={`flex items-center gap-2 py-1.5 px-3 rounded-md w-full text-xs transition-colors ${activeNode === ind.slug ? 'bg-surface-elevated text-text-primary' : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated/50'}`}
                          >
                            <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: ind.color }} />
                            {ind.name}
                          </Link>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Knowledge Graph View */}
      <div className="flex-1 bg-surface-elevated/20 relative overflow-hidden flex items-center justify-center p-8 min-h-[400px]">
        {/* Placeholder for the Graph / Node view */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        
        {activeNode ? (
          <motion.div 
            key={activeNode}
            initial={{ scale: 0.9, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center relative z-10"
          >
            {(() => {
              const ind = industriesData.find(i => i.slug === activeNode);
              if (!ind) return null;
              return (
                <div className="flex flex-col items-center gap-8 text-center max-w-sm">
                  <IntelligentOrb 
                    state="thinking" 
                    colorVariant="default" 
                    icon={BrainCircuit} 
                    size="lg" 
                  />
                  <div>
                    <h3 className="text-2xl font-space font-bold text-text-primary mb-2" style={{ color: ind.color }}>{ind.name}</h3>
                    <p className="text-sm text-text-secondary mb-4">{ind.hero?.description}</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {ind.relatedIndustries?.map(rel => (
                        <span key={rel} className="px-2 py-1 text-[10px] uppercase tracking-wider bg-surface border border-border rounded-md text-text-muted">
                          Connects to {rel}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link href={`/industries/${ind.slug}`} className="px-6 py-2 bg-surface border border-border rounded-full text-sm font-bold hover:border-primary-accent transition-colors">
                    Explore Engine
                  </Link>
                </div>
              );
            })()}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center text-center max-w-md opacity-50 relative z-10">
            <Hexagon size={48} className="text-text-muted mb-4" />
            <h3 className="text-lg font-space font-bold text-text-primary mb-2">Industry Knowledge Graph</h3>
            <p className="text-sm text-text-secondary">Select an industry from the sidebar to explore its reference architecture, capabilities, and cross-industry relationships.</p>
          </div>
        )}
      </div>

    </div>
  );
}
