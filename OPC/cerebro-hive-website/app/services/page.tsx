"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { ServiceMorphBackground } from "@/components/services/ServiceMorphBackground";
import { ArrowRight, Brain, Bot, Database, Code2, GraduationCap } from "lucide-react";
import { ExecutiveSummary } from "@/components/services/ExecutiveSummary";
import { BusinessOutcomesGrid } from "@/components/services/BusinessOutcomesGrid";
import { IndustryMapping } from "@/components/services/IndustryMapping";
import { InteractiveCapabilityMap } from "@/components/services/InteractiveCapabilityMap";
import { ConsultingCapabilityMatrix } from "@/components/services/ConsultingCapabilityMatrix";
import { TechStackShowcase } from "@/components/services/TechStackShowcase";
import { ConsultingProcessTimeline } from "@/components/services/ConsultingProcessTimeline";
import { ResearchInnovation } from "@/components/services/ResearchInnovation";
import { ServiceCardProgressive, ProgressiveServiceProps } from "@/components/services/ServiceCardProgressive";
import { ServiceAnimationProvider } from "@/components/services/ServiceAnimationContext";
import { services } from "@/lib/data/services";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { Stack } from "@/components/ui/primitives/Stack";

// Map the new data model to the existing progressive service props
const servicesData: ProgressiveServiceProps[] = services.map(s => ({
  id: s.slug,
  title: s.title,
  color: s.id === "ai-strategy" ? "#00E5FF" : s.id === "intelligence-modernization" ? "#FF8A00" : "#7B61FF",
  icon: Brain, // We use a default icon here, ideally we should import icons or map them dynamically
  problem: s.summary,
  outcome: s.deliverables.join(", "),
  methodology: s.engagementModel,
  link: `/services/${s.slug}`
}));

export default function ServicesPage() {
  const scrollContainerRef = useRef<HTMLElement>(null);

  return (
    <ServiceAnimationProvider>
      <div className="bg-background min-h-screen selection:bg-primary-accent/30 transition-colors duration-500">

      {/* Premium Hero Section */}
      <section ref={scrollContainerRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <ServiceMorphBackground scrollContainerRef={scrollContainerRef} />

        <PageContainer className="relative z-10 flex flex-col items-center text-center mt-20">
          <motion.div
            initial={{ opacity: 0.4, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl flex flex-col items-center w-full"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 backdrop-blur-sm shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Enterprise AI Consulting</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-space font-bold text-text-primary leading-[1.1] tracking-tight mb-6">
              Engineering Your <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#00F57A]">Intelligent Future</span>
            </h1>

            <p className="text-lg md:text-xl text-text-secondary font-inter max-w-2xl leading-relaxed mb-10">
              We help enterprises design AI strategy, build production-grade AI systems, automate operations, and create measurable business value—from executive vision to deployment.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
              <TrackedLink href="/contact" analyticsEvent="cta_click" analyticsCategory="conversion" analyticsLabel="Schedule AI Strategy Workshop — Services Hero" className="group relative">
                <div className="absolute inset-0 bg-primary-accent blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-300 rounded-lg" />
                <button className="relative px-8 py-4 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg flex items-center gap-3 transition-transform duration-300 group-hover:-translate-y-1">
                  Schedule an AI Strategy Workshop
                </button>
              </TrackedLink>
              <TrackedLink href="#capabilities" analyticsEvent="anchor_click" analyticsCategory="navigation" analyticsLabel="Explore Capabilities — Services Hero" className="px-8 py-4 bg-transparent border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg hover:border-primary-accent/50 hover:bg-surface-elevated transition-all duration-300">
                Explore Capabilities
              </TrackedLink>
            </div>
          </motion.div>
        </PageContainer>
      </section>

      {/* New Modular Sections Flow */}
      <ExecutiveSummary />
      <BusinessOutcomesGrid />
      <IndustryMapping />
      <InteractiveCapabilityMap />

      {/* Service Capabilities (Progressive Disclosure) */}
      <Section id="capabilities" size="default" className="bg-background relative z-10 scroll-mt-20">
        <PageContainer>
          <Stack gap="md" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-space font-bold text-text-primary">
              Core Consulting Capabilities
            </h2>
            <p className="text-lg text-text-secondary font-inter max-w-2xl mx-auto">
              Specialized practices combining deep domain expertise with world-class engineering execution.
            </p>
          </Stack>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {servicesData.map((service, index) => (
              <ServiceCardProgressive key={service.id} service={service} index={index} />
            ))}
          </div>
        </PageContainer>
      </Section>

      <TechStackShowcase />
      <ConsultingCapabilityMatrix />
      <ConsultingProcessTimeline />
      <ResearchInnovation />

      {/* Final Premium CTA Section */}
      <Section size="default" className="relative overflow-hidden bg-surface-elevated border-t border-border z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(128,128,128,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(128,128,128,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-elevated via-transparent to-surface-elevated" />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary-accent/10 blur-[120px] rounded-full pointer-events-none" />

        <PageContainer className="relative z-10">
          <motion.div
            initial={{ opacity: 0.4, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center flex flex-col items-center"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-space font-bold text-text-primary leading-tight mb-8">
              Ready to Architect Your <br className="hidden lg:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-[#00E5FF]">AI Transformation?</span>
            </h2>

            <p className="text-lg text-text-secondary font-inter max-w-[700px] mx-auto leading-relaxed mb-12">
              Speak with a Principal Solutions Architect today to discuss your enterprise requirements and explore our engagement models.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 mb-16">
              <TrackedLink href="/contact" analyticsEvent="cta_click" analyticsCategory="conversion" analyticsLabel="Request AI Maturity Assessment — Services CTA" className="group relative">
                <div className="absolute inset-0 bg-primary-accent blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-300 rounded-lg" />
                <button className="relative px-8 py-4 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg flex items-center gap-3 transition-transform duration-300 group-hover:-translate-y-1">
                  Request an AI Maturity Assessment
                  <ArrowRight size={16} />
                </button>
              </TrackedLink>
            </div>
          </motion.div>
        </PageContainer>
      </Section>
    </div>
    </ServiceAnimationProvider>
  );
}
