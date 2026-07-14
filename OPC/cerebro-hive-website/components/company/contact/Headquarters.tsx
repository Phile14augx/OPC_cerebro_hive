"use client";

import React from "react";
import { MapPin, Mail, Phone, Building } from "lucide-react";
import { motion } from "framer-motion";

export const Headquarters = () => {
  return (
    <section className="section-pad bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-primary-accent/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container-wide relative z-10">
        
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          
          {/* Left: HQ Info */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-sm font-space font-bold tracking-widest uppercase text-primary-accent mb-4 flex items-center gap-2">
              <Building size={16} /> Global Headquarters
            </h2>
            <h3 className="text-4xl md:text-5xl font-space font-bold text-text-primary tracking-tight mb-8">
              CerebroHive <br/> Technologies
            </h3>
            
            <p className="text-lg text-text-secondary font-inter mb-12 max-w-md">
              Our engineering and operations center is located in India, serving as the nucleus for our global enterprise transformation initiatives.
            </p>

            <div className="space-y-8">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[#0a0d14] border border-white/10 flex items-center justify-center shrink-0 mt-1">
                  <MapPin size={18} className="text-text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-space font-bold uppercase tracking-widest text-text-muted mb-2">Location</h4>
                  <p className="text-text-primary font-inter leading-relaxed">
                    Tech Park IV, Innovation Corridor<br/>
                    Bengaluru, Karnataka<br/>
                    India 560100
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-[#0a0d14] border border-white/10 flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-space font-bold uppercase tracking-widest text-text-muted mb-1">Direct Inquiries</h4>
                  <a href="mailto:enterprise@cerebrohive.com" className="text-primary-accent hover:text-[#00E5FF] transition-colors font-inter font-medium">
                    enterprise@cerebrohive.com
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Architectural Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden bg-[#0a0d14] border border-white/8 flex items-center justify-center"
          >
            {/* Minimalist architectural representation */}
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>
            
            <div className="relative z-10 w-48 h-64 bg-[#020408] border border-white/10 shadow-2xl flex flex-col items-center justify-end pb-8">
               <div className="w-20 h-1 bg-primary-accent/50 rounded-full mb-4" />
               <div className="w-32 h-1 bg-border rounded-full" />
            </div>
            
            <div className="absolute bottom-8 left-8 right-8 p-6 bg-background/90 backdrop-blur-md border border-border rounded-xl">
              <p className="text-sm font-space font-bold text-text-primary mb-1">Engineering Center</p>
              <p className="text-xs text-text-muted font-inter">Operating at the intersection of AI research and enterprise delivery.</p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
