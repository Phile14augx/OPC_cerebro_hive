"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { architectureStackBands } from "@/lib/data/products/agentos-pyramid";

export const AgentOSArchitectureStack = () => {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="section-pad border-b border-border bg-background">
      <div className="container-wide">
        <SectionHeading
          label="Full-Stack Blueprint"
          title="Not a framework. A platform."
          description="A 10/10 agentic OS doesn't compete with a single agent framework — it competes with enterprise application platforms, end to end."
        />

        <div className="max-w-3xl mx-auto mt-16 flex flex-col rounded-2xl overflow-hidden border border-border shadow-2xl">
          {architectureStackBands.map((band, i) => {
            const isHovered = hovered === band.id;
            return (
              <motion.div
                key={band.id}
                onMouseEnter={() => setHovered(band.id)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  "px-6 py-5 flex items-center justify-between border-b border-border last:border-b-0 transition-colors cursor-default",
                  isHovered ? "bg-primary-accent/10" : i % 2 === 0 ? "bg-surface" : "bg-surface-elevated"
                )}
              >
                <span className={cn("text-sm md:text-base font-space font-bold transition-colors", isHovered ? "text-primary-accent" : "text-text-primary")}>
                  {band.label}
                </span>
                <span className="text-[10px] font-mono text-text-muted">L{architectureStackBands.length - i}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
