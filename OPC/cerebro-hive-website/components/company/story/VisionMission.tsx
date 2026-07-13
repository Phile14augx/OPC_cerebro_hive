"use client";

import React from "react";
import { motion } from "framer-motion";
import { Target, Flag, ArrowRight, Zap, CheckCircle2 } from "lucide-react";
import { companyOverview } from "@/lib/content/company/company";

export const VisionMission = () => {
  return (
    <section className="section-pad relative overflow-hidden bg-background">
      <div className="container-wide relative z-10">
        
        <div className="grid lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
          
          {/* Left Column: Purpose & Pillars */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <h2 className="text-sm font-space font-bold tracking-widest uppercase text-text-muted mb-4">
              Our Core Purpose
            </h2>
            <p className="text-3xl md:text-4xl font-space font-bold text-text-primary leading-tight mb-12">
              {companyOverview.purpose}
            </p>
            
            <div className="space-y-6">
              <h3 className="text-sm font-space font-bold tracking-widest uppercase text-text-muted">
                Strategic Pillars
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {companyOverview.pillars.map((pillar, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-primary-accent" />
                    <span className="text-text-primary font-space font-medium">{pillar}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Vision & Mission Cards */}
          <div className="lg:col-span-7 grid md:grid-cols-2 gap-6 relative">
            
            {/* Vision Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-[#00B8FF]/5 rounded-3xl blur-xl group-hover:bg-[#00B8FF]/10 transition-colors duration-500" />
              <div className="relative h-full bg-surface-elevated border border-border rounded-3xl p-8 lg:p-10 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-[#00B8FF]/10 border border-[#00B8FF]/20 flex items-center justify-center mb-6">
                  <Flag size={24} className="text-[#00B8FF]" />
                </div>
                
                <h2 className="text-sm font-space font-bold tracking-widest uppercase text-[#00B8FF] mb-4">
                  Our Vision
                </h2>
                
                <p className="text-xl md:text-2xl font-space font-bold text-text-primary leading-tight">
                  {companyOverview.vision}
                </p>
              </div>
            </motion.div>

            {/* Mission Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative md:translate-y-12"
            >
              <div className="absolute inset-0 bg-primary-accent/5 rounded-3xl blur-xl group-hover:bg-primary-accent/10 transition-colors duration-500" />
              <div className="relative h-full bg-surface-elevated border border-border rounded-3xl p-8 lg:p-10 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-primary-accent/10 border border-primary-accent/20 flex items-center justify-center mb-6">
                  <Target size={24} className="text-primary-accent" />
                </div>
                
                <h2 className="text-sm font-space font-bold tracking-widest uppercase text-primary-accent mb-4">
                  Our Mission
                </h2>
                
                <p className="text-xl md:text-2xl font-space font-bold text-text-primary leading-tight">
                  {companyOverview.mission}
                </p>
              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
};
