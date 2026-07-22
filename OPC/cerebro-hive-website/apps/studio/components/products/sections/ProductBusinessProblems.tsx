"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PackagedProduct } from "@/lib/data/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AlertCircle } from "lucide-react";

export const ProductBusinessProblems = ({ product }: { product: PackagedProduct }) => {
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { once: true, margin: "-100px" });

  if (!product.businessProblems || product.businessProblems.length === 0) return null;

  return (
    <section className="section-pad bg-surface border-b border-border">
      <div className="container-narrow">
        <SectionHeading 
          label="The Problem" 
          title="Why This Exists" 
          description="Enterprise frictions we engineered this product to solve."
        />

        <div ref={containerRef} className="mt-16 flex flex-col gap-4">
          {product.businessProblems.map((prob, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex items-start gap-4 p-6 bg-background border border-border rounded-xl shadow-sm hover:border-secondary-accent/40 transition-colors"
            >
              <AlertCircle className="text-[#FF453A] shrink-0 mt-0.5" size={24} />
              <p className="text-text-primary text-lg font-inter leading-relaxed">{prob}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
