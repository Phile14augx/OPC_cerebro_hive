"use client";

import React from "react";
import { motion } from "framer-motion";

export const ServicesHeroBg = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none -z-10">
      {/* Base Background */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Ambient glows */}
      <motion.div 
        animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-accent/10 rounded-full blur-[120px]" 
      />
      <motion.div 
        animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00E5FF]/10 rounded-full blur-[120px]" 
      />

      {/* Blueprint Grid */}
      <div className="absolute inset-0" 
           style={{
             backgroundImage: `
               linear-gradient(var(--color-border) 1px, transparent 1px),
               linear-gradient(90deg, var(--color-border) 1px, transparent 1px)
             `,
             backgroundSize: '40px 40px',
             backgroundPosition: 'center center'
           }}
      />
      
      {/* Heavy Crosses for Blueprint Feel */}
      <div className="absolute inset-0" 
           style={{
             backgroundImage: `
               linear-gradient(var(--color-border) 1px, transparent 1px),
               linear-gradient(90deg, var(--color-border) 1px, transparent 1px)
             `,
             backgroundSize: '200px 200px',
             backgroundPosition: 'center center'
           }}
      />

      {/* SVG Data Pipelines */}
      <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
        
        <defs>
          <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00F57A" stopOpacity="0" />
            <stop offset="50%" stopColor="#00F57A" stopOpacity="1" />
            <stop offset="100%" stopColor="#00F57A" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0" />
            <stop offset="50%" stopColor="#00E5FF" stopOpacity="1" />
            <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal Pipeline 1 */}
        <motion.line 
          x1="0" y1="20%" x2="100%" y2="20%" 
          stroke="url(#lineGrad1)" strokeWidth="1" strokeDasharray="4 8"
          initial={{ strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />

        {/* Horizontal Pipeline 2 */}
        <motion.line 
          x1="0" y1="80%" x2="100%" y2="80%" 
          stroke="url(#lineGrad1)" strokeWidth="1" strokeDasharray="4 8"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -100 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />

        {/* Vertical Pipeline 1 */}
        <motion.line 
          x1="20%" y1="0" x2="20%" y2="100%" 
          stroke="url(#lineGrad2)" strokeWidth="1" strokeDasharray="4 8"
          initial={{ strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />

        {/* Vertical Pipeline 2 */}
        <motion.line 
          x1="80%" y1="0" x2="80%" y2="100%" 
          stroke="url(#lineGrad2)" strokeWidth="1" strokeDasharray="4 8"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -100 }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        />

        {/* Circuit Nodes */}
        <circle cx="20%" cy="20%" r="3" fill="#00E5FF" className="animate-pulse" />
        <circle cx="80%" cy="20%" r="3" fill="#00F57A" className="animate-pulse" />
        <circle cx="20%" cy="80%" r="3" fill="#00F57A" className="animate-pulse" />
        <circle cx="80%" cy="80%" r="3" fill="#00E5FF" className="animate-pulse" />
        
        {/* Decorative Architecture Boxes */}
        <rect x="15%" y="15%" width="10%" height="10%" fill="none" stroke="var(--color-border)" strokeWidth="1" />
        <rect x="75%" y="75%" width="10%" height="10%" fill="none" stroke="var(--color-border)" strokeWidth="1" />

      </svg>
      
      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};
