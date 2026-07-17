"use client";

import React from "react";
import { motion } from "framer-motion";
import { EnterpriseService } from "@/lib/data/types";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const ServiceROI = ({ service }: { service: EnterpriseService }) => {
  return (
    <section className="section-pad bg-background border-b border-border">
      <div className="container-wide">
        <SectionHeading 
          label="ROI & Impact" 
          title="Measurable Success" 
          description="We hold ourselves accountable to strict business outcomes."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {service.successMetrics.map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-8 bg-surface-elevated border border-border rounded-2xl shadow-sm text-center flex flex-col items-center justify-center relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-primary-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <h3 className="text-5xl lg:text-6xl font-mono font-black text-text-primary mb-4 relative z-10">
                {metric.value}
              </h3>
              <h4 className="text-sm font-bold tracking-widest uppercase text-text-secondary mb-2 relative z-10">
                {metric.metric}
              </h4>
              <p className="text-xs text-text-muted font-medium relative z-10">
                {metric.timeframe}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
