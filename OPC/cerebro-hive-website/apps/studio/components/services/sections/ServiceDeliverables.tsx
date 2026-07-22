"use client";

import React from "react";
import { motion } from "framer-motion";
import { EnterpriseService } from "@/lib/data/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CheckCircle2, Box } from "lucide-react";
import { cn } from "@/lib/utils";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { cardVariants } from "@/components/ui/primitives/Card";

export const ServiceDeliverables = ({ service }: { service: EnterpriseService }) => {
  return (
    <Section size="default" className="bg-surface border-b border-border">
      <PageContainer>
        <SectionHeading
          label="Outcomes"
          title="Tangible Deliverables"
          description="What you receive at the conclusion of this engagement."
        />

        <div className="mt-16 grid md:grid-cols-2 gap-8 lg:gap-12">

          {/* Deliverables List */}
          <div className="flex flex-col gap-4">
            {service.deliverables.map((deliverable, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-start gap-4 p-5 bg-background border border-border rounded-xl hover:border-primary-accent/40 transition-colors shadow-sm"
              >
                <CheckCircle2 size={24} className="text-primary-accent shrink-0 mt-0.5" />
                <span className="text-base font-medium text-text-primary">{deliverable}</span>
              </motion.div>
            ))}
          </div>

          {/* Commercial Model Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={cn(cardVariants({ size: "lg" }), "bg-gradient-to-br from-surface-elevated to-background flex flex-col shadow-md")}
          >
            <div className="w-12 h-12 rounded-xl bg-primary-accent/10 flex items-center justify-center text-primary-accent mb-6">
              <Box size={24} />
            </div>
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-2">Commercial Model</h4>
            <h3 className="text-2xl font-space font-bold text-text-primary mb-4">{service.engagementModel}</h3>

            {service.pricing && (
              <div className="mt-auto pt-6 border-t border-border">
                <p className="text-sm text-text-secondary leading-relaxed mb-4">
                  {service.pricing.description}
                </p>
                {service.pricing.startingAt && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted font-medium">Starting at:</span>
                    <span className="text-lg font-mono font-bold text-text-primary">{service.pricing.startingAt}</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>

        </div>
      </PageContainer>
    </Section>
  );
};
