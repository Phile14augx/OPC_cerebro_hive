"use client";

import React from "react";
import { motion } from "framer-motion";
import { PackagedProduct } from "@/lib/data/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Cable, Layers, Cpu, ArrowRight } from "lucide-react";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { platformCapabilities } from "@/lib/data/platform/capabilities";
import { services } from "@/lib/data/services";

export const ProductIntegrationEcosystem = ({ product }: { product: PackagedProduct }) => {
  const hasIntegrations = product.integrations && product.integrations.length > 0;
  const relatedCaps = platformCapabilities.filter(c => product.platformCapabilities.includes(c.id));
  const relatedServs = services.filter(s => product.relatedServices.includes(s.id));

  if (!hasIntegrations && relatedCaps.length === 0 && relatedServs.length === 0) return null;

  return (
    <section className="section-pad bg-surface-elevated border-b border-border">
      <div className="container-wide">
        <SectionHeading 
          label="Ecosystem" 
          title="Architecture & Integrations" 
          description="How this product fits into your enterprise environment."
        />

        <div className="mt-16 grid lg:grid-cols-3 gap-8">
          
          {/* Integrations Column */}
          {hasIntegrations && (
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <Cable size={20} className="text-secondary-accent" />
                <h3 className="text-lg font-space font-bold text-text-primary">Native Integrations</h3>
              </div>
              <ul className="flex flex-col gap-3">
                {product.integrations.map((int, i) => (
                  <li key={i} className="flex justify-between items-center p-4 bg-background border border-border rounded-lg shadow-sm">
                    <span className="font-bold text-text-primary text-sm">{int.system}</span>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted px-2 py-1 bg-surface rounded-full">{int.type}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Platform Dependencies */}
          {relatedCaps.length > 0 && (
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <Cpu size={20} className="text-[#00E5FF]" />
                <h3 className="text-lg font-space font-bold text-text-primary">Powered By</h3>
              </div>
              <div className="flex flex-col gap-3">
                {relatedCaps.map(cap => (
                  <TrackedLink 
                    key={cap.id} 
                    href={`/platform/${cap.slug}`}
                    analyticsEvent="product_ecosystem_click"
                    analyticsCategory="ecosystem"
                    analyticsLabel={cap.title}
                    className="p-4 bg-background border border-border rounded-lg shadow-sm hover:border-[#00E5FF]/40 transition-colors group flex justify-between items-center"
                  >
                    <div>
                      <span className="block text-[10px] font-bold tracking-widest uppercase text-text-muted mb-1">{cap.category}</span>
                      <span className="font-bold text-text-primary text-sm group-hover:text-[#00E5FF] transition-colors">{cap.title}</span>
                    </div>
                    <ArrowRight size={16} className="text-border group-hover:text-[#00E5FF] transition-colors" />
                  </TrackedLink>
                ))}
              </div>
            </div>
          )}

          {/* Related Services */}
          {relatedServs.length > 0 && (
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <Layers size={20} className="text-primary-accent" />
                <h3 className="text-lg font-space font-bold text-text-primary">Deployed Via</h3>
              </div>
              <div className="flex flex-col gap-3">
                {relatedServs.map(srv => (
                  <TrackedLink 
                    key={srv.id} 
                    href={`/services/${srv.slug}`}
                    analyticsEvent="product_ecosystem_click"
                    analyticsCategory="ecosystem"
                    analyticsLabel={srv.title}
                    className="p-4 bg-background border border-border rounded-lg shadow-sm hover:border-primary-accent/40 transition-colors group flex justify-between items-center"
                  >
                    <div>
                      <span className="block text-[10px] font-bold tracking-widest uppercase text-text-muted mb-1">Enterprise Service</span>
                      <span className="font-bold text-text-primary text-sm group-hover:text-primary-accent transition-colors">{srv.title}</span>
                    </div>
                    <ArrowRight size={16} className="text-border group-hover:text-primary-accent transition-colors" />
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
