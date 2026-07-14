"use client";

import React from "react";
import { motion } from "framer-motion";
import { companyMetrics } from "@/lib/content/company/metrics";
import { Clock, Globe, Book, Building, Network, Handshake, Activity } from "lucide-react";

const getIcon = (name: string) => {
  switch (name) {
    case 'clock': return <Clock size={24} />;
    case 'globe': return <Globe size={24} />;
    case 'book': return <Book size={24} />;
    case 'building': return <Building size={24} />;
    case 'network': return <Network size={24} />;
    case 'handshake': return <Handshake size={24} />;
    default: return <Activity size={24} />;
  }
};

export const CompanyMetrics = () => {
  return (
    <section className="section-pad-sm bg-[#030608] border-t border-white/5">
      <div className="container-wide">
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 divide-x divide-border/50">
          {companyMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center px-4"
            >
              <div className="w-12 h-12 rounded-full bg-[#0a0d14] border border-white/10 flex items-center justify-center text-primary-accent mb-4">
                {getIcon(metric.icon)}
              </div>
              <h4 className="text-3xl font-space font-bold text-text-primary mb-1">
                {metric.value}
              </h4>
              <p className="text-xs font-space font-bold uppercase tracking-widest text-text-muted">
                {metric.label}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
