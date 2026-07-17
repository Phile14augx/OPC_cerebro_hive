"use client";

import React from "react";
import { motion } from "framer-motion";
import { EnterpriseService } from "@/lib/data/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { products } from "@/lib/data/products";
import { platformCapabilities } from "@/lib/data/platform/capabilities";
import { ArrowRight, Cpu, Layers } from "lucide-react";
import { TrackedLink } from "@/components/ui/TrackedLink";

export const ServiceArchitecture = ({ service }: { service: EnterpriseService }) => {
  // Resolve references
  const usedProducts = products.filter(p => service.products.includes(p.id));
  const usedCapabilities = platformCapabilities.filter(c => service.platformCapabilities.includes(c.id));

  if (usedProducts.length === 0 && usedCapabilities.length === 0) return null;

  return (
    <section className="section-pad bg-surface-elevated border-b border-border overflow-hidden">
      <div className="container-wide">
        <SectionHeading 
          label="Technology Stack" 
          title="Powered by CerebroHive" 
          description="This service leverages our proprietary platform and products to accelerate delivery."
        />

        <div className="mt-16 grid lg:grid-cols-2 gap-12">
          
          {/* Products Column */}
          {usedProducts.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
                <Layers size={20} className="text-primary-accent" />
                <h3 className="text-xl font-space font-bold text-text-primary">Packaged Applications</h3>
              </div>
              <div className="flex flex-col gap-4">
                {usedProducts.map((prod, i) => (
                  <TrackedLink 
                    key={prod.id} 
                    href={`/products/${prod.slug}`}
                    analyticsEvent="service_product_click"
                    analyticsCategory="service_architecture"
                    analyticsLabel={prod.title}
                    className="group flex flex-col p-6 bg-background border border-border rounded-xl hover:border-primary-accent/50 transition-colors shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
                      <ArrowRight size={20} className="text-primary-accent" />
                    </div>
                    <span className="text-xs font-bold tracking-widest uppercase text-text-muted mb-2">{prod.category}</span>
                    <h4 className="text-lg font-space font-bold text-text-primary mb-2">{prod.title}</h4>
                    <p className="text-sm text-text-secondary leading-relaxed pr-8">{prod.summary}</p>
                  </TrackedLink>
                ))}
              </div>
            </div>
          )}

          {/* Capabilities Column */}
          {usedCapabilities.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
                <Cpu size={20} className="text-secondary-accent" />
                <h3 className="text-xl font-space font-bold text-text-primary">Core Platform Capabilities</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {usedCapabilities.map((cap, i) => (
                  <TrackedLink 
                    key={cap.id} 
                    href={`/platform/${cap.slug}`}
                    analyticsEvent="service_platform_click"
                    analyticsCategory="service_architecture"
                    analyticsLabel={cap.title}
                    className="p-5 bg-background border border-border rounded-xl hover:border-secondary-accent/50 transition-colors shadow-sm flex flex-col justify-between h-full group"
                  >
                    <div>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-1 block">{cap.category}</span>
                      <h4 className="text-sm font-space font-bold text-text-primary mb-2 group-hover:text-secondary-accent transition-colors">{cap.title}</h4>
                    </div>
                  </TrackedLink>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
