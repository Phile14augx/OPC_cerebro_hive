"use client";

import React from "react";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";

export const NewsletterCTA = () => {
  return (
    <section className="py-24 border-b border-border bg-background relative overflow-hidden">
      
      {/* Background accents */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[400px] bg-[#00E5FF]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[400px] h-[400px] bg-[#7B61FF]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container-wide max-w-4xl relative z-10">
        
        <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-3xl p-8 md:p-16 text-center shadow-2xl relative overflow-hidden">
          
          {/* Subtle gradient bar top */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00E5FF] via-[#00F57A] to-[#7B61FF]" />

          <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-6">
            <Mail size={24} className="text-accent-secondary" />
          </div>

          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-4">Weekly Executive Intelligence</h2>
          <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
            Not a newsletter. A curated strategic briefing delivered every Tuesday to 5,000+ technology leaders and CIOs.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-12">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <CheckCircle2 size={16} className="text-accent-primary" /> Strategic analysis
            </div>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <CheckCircle2 size={16} className="text-accent-primary" /> Market updates
            </div>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <CheckCircle2 size={16} className="text-accent-primary" /> Architecture insights
            </div>
          </div>

          <form className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your work email address" 
              className="flex-1 px-6 py-4 bg-surface-secondary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-[#00E5FF]/50 transition-colors" 
              required
            />
            <button 
              type="submit" 
              className="px-8 py-4 bg-[#00E5FF] text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-xl hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-2 whitespace-nowrap"
            >
              Subscribe <ArrowRight size={16} />
            </button>
          </form>

        </div>

      </div>
    </section>
  );
};
