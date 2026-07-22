"use client";

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIndustryExplorer } from './IndustryExplorerContext';
import { industriesData } from '@/lib/data/industries';
import { 
  HeartPulse, 
  Building2, 
  ShoppingCart, 
  ShieldCheck, 
  Wrench, 
  Zap, 
  GraduationCap, 
  HardHat,
  Truck,
  Phone,
  Home,
  Shield,
  LucideIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const iconMap: Record<string, LucideIcon> = {
  healthcare: HeartPulse,
  finance: Building2,
  retail: ShoppingCart,
  government: ShieldCheck,
  manufacturing: Wrench,
  energy: Zap,
  education: GraduationCap,
  construction: HardHat,
  logistics: Truck,
  telecom: Phone,
  realestate: Home,
  insurance: Shield
};

// AI Core Component - pulsing, living center
const AICore = () => {
  return (
    <div className="relative flex items-center justify-center w-32 h-32 md:w-48 md:h-48 z-10">
      {/* Outer Halo */}
      <motion.div 
        className="absolute inset-[-50%] rounded-full bg-primary-accent/10 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Rotating Ring 1 */}
      <motion.div 
        className="absolute inset-0 rounded-full border border-primary-accent/30 border-dashed pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Rotating Ring 2 */}
      <motion.div 
        className="absolute inset-4 rounded-full border border-primary-accent/40 border-dotted pointer-events-none"
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Core Body */}
      <motion.div 
        className="w-16 h-16 md:w-20 md:h-20 bg-surface border border-primary-accent rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,230,118,0.3)] z-10"
        animate={{ scale: [1, 1.05, 1], boxShadow: ["0 0 20px rgba(0,230,118,0.2)", "0 0 40px rgba(0,230,118,0.5)", "0 0 20px rgba(0,230,118,0.2)"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-8 h-8 bg-gradient-to-br from-primary-accent to-[#00B8FF] rounded-full blur-sm" />
      </motion.div>
    </div>
  );
};

export function InteractiveIndustryGlobe() {
  const { activeIndustry, hoveredIndustry, setActiveIndustry, setHoveredIndustry, reducedMotion } = useIndustryExplorer();
  const router = useRouter();

  // Distribute industries on multiple orbital rings
  const nodes = useMemo(() => {
    return industriesData.map((ind, index) => {
      const total = industriesData.length;
      const angle = (index / total) * (2 * Math.PI);
      
      // Alternate between inner and outer ring
      const isInner = index % 2 === 0;
      const radiusX = isInner ? 180 : 280;
      const radiusY = isInner ? 180 : 280;
      
      // Calculate responsive offsets (using % for CSS positioning)
      const x = Math.cos(angle) * radiusX;
      const y = Math.sin(angle) * radiusY;
      
      return {
        ...ind,
        angle,
        x,
        y,
        isInner
      };
    });
  }, []);

  return (
    <div className="relative w-full aspect-square max-w-[800px] mx-auto flex items-center justify-center">
      {/* The Central AI Core */}
      <AICore />

      {/* Orbiting Nodes and Connections */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <svg className="absolute inset-0 w-full h-full overflow-visible" style={{ zIndex: -1 }}>
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.1" />
            </linearGradient>
            
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {nodes.map((node) => {
            const isActive = activeIndustry === node.slug;
            const isHovered = hoveredIndustry === node.slug;
            const isHighlighted = isActive || isHovered;
            
            // If something is highlighted and it's NOT this node, dim it
            const isDimmed = (activeIndustry || hoveredIndustry) && !isHighlighted;

            return (
              <g key={`line-${node.slug}`}>
                <motion.line
                  x1="50%"
                  y1="50%"
                  x2={`calc(50% + ${node.x}px)`}
                  y2={`calc(50% + ${node.y}px)`}
                  stroke={isHighlighted ? "url(#lineGrad)" : "var(--border)"}
                  strokeWidth={isHighlighted ? 2 : 1}
                  strokeOpacity={isDimmed ? 0.2 : (isHighlighted ? 1 : 0.5)}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                
                {/* Data Packet travelling along the line when highlighted */}
                {!reducedMotion && isHighlighted && (
                  <circle r="3" fill="var(--accent-primary)" filter="url(#glow)">
                    <animateMotion
                      dur="2s"
                      repeatCount="indefinite"
                      path={`M 50% 50% L calc(50% + ${node.x}px) calc(50% + ${node.y}px)`}
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {nodes.map((node) => {
          const isActive = activeIndustry === node.slug;
          const isHovered = hoveredIndustry === node.slug;
          const isHighlighted = isActive || isHovered;
          const isDimmed = (activeIndustry || hoveredIndustry) && !isHighlighted;
          const Icon = iconMap[node.slug] || Building2;

          return (
            <motion.div
              key={node.slug}
              className={`absolute cursor-pointer pointer-events-auto flex items-center justify-center
                ${isDimmed ? 'opacity-40 grayscale' : 'opacity-100'} 
                transition-all duration-500`}
              style={{
                transform: `translate(${node.x}px, ${node.y}px)`,
                zIndex: isActive ? 50 : 20
              }}
              onMouseEnter={() => setHoveredIndustry(node.slug)}
              onMouseLeave={() => setHoveredIndustry(null)}
              onClick={() => {
                // All 15 industries are now fully built engines, navigate directly to them
                router.push(`/industries/${node.slug}`);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Node Circle */}
              <div 
                className={`relative flex items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300
                  ${isHighlighted 
                    ? 'w-16 h-16 bg-surface border-primary-accent shadow-[0_0_20px_rgba(0,230,118,0.4)]' 
                    : 'w-12 h-12 bg-surface/50 border-border hover:border-primary-accent/50'
                  }`}
              >
                <Icon 
                  size={isHighlighted ? 24 : 18} 
                  className={isHighlighted ? 'text-primary-accent' : 'text-text-secondary'}
                  style={{ color: isHighlighted ? node.color : undefined }}
                />
              </div>

              {/* Node Label */}
              <div 
                className={`absolute top-full mt-3 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300
                  ${isHighlighted 
                    ? 'bg-surface border border-primary-accent/50 text-text-primary shadow-lg scale-100' 
                    : 'bg-transparent text-text-muted scale-90 opacity-0 md:opacity-100'
                  }`}
              >
                {node.name}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
