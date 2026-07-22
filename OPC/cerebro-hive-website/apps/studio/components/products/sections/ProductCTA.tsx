"use client";

import React from "react";
import { motion } from "framer-motion";
import { PackagedProduct } from "@/lib/data/types";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { TrackedLink } from "@/components/ui/TrackedLink";

export const ProductCTA = ({ product }: { product: PackagedProduct }) => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-secondary-accent/5 pointer-events-none" />
      <div className="container-narrow text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[10px] font-bold tracking-widest uppercase text-secondary-accent mb-4 block">
            Get Started
          </span>
          <h2 className="text-4xl md:text-5xl font-space font-bold text-text-primary mb-6">
            Deploy <span className="text-secondary-accent">{product.title}</span> <br className="hidden md:block" />
            in your enterprise today.
          </h2>
          <p className="text-text-secondary mb-10 max-w-xl mx-auto font-inter text-center">
            Schedule a technical deep-dive with our solutions architects and get a private demo tailored to your stack.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <TrackedLink
              href="/contact"
              analyticsEvent="cta_click"
              analyticsCategory="product_cta"
              analyticsLabel={`Book Demo ${product.title}`}
            >
              <AnimatedButton variant="primary" size="lg">
                Book a Technical Demo
              </AnimatedButton>
            </TrackedLink>
            {product.apiReference && (
              <TrackedLink
                href={product.apiReference}
                analyticsEvent="api_docs_click"
                analyticsCategory="product_cta"
                analyticsLabel={`API Docs ${product.title}`}
              >
                <AnimatedButton variant="outline" size="lg">
                  Read Documentation
                </AnimatedButton>
              </TrackedLink>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
