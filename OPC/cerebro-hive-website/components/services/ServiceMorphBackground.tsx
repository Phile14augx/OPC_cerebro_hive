"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';
import { useServiceAnimation } from './ServiceAnimationContext';

/* =========================================
   1. BLUEPRINT LAYER
   ========================================= */
const BlueprintLayer = () => {
  return (
    <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] animate-data-flow" />
      <svg className="w-full h-full absolute inset-0" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="blueprint-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
      </svg>
    </div>
  );
};

/* =========================================
   2. GRADIENT MESH LAYER
   ========================================= */
const GradientMeshLayer = () => {
  const { hoveredService, activeService } = useServiceAnimation();
  
  // Map services to colors
  const getColor = () => {
    const service = activeService || hoveredService;
    switch (service) {
      case 'ai-consulting': return '#00E5FF';
      case 'ai-automation': return '#FF8A00';
      case 'data-engineering': return '#7B61FF';
      case 'ai-education': return '#FFC857';
      case 'custom-ai': return '#00F57A';
      default: return '#888888';
    }
  };

  const color = getColor();

  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden mix-blend-screen dark:mix-blend-color-dodge transition-opacity duration-1000">
      <motion.div 
        animate={{ backgroundColor: color }}
        transition={{ duration: 4, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] opacity-[0.03] dark:opacity-[0.08] blur-[100px] rounded-full"
      />
    </div>
  );
};

/* =========================================
   3. AI ORBIT LAYER (The Core)
   ========================================= */
const AIOrbitLayer = () => {
  const { scrollStage, reducedMotion } = useServiceAnimation();
  
  // Show AI Core from "core" stage onwards
  const isVisible = scrollStage !== 'disconnected';
  const isActive = scrollStage === 'orchestration' || scrollStage === 'autonomous';

  if (reducedMotion) {
    return isVisible ? (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-16 h-16 rounded-full bg-primary-accent/40 blur-md" />
        <div className="absolute inset-0 w-16 h-16 rounded-full border border-primary-accent" />
      </div>
    ) : null;
  }

  return (
    <motion.div 
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isVisible ? 1 : 0, 
        opacity: isVisible ? 1 : 0 
      }}
      transition={{ duration: 1.5, type: "spring", damping: 20 }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center pointer-events-none"
    >
      {/* Outer Glow */}
      <motion.div 
        animate={{ 
          scale: isActive ? [1, 1.2, 1] : [1, 1.05, 1],
          opacity: isActive ? [0.4, 0.6, 0.4] : [0.2, 0.3, 0.2]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-32 h-32 rounded-full bg-primary-accent/20 blur-[30px]"
      />
      
      {/* Rotating Rings */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute w-24 h-24 rounded-full border border-dashed border-primary-accent/40"
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute w-32 h-32 rounded-full border-[0.5px] border-primary-accent/20"
      />

      {/* Solid Core */}
      <motion.div 
        animate={{ 
          scale: [1, 1.05, 1],
          boxShadow: ['0 0 20px rgba(0,230,118,0.2)', '0 0 40px rgba(0,230,118,0.5)', '0 0 20px rgba(0,230,118,0.2)']
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-12 h-12 rounded-full bg-surface border border-primary-accent flex items-center justify-center overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-primary-accent/10" />
        <div className="w-4 h-4 rounded-full bg-primary-accent blur-[2px]" />
      </motion.div>
    </motion.div>
  );
};

/* =========================================
   4. NEURAL NETWORK & PACKET LAYER
   ========================================= */
const nodes = [
  { id: 'ai-consulting', label: 'AI Strategy', color: '#00E5FF', angle: -Math.PI / 2, radius: 400, shape: 'hexagon' },
  { id: 'ai-automation', label: 'AI Agents', color: '#FF8A00', angle: -Math.PI / 6, radius: 450, shape: 'circle' },
  { id: 'data-engineering', label: 'Data Lake', color: '#7B61FF', angle: Math.PI / 6, radius: 480, shape: 'database' },
  { id: 'ai-education', label: 'Education', color: '#FFC857', angle: Math.PI / 2, radius: 420, shape: 'shield' },
  { id: 'custom-ai', label: 'Custom Models', color: '#00F57A', angle: 5 * Math.PI / 6, radius: 460, shape: 'grid' }
];

const NeuralNetworkLayer = () => {
  const { scrollStage, hoveredService, activeService } = useServiceAnimation();
  const [winSize, setWinSize] = useState({ w: 1000, h: 800 });
  
  useEffect(() => {
    setWinSize({ w: window.innerWidth, h: window.innerHeight });
    const handleResize = () => setWinSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cx = winSize.w / 2;
  const cy = winSize.h / 2;
  
  // Adjust radius based on screen size
  const scaleRatio = Math.min(1, winSize.w / 1200);

  // Stage flags
  const showNodes = scrollStage !== 'disconnected' && scrollStage !== 'core';
  const showConnections = scrollStage === 'connections' || scrollStage === 'orchestration' || scrollStage === 'autonomous';
  const isAutonomous = scrollStage === 'autonomous';

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      <svg width="100%" height="100%" className="absolute inset-0">
        
        {/* Core Connections */}
        {nodes.map(node => {
          const nx = cx + Math.cos(node.angle) * node.radius * scaleRatio;
          const ny = cy + Math.sin(node.angle) * node.radius * scaleRatio;
          
          const isFaded = (hoveredService || activeService) && hoveredService !== node.id && activeService !== node.id;
          
          return (
            <g key={`connection-${node.id}`} style={{ opacity: isFaded ? 0.1 : 0.6, transition: 'opacity 0.5s' }}>
              <motion.path 
                d={`M ${cx} ${cy} L ${nx} ${ny}`}
                stroke={node.color}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: showConnections ? 1 : 0, 
                  opacity: showConnections ? 1 : 0 
                }}
                transition={{ duration: 1.5, delay: 0.2 }}
              />
              
              {/* Packets */}
              {showConnections && !isFaded && (
                <motion.circle 
                  r="3" 
                  fill={node.color}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: Math.random() * 2 }}
                >
                  <animateMotion 
                    dur="3s" 
                    repeatCount="indefinite" 
                    path={`M ${cx} ${cy} L ${nx} ${ny}`} 
                  />
                </motion.circle>
              )}
            </g>
          );
        })}

        {/* Autonomous Inter-node Connections */}
        {nodes.map((node, i) => {
          const nextNode = nodes[(i + 1) % nodes.length];
          const nx1 = cx + Math.cos(node.angle) * node.radius * scaleRatio;
          const ny1 = cy + Math.sin(node.angle) * node.radius * scaleRatio;
          const nx2 = cx + Math.cos(nextNode.angle) * nextNode.radius * scaleRatio;
          const ny2 = cy + Math.sin(nextNode.angle) * nextNode.radius * scaleRatio;
          
          return (
            <motion.path 
              key={`inter-${i}`}
              d={`M ${nx1} ${ny1} Q ${cx} ${cy} ${nx2} ${ny2}`}
              stroke="url(#gradient-line)"
              strokeWidth="1"
              strokeDasharray="6 6"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: isAutonomous ? 1 : 0, 
                opacity: isAutonomous ? 0.3 : 0 
              }}
              transition={{ duration: 2, delay: i * 0.2 }}
            />
          );
        })}

        <defs>
          <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#00F57A" stopOpacity="0.5" />
          </linearGradient>
        </defs>
      </svg>

      {/* Nodes UI overlay */}
      <AnimatePresence>
        {showNodes && nodes.map((node, i) => {
          const nx = cx + Math.cos(node.angle) * node.radius * scaleRatio;
          const ny = cy + Math.sin(node.angle) * node.radius * scaleRatio;
          const isFaded = (hoveredService || activeService) && hoveredService !== node.id && activeService !== node.id;
          const isHighlighted = hoveredService === node.id || activeService === node.id;
          
          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: isFaded ? 0.2 : 1, scale: isHighlighted ? 1.2 : 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: nx, top: ny }}
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center backdrop-blur-md border shadow-lg transition-colors duration-500"
                style={{ 
                  backgroundColor: isHighlighted ? `${node.color}30` : 'rgba(255,255,255,0.05)',
                  borderColor: isHighlighted ? node.color : 'rgba(255,255,255,0.1)'
                }}
              >
                {/* Simulated different shapes with simple geometric CSS tricks for performance */}
                <div 
                  className={node.shape === 'circle' ? 'rounded-full w-4 h-4' : node.shape === 'hexagon' ? 'rounded-sm w-4 h-4 rotate-45' : 'rounded-sm w-4 h-4'}
                  style={{ backgroundColor: node.color }}
                />
              </div>
              <span className="mt-2 text-[10px] font-space font-bold tracking-widest uppercase text-text-secondary whitespace-nowrap bg-background/50 backdrop-blur-sm px-2 py-1 rounded">
                {node.label}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

/* =========================================
   5. CURSOR LAYER
   ========================================= */
const CursorLayer = () => {
  const { cursorPosition, reducedMotion } = useServiceAnimation();
  
  if (reducedMotion) return null;

  return (
    <motion.div 
      className="fixed z-40 pointer-events-none rounded-full w-96 h-96 mix-blend-screen opacity-20 blur-[80px]"
      animate={{
        x: cursorPosition.x - 192,
        y: cursorPosition.y - 192,
      }}
      transition={{ type: "tween", ease: "linear", duration: 0 }}
      style={{
        background: "radial-gradient(circle, rgba(0,230,118,0.4) 0%, rgba(0,0,0,0) 70%)"
      }}
    />
  );
};

/* =========================================
   ORCHESTRATOR COMPONENT
   ========================================= */
export const ServiceMorphBackground = ({ scrollContainerRef }: { scrollContainerRef: React.RefObject<HTMLDivElement> }) => {
  const { setScrollStage, setCursorPosition, reducedMotion } = useServiceAnimation();
  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start end", "end start"]
  });

  // Track cursor
  useEffect(() => {
    if (reducedMotion) return;
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [setCursorPosition, reducedMotion]);

  // Map scroll progress to named stages
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest < 0.15) setScrollStage("disconnected");
      else if (latest < 0.3) setScrollStage("core");
      else if (latest < 0.5) setScrollStage("services");
      else if (latest < 0.7) setScrollStage("connections");
      else if (latest < 0.85) setScrollStage("orchestration");
      else setScrollStage("autonomous");
    });
    return () => unsubscribe();
  }, [scrollYProgress, setScrollStage]);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-transparent opacity-40">
      <BlueprintLayer />
      <GradientMeshLayer />
      <NeuralNetworkLayer />
      <AIOrbitLayer />
      <CursorLayer />
    </div>
  );
};
