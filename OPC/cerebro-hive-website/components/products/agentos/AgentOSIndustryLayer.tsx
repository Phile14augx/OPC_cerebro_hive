"use client";

import React from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { industrySolutionLayer } from "@/lib/data/products/agentos-pyramid";

export const AgentOSIndustryLayer = () => {
  return (
    <section className="section-pad border-b border-border bg-surface-elevated">
      <div className="container-wide">
        <SectionHeading
          label="Industry Solution Layer"
          title="One platform. Every industry."
          description="This is where AgentOS becomes a business platform, not just an AI framework — the same runtime ships pre-configured solution packs per industry."
        />

        <div className="grid md:grid-cols-2 gap-4 mt-16">
          {industrySolutionLayer.map((row) => (
            <div key={row.industry} className="bg-surface border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6">
              <div className="text-sm font-space font-bold text-text-primary sm:w-36 shrink-0">{row.industry}</div>
              <div className="flex flex-wrap gap-2">
                {row.systems.map((sys) => (
                  <span key={sys} className="px-2.5 py-1 bg-background border border-border rounded text-xs text-text-secondary">
                    {sys}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
