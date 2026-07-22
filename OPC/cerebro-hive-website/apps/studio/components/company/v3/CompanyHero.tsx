"use client";

import React from "react";
import { ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

export default function CompanyHero() {
  const scrollToNext = () => {
    document.getElementById("chapter-1")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center border-b border-border bg-background">
      
      {/* Abstract Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-full bg-[radial-gradient(ellipse_at_top,#00F57A_0%,transparent_60%)] opacity-10" />
      </div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="container-wide relative z-10 text-center">
        
        <motion.div 
          initial={{ opacity: 0.4, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-border text-xs uppercase tracking-[0.3em] text-accent-primary font-bold mb-8"
        >
          CerebroHive
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0.4, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-space font-bold text-text-primary mb-8 tracking-tighter"
        >
          Engineering the <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-text-primary to-transparent">Intelligent Enterprise.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0.4, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto font-inter font-light"
        >
          We combine applied AI research, enterprise architecture, and production platforms to help organizations become AI-native.
        </motion.p>

      </div>

      <motion.button 
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        onClick={scrollToNext}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-border-default transition-colors"
      >
        <ArrowDown size={20} className="animate-bounce" />
      </motion.button>
    </section>
  );
}
