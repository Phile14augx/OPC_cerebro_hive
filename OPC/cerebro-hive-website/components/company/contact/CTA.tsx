"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

export const CTA = () => {
  return (
    <section className="section-pad bg-primary-accent relative overflow-hidden">
      {/* Dark background pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      
      <div className="container-wide relative z-10 text-center">
        <h2 className="text-4xl md:text-6xl font-space font-bold text-black tracking-tight mb-8">
          Ready to Close the Gap?
        </h2>
        <p className="text-xl md:text-2xl text-black/80 font-space font-medium mb-12 max-w-2xl mx-auto">
          Partner with CerebroHive to architect, build, and scale your AI-native enterprise.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <AnimatedButton 
            variant="secondary" 
            size="lg" 
            className="!bg-black !text-white hover:!bg-black/90 !border-none text-base"
          >
            Schedule Architecture Review <ArrowRight size={18} />
          </AnimatedButton>
          <AnimatedButton 
            variant="outline" 
            size="lg" 
            className="!border-black/20 !text-black hover:!bg-black/5 text-base"
          >
            Explore CerebroSphere Framework
          </AnimatedButton>
        </div>
      </div>
    </section>
  );
};
