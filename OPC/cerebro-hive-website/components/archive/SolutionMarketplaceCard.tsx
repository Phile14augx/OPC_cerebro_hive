"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Solution } from '@/lib/data/solutions/types';
import { MiniArchitecture } from './MiniArchitecture';
import { ArrowRight, Cpu, Network, Layout, Briefcase, Zap, Cloud, Database } from 'lucide-react';

// Map semantic colors to industries
const getIndustryColor = (industry: string) => {
  const map: Record<string, string> = {
    'Healthcare': 'text-green-500 bg-green-500/10 border-green-500/20',
    'Finance': 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    'Retail': 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    'Government': 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    'Manufacturing': 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  };
  return map[industry] || 'text-text-secondary bg-surface-elevated border-border';
};

// Map categories to icons
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'AI & Generative AI': return <Cpu size={14} />;
    case 'Enterprise Automation': return <Zap size={14} />;
    case 'Data & Intelligence': return <Database size={14} />;
    case 'Customer Experience': return <Briefcase size={14} />;
    case 'Enterprise Platforms': return <Layout size={14} />;
    case 'Infrastructure': return <Cloud size={14} />;
    default: return <Network size={14} />;
  }
};

interface SolutionMarketplaceCardProps {
  solution: Solution;
  onClick: () => void;
}

export const SolutionMarketplaceCard: React.FC<SolutionMarketplaceCardProps> = ({ solution, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Flagship solutions
  const flagshipSlugs = ['enterprise-ai', 'ai-agents', 'erp-modernization', 'rag'];
  const isFlagship = flagshipSlugs.includes(solution.slug);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.button
      layout
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className={`group relative text-left rounded-2xl bg-surface border border-border overflow-hidden transition-all duration-300
        ${isFlagship ? 'col-span-1 lg:col-span-8' : 'col-span-1 lg:col-span-4'}
        hover:-translate-y-2 hover:shadow-2xl flex flex-col min-h-[380px]
      `}
      style={{
        boxShadow: isHovered ? `0 20px 40px -10px ${solution.color}15` : 'none',
        borderColor: isHovered ? `${solution.color}40` : 'var(--color-border)',
      }}
    >
      {/* Mouse Spotlight */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 250px at ${mousePosition.x}px ${mousePosition.y}px, ${solution.color}10, transparent 100%)`
        }}
      />
      
      <div className="relative z-10 flex flex-col h-full p-6">
        
        {/* Top Section: Category & Icon */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
             <div className="w-10 h-10 rounded-xl bg-surface-elevated/50 border border-border backdrop-blur-sm flex items-center justify-center text-text-primary group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300 shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: solution.color }} />
                {getCategoryIcon(solution.category)}
             </div>
             <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">
                {solution.category}
             </span>
          </div>
          
          {/* Complexity/Readiness Badge */}
          <div className="px-2 py-1 rounded text-[9px] uppercase tracking-widest font-bold bg-background border border-border text-text-muted flex items-center gap-1">
             {solution.readiness === "Enterprise Ready" ? (
               <><span className="text-yellow-500">★★★★★</span> Enterprise Ready</>
             ) : (
               <>Complexity: {solution.difficulty}</>
             )}
          </div>
        </div>
        
        {/* Title & Tagline */}
        <div className="mb-4">
          <h3 className="text-2xl font-space font-bold text-text-primary mb-2 group-hover:text-primary-accent transition-colors">{solution.name}</h3>
          <p className="text-sm text-text-secondary line-clamp-2">{solution.tagline || solution.overview}</p>
        </div>

        {/* Business Problem (Standard cards) OR Architecture (Flagships) */}
        {isFlagship ? (
          <div className="mb-6 flex-1 bg-surface-elevated/30 rounded-xl border border-border border-dashed overflow-hidden relative">
            <div className="absolute top-2 left-3 text-[9px] uppercase tracking-widest font-bold text-text-muted">
              Reference Architecture
            </div>
            <MiniArchitecture pipeline={solution.pipeline} color={solution.color} isHovered={isHovered} />
          </div>
        ) : (
          <div className="mb-6 flex-1">
            {solution.businessProblems?.[0] && (
              <div className="p-3 rounded-lg bg-background border border-border relative overflow-hidden group-hover:border-text-muted transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 opacity-50 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: solution.color }} />
                <p className="text-[10px] uppercase text-text-muted font-bold mb-1">Business Problem</p>
                <p className="text-xs text-text-primary font-medium">{solution.businessProblems[0].problem}</p>
              </div>
            )}
          </div>
        )}

        {/* Chips Area */}
        <div className="flex flex-col gap-3 mt-auto mb-6 border-t border-border pt-4">
           {/* Industry Chips */}
           {solution.industries && solution.industries.length > 0 && (
             <div className="flex flex-wrap gap-1.5">
               {solution.industries.slice(0,3).map(ind => (
                 <span key={ind} className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getIndustryColor(ind)}`}>
                   {ind}
                 </span>
               ))}
               {solution.industries.length > 3 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-surface text-text-muted font-bold">
                    +{solution.industries.length - 3}
                  </span>
               )}
             </div>
           )}
           
           {/* Tech Chips */}
           {solution.techStackFlat && solution.techStackFlat.length > 0 && (
             <div className="flex flex-wrap gap-1.5">
               {solution.techStackFlat.slice(0,4).map((tech, i) => (
                 <span key={i} className="text-[9px] px-2 py-0.5 rounded border border-border bg-background text-text-secondary font-medium">
                   {tech.name}
                 </span>
               ))}
             </div>
           )}
        </div>

        {/* Bottom Section: Metrics & CTA */}
        <div className="flex items-end justify-between border-t border-border pt-4 overflow-hidden relative">
           
           <div className="flex gap-6 transition-transform duration-300 group-hover:-translate-y-8 opacity-100 group-hover:opacity-0">
             <div className="flex flex-col">
               <span className="text-[9px] uppercase tracking-widest font-bold text-text-muted mb-1">Impact</span>
               <span className="text-lg font-space font-bold text-text-primary">{solution.roi?.[0]?.metric || "High"}</span>
             </div>
             <div className="flex flex-col">
               <span className="text-[9px] uppercase tracking-widest font-bold text-text-muted mb-1">Implementation</span>
               <span className="text-lg font-space font-bold text-text-primary">{solution.implementationWeeks?.split(' ')[0] || "12"} Wks</span>
             </div>
             {isFlagship && (
               <div className="flex flex-col">
                 <span className="text-[9px] uppercase tracking-widest font-bold text-text-muted mb-1">Deployment</span>
                 <div className="flex gap-1 mt-1 text-text-secondary">
                   <Cloud size={14} /> <Database size={14} />
                 </div>
               </div>
             )}
           </div>

           {/* Slide-in CTA */}
           <div className="absolute inset-x-0 bottom-0 pt-4 flex items-center justify-between text-primary-accent translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
             <span className="text-xs font-bold uppercase tracking-widest">Explore Solution</span>
             <ArrowRight size={16} />
           </div>

        </div>

      </div>
    </motion.button>
  );
};
