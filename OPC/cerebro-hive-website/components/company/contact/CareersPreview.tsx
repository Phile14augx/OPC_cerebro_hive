"use client";

import React from "react";
import { careers } from "@/lib/content/company/careers";
import { ArrowRight, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

export const CareersPreview = () => {
  return (
    <section id="careers" className="section-pad bg-background border-t border-border">
      <div className="container-wide">
        
        <div className="flex flex-col lg:flex-row gap-16 max-w-6xl mx-auto">
          
          <div className="lg:w-1/3">
            <h2 className="text-sm font-space font-bold tracking-widest uppercase text-text-muted mb-4 flex items-center gap-2">
              <Briefcase size={16} /> Careers
            </h2>
            <h3 className="text-4xl font-space font-bold text-text-primary tracking-tight mb-6">
              Join the Hive.
            </h3>
            <p className="text-text-secondary font-inter mb-8">
              We are constantly seeking exceptional talent in engineering, AI research, and enterprise strategy. If you want to solve the hardest execution problems in enterprise AI, we want to talk.
            </p>
            <button className="flex items-center gap-2 text-sm font-space font-bold uppercase tracking-widest text-primary-accent hover:text-[#00E5FF] transition-colors">
              View Open Roles <ArrowRight size={16} />
            </button>
          </div>

          <div className="lg:w-2/3">
            <div className="grid sm:grid-cols-2 gap-4">
              {careers.map((career, index) => (
                <motion.div 
                  key={career.department}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-surface-elevated border border-border flex flex-col items-start gap-4 hover:border-primary-accent/30 transition-colors group cursor-pointer"
                >
                  <h4 className="text-lg font-space font-bold text-text-primary group-hover:text-primary-accent transition-colors">
                    {career.department}
                  </h4>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted bg-background px-3 py-1 rounded-full border border-border">
                    {career.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
