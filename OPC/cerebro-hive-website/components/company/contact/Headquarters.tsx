"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Globe, Zap, Mail, ArrowRight, Building2, Clock, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// ANIMATED SVG CAMPUS COMPONENT
// ============================================================================
const AnimatedCampus = () => {
  return (
    <div className="relative w-full aspect-square md:aspect-[4/3] bg-[#020408] rounded-3xl overflow-hidden border border-border shadow-2xl flex items-center justify-center">
      {/* Deep Background Noise & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-accent/10 via-transparent to-transparent opacity-50 blur-[50px]" />
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

      {/* Isometric Grid Base */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.05]" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
        <pattern id="iso-grid" width="40" height="20" patternUnits="userSpaceOnUse" patternTransform="translate(0, 300) scale(1.5)">
          <path d="M 20 0 L 40 10 L 20 20 L 0 10 Z" fill="none" stroke="white" strokeWidth="0.5" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#iso-grid)" />
      </svg>

      {/* The 3D/Isometric SVG Scene */}
      <svg viewBox="0 0 800 600" className="w-full h-full relative z-10 drop-shadow-2xl">
        <defs>
          <linearGradient id="building-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="pulse-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#00F57A" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform="translate(400, 350)">
          
          {/* Base Platform */}
          <path d="M 0 50 L 150 -25 L 0 -100 L -150 -25 Z" fill="#0f172a" opacity="0.4" stroke="#1e293b" strokeWidth="1" />
          
          {/* HQ Building Block */}
          {/* Right Wall */}
          <path d="M 0 0 L 80 -40 L 80 -120 L 0 -80 Z" fill="#0b1120" stroke="#1e293b" strokeWidth="1" />
          {/* Left Wall */}
          <path d="M 0 0 L -80 -40 L -80 -120 L 0 -80 Z" fill="#060b14" stroke="#1e293b" strokeWidth="1" />
          {/* Roof */}
          <path d="M 0 -80 L 80 -120 L 0 -160 L -80 -120 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />

          {/* Roof Grid Lines */}
          <path d="M -40 -100 L 40 -140 M -20 -90 L 60 -130 M -60 -110 L 20 -150" stroke="#0f172a" strokeWidth="1" opacity="0.5" />
          <path d="M 40 -100 L -40 -140 M 20 -90 L -60 -130 M 60 -110 L -20 -150" stroke="#0f172a" strokeWidth="1" opacity="0.5" />

          {/* Core Energy Shaft (Center of Building) */}
          <motion.path 
            d="M 0 -80 L 0 -160" 
            stroke="#00F57A" 
            strokeWidth="2" 
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0.4 }}
            animate={{ pathLength: 1, opacity: [0, 1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />

          {/* Animated Building Windows */}
          {[...Array(5)].map((_, i) => (
            <g key={`win-left-${i}`} transform={`translate(0, ${i * -12})`}>
              <motion.path 
                d="M -15 -10 L -65 -35" 
                stroke="#00F57A" 
                strokeWidth="1.5" 
                strokeDasharray="2 4"
                opacity="0.3"
                animate={{ opacity: [0.1, 0.8, 0.1] }}
                transition={{ duration: 3, delay: i * 0.2, repeat: Infinity }}
              />
            </g>
          ))}
          {[...Array(5)].map((_, i) => (
            <g key={`win-right-${i}`} transform={`translate(0, ${i * -12})`}>
              <motion.path 
                d="M 15 -10 L 65 -35" 
                stroke="#00E5FF" 
                strokeWidth="1.5" 
                strokeDasharray="2 4"
                opacity="0.3"
                animate={{ opacity: [0.1, 0.8, 0.1] }}
                transition={{ duration: 4, delay: i * 0.3, repeat: Infinity }}
              />
            </g>
          ))}

          {/* Cloud Nodes (Above HQ) */}
          <g transform="translate(0, -220)">
            {/* Center Cloud Hub */}
            <path d="M 0 20 L 40 0 L 0 -20 L -40 0 Z" fill="#0f172a" stroke="#00E5FF" strokeWidth="1" />
            <motion.path d="M 0 20 L 40 0 L 0 -20 L -40 0 Z" fill="#00E5FF" filter="url(#glow)" 
              animate={{ opacity: [0.1, 0.4, 0.1] }} transition={{ duration: 3, repeat: Infinity }} />
            
            {/* Connection from Building to Cloud */}
            <motion.path 
              d="M 0 60 L 0 20" 
              stroke="#00E5FF" 
              strokeWidth="2" 
              strokeDasharray="4 4"
              initial={{ strokeDashoffset: 100 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </g>

          {/* Data Streams Outward to Regions */}
          
          {/* USA Arc */}
          <g transform="translate(-180, -280)">
            <motion.path 
              d="M 180 60 Q 90 -20 0 0" 
              fill="none" 
              stroke="#00F57A" 
              strokeWidth="1.5"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0.4 }}
              animate={{ pathLength: 1, opacity: [0, 1, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0 }}
            />
            <circle cx="0" cy="0" r="3" fill="#00F57A" filter="url(#glow)" />
            <text x="-10" y="-15" fill="#a1a1aa" fontSize="10" fontFamily="monospace" textAnchor="middle">USA</text>
            <motion.circle cx="0" cy="0" r="8" fill="none" stroke="#00F57A" animate={{ scale: [1, 2], opacity: [1, 0] }} transition={{ duration: 2, repeat: Infinity }} />
          </g>

          {/* Europe Arc */}
          <g transform="translate(150, -300)">
            <motion.path 
              d="M -150 80 Q -75 -20 0 0" 
              fill="none" 
              stroke="#00E5FF" 
              strokeWidth="1.5"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0.4 }}
              animate={{ pathLength: 1, opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            />
            <circle cx="0" cy="0" r="3" fill="#00E5FF" filter="url(#glow)" />
            <text x="0" y="-15" fill="#a1a1aa" fontSize="10" fontFamily="monospace" textAnchor="middle">EUROPE</text>
            <motion.circle cx="0" cy="0" r="8" fill="none" stroke="#00E5FF" animate={{ scale: [1, 2], opacity: [1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
          </g>

          {/* Middle East Arc */}
          <g transform="translate(180, -180)">
            <motion.path 
              d="M -180 -40 Q -90 -40 0 0" 
              fill="none" 
              stroke="#9D00FF" 
              strokeWidth="1.5"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0.4 }}
              animate={{ pathLength: 1, opacity: [0, 1, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: 1 }}
            />
            <circle cx="0" cy="0" r="3" fill="#9D00FF" filter="url(#glow)" />
            <text x="10" y="-15" fill="#a1a1aa" fontSize="10" fontFamily="monospace" textAnchor="middle">ME</text>
            <motion.circle cx="0" cy="0" r="8" fill="none" stroke="#9D00FF" animate={{ scale: [1, 2], opacity: [1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} />
          </g>

          {/* Asia Arc */}
          <g transform="translate(100, -80)">
            <motion.path 
              d="M -100 -140 Q -50 -70 0 0" 
              fill="none" 
              stroke="#F5A623" 
              strokeWidth="1.5"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0.4 }}
              animate={{ pathLength: 1, opacity: [0, 1, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, delay: 1.5 }}
            />
            <circle cx="0" cy="0" r="3" fill="#F5A623" filter="url(#glow)" />
            <text x="25" y="5" fill="#a1a1aa" fontSize="10" fontFamily="monospace" textAnchor="middle">ASIA</text>
            <motion.circle cx="0" cy="0" r="8" fill="none" stroke="#F5A623" animate={{ scale: [1, 2], opacity: [1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1.5 }} />
          </g>

        </g>
      </svg>

      {/* Floating UI Elements */}
      <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-surface backdrop-blur-md border border-border rounded-full text-[10px] font-mono text-text-secondary">
        <Terminal size={12} className="text-primary-accent" />
        AI_CAMPUS_NODE_01
      </div>
      
      <div className="absolute bottom-6 right-6 px-4 py-2 bg-background/80 backdrop-blur-md border border-border rounded-lg text-right">
        <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-1">Global Data Flow</p>
        <p className="text-xs font-space font-bold text-text-primary flex items-center justify-end gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-accent animate-pulse" />
          Synchronized
        </p>
      </div>

    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export const Headquarters = () => {
  const [times, setTimes] = useState({
    ist: "...",
    est: "...",
    bst: "..."
  });

  // Simple live clock for effect
  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      
      setTimes({
        ist: now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute:'2-digit' }),
        est: now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false, hour: '2-digit', minute:'2-digit' }),
        bst: now.toLocaleTimeString('en-US', { timeZone: 'Europe/London', hour12: false, hour: '2-digit', minute:'2-digit' })
      });
    };
    
    updateTimes();
    const interval = setInterval(updateTimes, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="headquarters" className="section-pad bg-background relative overflow-hidden border-t border-border">
      <div className="container-wide relative z-10">
        
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 lg:gap-24 items-center max-w-7xl mx-auto">
          
          {/* ==========================================
              LEFT: INFORMATION HIERARCHY
             ========================================== */}
          <motion.div 
            initial={{ opacity: 0.4, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col h-full justify-center"
          >
            {/* Header */}
            <h2 className="text-xs font-space font-bold tracking-[0.2em] uppercase text-primary-accent mb-4 flex items-center gap-2">
              <Building2 size={16} /> Global Engineering Headquarters
            </h2>
            <h3 className="text-4xl md:text-5xl font-space font-bold text-text-primary tracking-tight mb-6 leading-tight">
              Engineering the next generation of enterprise AI systems.
            </h3>
            
            {/* Bento Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-10">
              <div className="bg-surface-elevated border border-border p-4 rounded-xl flex flex-col justify-center">
                <span className="text-2xl font-space font-bold text-text-primary mb-1">145</span>
                <span className="text-[10px] font-mono uppercase text-text-muted">Engineers</span>
              </div>
              <div className="bg-surface-elevated border border-border p-4 rounded-xl flex flex-col justify-center">
                <span className="text-2xl font-space font-bold text-text-primary mb-1">12</span>
                <span className="text-[10px] font-mono uppercase text-text-muted">Research Teams</span>
              </div>
              <div className="bg-surface-elevated border border-border p-4 rounded-xl flex flex-col justify-center">
                <span className="text-2xl font-space font-bold text-text-primary mb-1">8</span>
                <span className="text-[10px] font-mono uppercase text-text-muted">Countries Served</span>
              </div>
              <div className="bg-surface-elevated border border-border p-4 rounded-xl flex flex-col justify-center">
                <span className="text-2xl font-space font-bold text-primary-accent mb-1 flex items-center gap-2">
                  <Zap size={18} /> 24/7
                </span>
                <span className="text-[10px] font-mono uppercase text-text-muted">Global Operations</span>
              </div>
            </div>

            {/* Rich Contact & Location Block */}
            <div className="bg-[#04080f] border border-border rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden group hover:border-primary-accent/30 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 flex flex-col sm:flex-row gap-8 justify-between">
                
                {/* Location & Status */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-text-muted" />
                    <span className="text-sm font-space font-bold text-text-primary">Bangalore, India</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe size={16} className="text-text-muted" />
                    <span className="text-sm font-inter text-text-secondary">Global Coverage</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <span className="w-2 h-2 rounded-full bg-primary-accent animate-pulse" />
                    </div>
                    <span className="text-sm font-inter text-primary-accent font-medium">System Active</span>
                  </div>
                </div>

                {/* Direct Contact */}
                <div className="flex flex-col gap-4 border-l border-border pl-0 sm:pl-8 pt-6 sm:pt-0 border-t sm:border-t-0">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest flex items-center gap-2">
                      <Mail size={12} /> Enterprise Inquiries
                    </span>
                    <a href="mailto:enterprise@cerebrohive.com" className="text-sm font-space font-bold text-text-primary hover:text-primary-accent transition-colors mt-1">
                      enterprise@cerebrohive.com
                    </a>
                  </div>
                  
                  {/* Time Zones */}
                  <div className="mt-auto">
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest flex items-center gap-2 mb-2">
                      <Clock size={12} /> Live Operations
                    </span>
                    <div className="flex gap-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-text-muted uppercase">IST</span>
                        <span className="text-xs font-mono text-text-primary">{times.ist}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-text-muted uppercase">EST</span>
                        <span className="text-xs font-mono text-text-primary">{times.est}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-text-muted uppercase">BST</span>
                        <span className="text-xs font-mono text-text-primary">{times.bst}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* CTA */}
            <button className="self-start flex items-center gap-3 px-6 py-3 rounded-full bg-surface border border-border hover:bg-surface-elevated hover:border-primary-accent/50 transition-all group">
              <span className="text-sm font-space font-bold text-text-primary uppercase tracking-wider">Explore Global Network</span>
              <ArrowRight size={16} className="text-primary-accent group-hover:translate-x-1 transition-transform" />
            </button>

          </motion.div>

          {/* ==========================================
              RIGHT: SVG ANIMATION CAMPUS
             ========================================== */}
          <motion.div
            initial={{ opacity: 0.4, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <AnimatedCampus />
          </motion.div>

        </div>
      </div>
    </section>
  );
};
