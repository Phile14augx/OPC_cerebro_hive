"use client";

import React from "react";
import { motion } from "framer-motion";
import { engineeringCulture } from "@/lib/content/company/culture";
import { CheckCircle2 } from "lucide-react";

export const EngineeringCulture = () => {
  return (
    <section className="section-pad bg-background">
      <div className="container-wide">
        
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          
          <div className="md:w-1/2">
            <h2 className="text-sm font-space font-bold tracking-widest uppercase text-text-muted mb-4">
              Our Methodology
            </h2>
            <h3 className="text-3xl md:text-4xl font-space font-bold text-text-primary tracking-tight mb-6">
              {engineeringCulture.tagline}
            </h3>
            <p className="text-text-secondary font-inter leading-relaxed mb-8">
              We do not believe in proofs of concept that cannot scale. Every architecture we design is built with the assumption that it must survive the rigorous demands of a regulated enterprise environment.
            </p>
            
            <ul className="space-y-4">
              {engineeringCulture.principles.map((principle, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 size={20} className="text-[#00F57A]" />
                  <span className="font-space font-medium text-text-primary">{principle}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="md:w-1/2 w-full aspect-square md:aspect-auto md:h-[400px] bg-surface-elevated border border-border rounded-3xl p-8 relative overflow-hidden flex flex-col justify-end">
             {/* Abstract representation of code/architecture */}
             <div className="absolute inset-0 opacity-10 font-mono text-[8px] leading-tight text-primary-accent p-4 break-all overflow-hidden select-none">
                {`function evaluateModelSafety(weights, thresholds) {
  const complianceScore = weights.reduce((acc, w) => acc + validate(w), 0);
  if (complianceScore < thresholds.MIN_SAFETY) throw new GovernanceError();
  return processDeployment(weights, { secureEnclave: true });
}
// Continuous audit trail active
export const SYSTEM_STATE = 'SECURE';`}
             </div>
             
             <div className="relative z-10 bg-background border border-border p-6 rounded-2xl shadow-xl">
               <div className="flex items-center gap-2 mb-4">
                 <div className="w-3 h-3 rounded-full bg-error" />
                 <div className="w-3 h-3 rounded-full bg-warning" />
                 <div className="w-3 h-3 rounded-full bg-success" />
               </div>
               <div className="space-y-2">
                 <div className="w-3/4 h-2 bg-surface rounded-full" />
                 <div className="w-1/2 h-2 bg-surface rounded-full" />
                 <div className="w-5/6 h-2 bg-primary-accent/50 rounded-full" />
               </div>
             </div>
          </div>

        </div>

      </div>
    </section>
  );
};
