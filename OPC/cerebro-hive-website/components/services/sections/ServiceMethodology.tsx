"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { EnterpriseService } from "@/lib/data/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { cardVariants } from "@/components/ui/primitives/Card";

export const ServiceMethodology = ({ service }: { service: EnterpriseService }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <Section size="default" className="bg-background border-b border-border">
      <div ref={containerRef}>
        <PageContainer size="narrow">
          <SectionHeading
            label="Methodology & Timeline"
            title="Execution Roadmap"
            description={service.methodologyOverview}
          />

          <div className="mt-20 relative">
            {/* Vertical Progress Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 hidden md:block" />
            <motion.div
              className="absolute left-8 md:left-1/2 top-0 w-1 bg-primary-accent -translate-x-1/2 hidden md:block origin-top rounded-full"
              style={{ height: lineHeight }}
            />

            <div className="flex flex-col gap-12 md:gap-24">
              {service.timeline.map((phase, i) => {
                const isEven = i % 2 === 0;
                return (
                  <div key={i} className="relative flex flex-col md:flex-row items-center justify-between group">

                    {/* Timeline Node */}
                    <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-background border-2 border-border group-hover:border-primary-accent group-hover:bg-primary-accent/20 transition-colors -translate-x-1/2 z-10 hidden md:block" />

                    {/* Left Side (Empty on Odd, Content on Even) */}
                    <div className={`w-full md:w-5/12 ${isEven ? "md:text-right md:pr-12" : "md:order-last md:text-left md:pl-12"}`}>
                      <motion.div
                        initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5 }}
                        className={cn(cardVariants({ size: "lg" }), "shadow-sm hover:shadow-md transition-shadow relative")}
                      >
                        <span className="inline-block px-3 py-1 bg-background border border-border rounded-full text-[10px] font-bold tracking-widest uppercase text-primary-accent mb-4">
                          {phase.duration}
                        </span>
                        <h4 className="text-xl font-space font-bold text-text-primary mb-4">{phase.title}</h4>
                        <ul className={`flex flex-col gap-2 ${isEven ? "md:items-end" : "md:items-start"}`}>
                          {phase.activities.map((act, j) => (
                            <li key={j} className="flex items-center gap-2 text-sm text-text-secondary">
                              <span className="w-1.5 h-1.5 rounded-full bg-border" />
                              {act}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    </div>

                    {/* Spacer for the other side */}
                    <div className="hidden md:block w-5/12" />
                  </div>
                );
              })}
            </div>
          </div>
        </PageContainer>
      </div>
    </Section>
  );
};
