"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { solutionsData } from '@/lib/data/solutions';
import { SectionHeading } from '../ui/SectionHeading';
import { MarketplaceFilter } from './MarketplaceFilter';
import { SolutionMarketplaceCard } from './SolutionMarketplaceCard';
import { SolutionOverlay } from './SolutionOverlay';
import { Cpu, Zap, Database, Briefcase, Layout, Cloud, Network } from 'lucide-react';

export const InteractiveSolutionExplorer = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [overlaySlug, setOverlaySlug] = useState<string | null>(null);

  // Group and count categories for the filter
  const filterCategories = useMemo(() => {
    const counts: Record<string, number> = { "all": solutionsData.length };
    solutionsData.forEach(sol => {
      counts[sol.category] = (counts[sol.category] || 0) + 1;
    });

    const getIcon = (cat: string) => {
      switch (cat) {
        case 'all': return '◎';
        case 'AI & Generative AI': return '🧠';
        case 'Enterprise Automation': return '⚙️';
        case 'Data & Intelligence': return '📊';
        case 'Customer Experience': return '👥';
        case 'Enterprise Platforms': return '🏢';
        case 'Infrastructure': return '☁️';
        default: return '🔹';
      }
    };

    return [
      { id: "all", label: "All", count: counts["all"], icon: getIcon("all") },
      ...Object.entries(counts)
        .filter(([cat]) => cat !== "all")
        .map(([cat, count]) => ({ id: cat, label: cat, count, icon: getIcon(cat) }))
    ];
  }, []);

  // Filter solutions
  const filteredSolutions = useMemo(() => {
    if (activeCategory === "all") return solutionsData;
    return solutionsData.filter(s => s.category === activeCategory);
  }, [activeCategory]);

  // Overlay state management
  const activeOverlaySolution = useMemo(() => {
    return solutionsData.find(s => s.slug === overlaySlug) || null;
  }, [overlaySlug]);

  const overlayIndex = useMemo(() => {
    return filteredSolutions.findIndex(s => s.slug === overlaySlug);
  }, [filteredSolutions, overlaySlug]);

  const handleNext = () => {
    if (overlayIndex < filteredSolutions.length - 1) {
      setOverlaySlug(filteredSolutions[overlayIndex + 1].slug);
    }
  };

  const handlePrev = () => {
    if (overlayIndex > 0) {
      setOverlaySlug(filteredSolutions[overlayIndex - 1].slug);
    }
  };

  // Determine ambient background color based on category
  const ambientColor = useMemo(() => {
    if (activeCategory === "all") return "#ffffff"; // generic white/gray
    const firstSol = filteredSolutions[0];
    return firstSol ? firstSol.color : "#ffffff";
  }, [activeCategory, filteredSolutions]);

  return (
    <section className="py-24 border-b border-border relative overflow-hidden min-h-screen">
      
      {/* Dynamic Semantic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none transition-colors duration-1000" style={{ backgroundColor: 'var(--color-background)' }}>
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] rounded-full blur-[120px] opacity-[0.04] transition-all duration-1000 ease-in-out"
          style={{ backgroundColor: ambientColor }}
        />
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" />
      </div>

      <div className="container-wide relative z-10">
        <div className="text-center mb-16">
          <SectionHeading 
            label="Marketplace" 
            title="Enterprise Solution Marketplace" 
            description="Explore our library of AI-native enterprise architectures, automation frameworks, and intelligent platforms." 
          />
        </div>

        {/* Top Filter */}
        <MarketplaceFilter 
          categories={filterCategories} 
          activeCategory={activeCategory} 
          onSelect={setActiveCategory} 
        />
        
        {/* Solutions Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredSolutions.map((sol, i) => (
              <motion.div
                key={sol.slug}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={
                  // We handle the column spans here for layout
                  ['enterprise-ai', 'ai-agents', 'erp-modernization', 'rag'].includes(sol.slug) 
                    ? 'col-span-1 md:col-span-2 lg:col-span-8' 
                    : 'col-span-1 lg:col-span-4'
                }
              >
                <SolutionMarketplaceCard 
                  solution={sol} 
                  onClick={() => setOverlaySlug(sol.slug)} 
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredSolutions.length === 0 && (
          <div className="text-center py-24 text-text-muted">
            No solutions found in this category.
          </div>
        )}
      </div>

      {/* Side Panel Overlay */}
      <SolutionOverlay 
        solution={activeOverlaySolution} 
        onClose={() => setOverlaySlug(null)} 
        onNext={handleNext}
        onPrev={handlePrev}
        hasNext={overlayIndex < filteredSolutions.length - 1}
        hasPrev={overlayIndex > 0}
      />
    </section>
  );
};
