"use client";

import React from "react";
import { motion } from "framer-motion";
import { PackagedProduct } from "@/lib/data/types";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const ProductExecutiveSummary = ({ product }: { product: PackagedProduct }) => {
  return (
    <section className="section-pad bg-surface-elevated border-b border-border">
      <div className="container-wide">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <SectionHeading
              label="Overview"
              title={product.hero.subtitle}
              description={product.summary}
              align="left"
            />
            <div className="mt-10 flex flex-wrap gap-2">
              {product.targetPersonas.map((persona, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-background border border-border rounded-full text-sm font-bold text-text-secondary"
                >
                  {persona}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 p-6 bg-background border border-border rounded-2xl shadow-sm">
              <h4 className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-2">
                Deployment Options
              </h4>
              <p className="text-text-primary font-bold font-space text-lg">
                {product.deploymentModels.join(" · ")}
              </p>
            </div>
            <div className="p-6 bg-background border border-border rounded-2xl shadow-sm">
              <h4 className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-2">
                Status
              </h4>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00F57A] animate-pulse" />
                <span className="font-space font-bold text-text-primary capitalize">
                  {product.status}
                </span>
              </span>
            </div>
            <div className="p-6 bg-background border border-border rounded-2xl shadow-sm">
              <h4 className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-2">
                Maturity
              </h4>
              <span className="font-space font-bold text-text-primary uppercase">
                {product.maturity}
              </span>
            </div>
            {product.industries.length > 0 && (
              <div className="col-span-2 p-6 bg-background border border-border rounded-2xl shadow-sm">
                <h4 className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-3">
                  Key Industries
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.industries.map((ind, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-secondary-accent/10 text-secondary-accent text-xs font-bold rounded-md"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
