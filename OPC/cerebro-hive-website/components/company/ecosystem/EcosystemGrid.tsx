"use client";

import React from "react";
import { motion } from "framer-motion";
import { partners } from "@/lib/content/company/partners";
import { Database, Cloud, Network } from "lucide-react";

export const EcosystemGrid = () => {
  return (
    <section className="section-pad-sm bg-background">
      <div className="container-wide">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-sm font-space font-bold tracking-widest uppercase text-text-muted mb-4">
            Technologies We Build With
          </h2>
          <p className="text-lg text-text-secondary font-inter">
            We are vendor-agnostic but highly opinionated. We partner with and build upon the industry's most robust enterprise data and AI platforms.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {partners.technology.map((tech, index) => (
            <motion.div
              key={tech}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="px-6 py-3 rounded-full bg-[#0a0d14] border border-white/10 flex items-center gap-2 hover:border-primary-accent/50 transition-colors"
            >
              <Database size={16} className="text-primary-accent" />
              <span className="font-space font-medium text-text-primary text-sm">{tech}</span>
            </motion.div>
          ))}
          {partners.research.map((tech, index) => (
            <motion.div
              key={tech}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: (partners.technology.length + index) * 0.05 }}
              className="px-6 py-3 rounded-full bg-[#0a0d14] border border-white/10 flex items-center gap-2 hover:border-[#00E5FF]/50 transition-colors"
            >
              <Network size={16} className="text-[#00E5FF]" />
              <span className="font-space font-medium text-text-primary text-sm">{tech}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
