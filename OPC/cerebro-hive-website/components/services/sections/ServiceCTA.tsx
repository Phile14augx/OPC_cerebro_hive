"use client";

import React from "react";
import { motion } from "framer-motion";
import { EnterpriseService } from "@/lib/data/types";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";

export const ServiceCTA = ({ service }: { service: EnterpriseService }) => {
  return (
    <Section size="default" className="bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-primary-accent/5 pointer-events-none" />

      <PageContainer size="narrow" className="text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[10px] font-bold tracking-widest uppercase text-primary-accent mb-4 block">Next Steps</span>
          <h2 className="text-4xl md:text-5xl font-space font-bold text-text-primary mb-6">
            Ready to initiate your <br className="hidden md:block" />
            <span className="text-primary-accent">{service.title}</span>?
          </h2>
          <p className="text-text-secondary mb-10 max-w-xl mx-auto font-inter text-center">
            Schedule a strategy session with our principal architects to discuss your specific business context and evaluate the ROI of this engagement.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <TrackedLink href="/contact" analyticsEvent="cta_click" analyticsCategory="service_cta" analyticsLabel="Book Strategy Session">
              <AnimatedButton variant="primary" size="lg">
                Book Strategy Session
              </AnimatedButton>
            </TrackedLink>
          </div>
        </motion.div>
      </PageContainer>
    </Section>
  );
};
