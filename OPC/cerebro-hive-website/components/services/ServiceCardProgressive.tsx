"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export type ProgressiveServiceProps = {
  id: string;
  title: string;
  icon: any;
  color: string;
  problem: string;
  outcome: string;
  methodology: string;
  link: string;
};

export function ServiceCardProgressive({ service, index }: { service: ProgressiveServiceProps, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="flex flex-col h-full rounded-[2rem] bg-surface-elevated border border-border overflow-hidden hover:border-primary-accent/30 transition-all duration-300 group"
    >
      <div className="p-8 md:p-10 flex-1 flex flex-col relative z-10">
        
        {/* Subtle glow background on hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none z-0"
          style={{ background: `radial-gradient(circle at top right, ${service.color}, transparent 70%)` }}
        />

        <div className="relative z-10 flex-1 flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center bg-background border border-border shadow-sm group-hover:scale-110 transition-transform duration-500"
              style={{ color: service.color }}
            >
              <service.icon size={28} strokeWidth={1.5} />
            </div>
          </div>

          <h3 className="text-2xl md:text-3xl font-space font-bold text-text-primary mb-6 group-hover:text-primary-accent transition-colors">
            {service.title}
          </h3>

          <div className="space-y-6 flex-1">
            
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-2 block">
                The Challenge
              </span>
              <p className="text-sm text-text-secondary leading-relaxed">
                {service.problem}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-2 block">
                Business Outcome
              </span>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: service.color }} />
                <p className="text-sm text-text-primary font-medium leading-relaxed">
                  {service.outcome}
                </p>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-2 block">
                Methodology
              </span>
              <p className="text-xs text-text-secondary leading-relaxed italic">
                {service.methodology}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="border-t border-border bg-background p-6 relative z-10">
        <Link 
          href={service.link}
          className="flex items-center justify-between w-full group/btn"
        >
          <span className="text-sm font-bold tracking-widest uppercase text-text-primary group-hover/btn:text-primary-accent transition-colors">
            Explore Engagement
          </span>
          <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center group-hover/btn:bg-primary-accent group-hover/btn:text-black group-hover/btn:border-primary-accent transition-all duration-300">
            <ArrowRight size={18} className="group-hover/btn:-rotate-45 transition-transform duration-300" />
          </div>
        </Link>
      </div>
    </motion.div>
  );
}
