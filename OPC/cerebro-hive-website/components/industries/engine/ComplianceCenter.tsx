"use client";

import React from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export function ComplianceCenter({ compliance }: { compliance: { badge: string; description: string }[] }) {
  if (!compliance || compliance.length === 0) return null;

  return (
    <section className="section-pad border-t border-border bg-surface relative z-10">
      <div className="container-wide">
        <SectionHeading label="Trust" title="Compliance Center" description="Built for highly regulated environments with enterprise-grade security." />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {compliance.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="p-6 rounded-2xl bg-background border border-border flex flex-col items-center justify-center text-center group hover:border-primary-accent transition-colors"
            >
              <ShieldCheck size={32} className="text-text-muted group-hover:text-primary-accent mb-4 transition-colors" />
              <h4 className="font-space font-bold text-lg text-text-primary mb-2">{item.badge}</h4>
              <p className="text-xs text-text-secondary">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
