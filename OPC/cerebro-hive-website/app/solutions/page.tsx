"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { InteractiveSolutionExplorer } from "@/components/solutions/InteractiveSolutionExplorer";
import { ROICalculator } from "@/components/solutions/ROICalculator";

// New Components
import { EnterpriseAIOperatingSystem } from "@/components/solutions/EnterpriseAIOperatingSystem";
import { ExecutivePriorities } from "@/components/solutions/ExecutivePriorities";
import { AITransformationJourney } from "@/components/solutions/AITransformationJourney";
import { SolutionConfigurator } from "@/components/solutions/SolutionConfigurator";
import { BusinessFunctionMap } from "@/components/solutions/BusinessFunctionMap";
import { EnterpriseArchitecture } from "@/components/solutions/EnterpriseArchitecture";
import { ResearchLayer } from "@/components/solutions/ResearchLayer";
import { ReadinessAssessment } from "@/components/solutions/ReadinessAssessment";
import { TrustSection } from "@/components/solutions/TrustSection";
import { ExecutiveResources } from "@/components/solutions/ExecutiveResources";

export default function SolutionsIndexPage() {
  return (
    <div className="bg-background min-h-screen selection:bg-primary-accent/30 font-inter">

      {/* 1. Hero: The Enterprise AI Challenge -> Transformation */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden border-b border-border pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(0,245,122,0.06),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] dark:block hidden" style={{ backgroundSize: '48px 48px' }} />
        
        <motion.div initial={{ opacity: 0.4, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="container-wide flex flex-col items-center text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-8 backdrop-blur-sm">
            <span className="text-[10px] font-bold tracking-widest uppercase text-red-500/80">The Enterprise AI Challenge</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-space font-bold text-text-primary leading-[1.1] tracking-tight mb-6 max-w-5xl">
            Why are enterprises struggling <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-text-muted to-text-secondary">with AI today?</span>
          </h1>
          
          <p className="text-lg md:text-xl text-text-secondary max-w-3xl leading-relaxed mb-10">
            Most organizations adopt AI as isolated experiments—resulting in fragmented knowledge, security risks, and unscalable tools. We engineer <strong className="text-text-primary">Enterprise AI Transformation</strong>, moving you from manual workflows to a unified, autonomous ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#operating-system" className="px-8 py-4 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 hover:-translate-y-0.5 transition-transform shadow-elevated">
              See The Architecture <ArrowRight size={16} />
            </a>
            <TrackedLink href="/contact" analyticsEvent="cta_click" analyticsCategory="conversion" analyticsLabel="Book Strategy Workshop — Solutions Hero" className="px-8 py-4 bg-surface border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-xl hover:border-primary-accent/40 hover:bg-surface-elevated transition-all flex items-center justify-center">
              Book Strategy Workshop
            </TrackedLink>
          </div>

        </motion.div>

        {/* Scroll Indicator */}
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted">
          <span className="text-[10px] uppercase tracking-widest">Discover</span>
          <div className="w-px h-8 bg-gradient-to-b from-text-muted to-transparent" />
        </motion.div>
      </section>

      {/* 2. Business Outcomes / Executive Priorities */}
      <ExecutivePriorities />

      {/* 3. Enterprise AI Operating System (Simplified) */}
      <div id="operating-system">
        <EnterpriseAIOperatingSystem />
      </div>

      {/* 4. Transformation Journey (Current vs Future) */}
      <AITransformationJourney />

      {/* 5. Business Function Map */}
      <BusinessFunctionMap />

      {/* 6. Industry Solution Explorer */}
      <InteractiveSolutionExplorer />

      {/* 7. Solution Configurator */}
      <SolutionConfigurator />

      {/* 8. Enterprise Architecture */}
      <EnterpriseArchitecture />

      {/* 9. Research Layer */}
      <ResearchLayer />

      {/* 10. ROI Calculator */}
      <ROICalculator />

      {/* 11. Readiness Assessment */}
      <ReadinessAssessment />

      {/* 12. Trust Section */}
      <TrustSection />

      {/* 13. Executive Resources */}
      <ExecutiveResources />

      {/* Final CTA */}
      <section className="section-pad bg-background">
        <div className="container-wide max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-space font-bold text-text-primary mb-4">Start Your Transformation</h2>
          <p className="text-text-secondary mb-8 text-lg">Our principal architects will assess your enterprise and map a risk-mitigated journey to AI autonomy in a complimentary 45-minute workshop.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <TrackedLink href="/contact" analyticsEvent="cta_click" analyticsCategory="conversion" analyticsLabel="Schedule Strategy Workshop — Solutions CTA" className="px-8 py-4 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 hover:-translate-y-0.5 transition-transform shadow-elevated">
              Schedule Strategy Workshop <ArrowRight size={16} />
            </TrackedLink>
          </div>
        </div>
      </section>

    </div>
  );
}
