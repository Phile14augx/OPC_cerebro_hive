"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { EnterpriseService } from "@/lib/data/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AlertTriangle, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { cardVariants } from "@/components/ui/primitives/Card";

export const ServiceBusinessChallenges = ({ service }: { service: EnterpriseService }) => {
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <Section size="default" className="bg-surface border-b border-border">
      <PageContainer>

        {/* Executive Summary Block */}
        <div className="max-w-4xl mb-24">
          <SectionHeading
            label="Executive Summary"
            title="The Cost of Inaction"
            align="left"
          />
          <div className="mt-8 grid md:grid-cols-2 gap-8">
            <div className="p-6 bg-background border-l-4 border-l-[#FF453A] border-y border-r border-y-border border-r-border rounded-r-xl shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-[#FF453A]">
                <AlertTriangle size={20} />
                <h4 className="font-space font-bold uppercase tracking-widest text-xs">The Problem</h4>
              </div>
              <p className="text-text-secondary leading-relaxed font-inter">
                {service.executiveProblem}
              </p>
            </div>
            <div className="p-6 bg-background border-l-4 border-l-[#FF8A00] border-y border-r border-y-border border-r-border rounded-r-xl shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-[#FF8A00]">
                <TrendingDown size={20} />
                <h4 className="font-space font-bold uppercase tracking-widest text-xs">Business Impact</h4>
              </div>
              <p className="text-text-secondary leading-relaxed font-inter">
                {service.businessImpact}
              </p>
            </div>
          </div>
        </div>

        {/* Specific Challenges */}
        <div ref={containerRef}>
          <SectionHeading
            label="Current State"
            title="Common Enterprise Frictions"
            description="The systemic issues this engagement resolves."
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16"
          >
            {service.businessChallenges.map((challenge, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className={cn(cardVariants({ size: "lg" }), "bg-surface-elevated shadow-sm hover:border-primary-accent/30 transition-colors")}
              >
                <div className="text-4xl font-space font-black text-border mb-6">0{i + 1}</div>
                <h4 className="text-xl font-space font-bold text-text-primary mb-4">{challenge.title}</h4>
                <p className="text-text-secondary leading-relaxed text-sm">{challenge.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </PageContainer>
    </Section>
  );
};
