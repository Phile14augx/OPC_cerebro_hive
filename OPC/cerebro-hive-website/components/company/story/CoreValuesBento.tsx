"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { coreValues } from "@/lib/content/company/values";
import { cn } from "@/lib/utils";

export const CoreValuesBento = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="section-pad bg-surface">
      <div className="container-wide">
        
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <h2 className="text-sm font-space font-bold tracking-widest uppercase text-text-muted mb-4">
            Culture Code
          </h2>
          <h3 className="text-4xl md:text-5xl font-space font-bold text-text-primary tracking-tight mb-6">
            Engineering Depth <br className="hidden md:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-[#00E5FF]">
              Meets Strategic Consulting
            </span>
          </h3>
          <p className="text-lg text-text-secondary font-inter">
            Our culture is designed to eliminate the handoff where most AI value is lost. We celebrate technical rigor and outcome obsession in equal measure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {coreValues.map((value, index) => {
            const Icon = value.icon;
            const isHovered = hoveredIndex === index;
            
            return (
              <motion.div
                key={value.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="relative group h-64 rounded-3xl overflow-hidden cursor-pointer"
              >
                {/* Background Layer */}
                <div className="absolute inset-0 bg-surface-elevated border border-border rounded-3xl transition-colors duration-500 group-hover:border-transparent" />
                
                {/* Glow Overlay */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ 
                    background: `linear-gradient(135deg, ${value.color}15 0%, transparent 100%)`,
                    border: `1px solid ${value.color}40`
                  }}
                  animate={{ scale: isHovered ? 1 : 0.95 }}
                />

                {/* Content */}
                <div className="relative p-8 h-full flex flex-col z-10">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundColor: `${value.color}15`, color: value.color }}
                  >
                    <Icon size={24} />
                  </div>
                  
                  <h4 className="text-xl font-space font-bold text-text-primary mb-3 transition-colors duration-300" style={{ color: isHovered ? value.color : undefined }}>
                    {value.title}
                  </h4>
                  
                  <p className="text-text-secondary text-sm font-inter leading-relaxed line-clamp-3 group-hover:line-clamp-none group-hover:text-text-primary transition-colors duration-300">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
