"use client";

import React from "react";
import { motion } from "framer-motion";
import { PackagedProduct } from "@/lib/data/types";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { TrackedLink } from "@/components/ui/TrackedLink";

export const ProductHero = ({ product }: { product: PackagedProduct }) => {
  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center z-10 border-b border-border text-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b opacity-50 from-secondary-accent/5 via-transparent to-transparent pointer-events-none" />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-0 w-full h-[500px] bg-secondary-accent/5 blur-[120px] rounded-full pointer-events-none" 
      />

      <div className="container-wide flex flex-col items-center relative z-10 pt-20 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-secondary-accent animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">{product.category}</span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted border-l border-border pl-2 ml-1">
            {product.maturity.toUpperCase()}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-space font-bold text-text-primary leading-[1.1] tracking-tight mb-6 max-w-4xl"
        >
          {product.hero.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-text-secondary font-inter max-w-2xl leading-relaxed mb-10"
        >
          {product.hero.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0"
        >
          <TrackedLink href="/contact" analyticsEvent="cta_click" analyticsCategory="product_hero" analyticsLabel={`Request Demo ${product.title}`}>
            <AnimatedButton variant="primary" size="lg">
              Request Demo
            </AnimatedButton>
          </TrackedLink>
          {product.apiReference && (
            <TrackedLink href={product.apiReference} analyticsEvent="api_docs_click" analyticsCategory="product_hero" analyticsLabel={`View API ${product.title}`}>
              <AnimatedButton variant="outline" size="lg">
                View Documentation
              </AnimatedButton>
            </TrackedLink>
          )}
        </motion.div>

        {/* Floating tags */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 flex flex-wrap justify-center gap-3 max-w-3xl"
        >
          {product.tags.map((tag, i) => (
            <span key={i} className="px-3 py-1 bg-surface-elevated border border-border rounded-full text-xs font-bold text-text-muted uppercase tracking-widest">
              {tag}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
