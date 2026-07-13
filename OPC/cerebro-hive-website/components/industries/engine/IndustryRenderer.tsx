"use client";

import React, { useEffect, useState } from 'react';
import { Industry } from '@/lib/data/industries/types';
import { motion, AnimatePresence } from 'framer-motion';

// We will import these as we build them
import { IndustryHero } from './IndustryHero';
import { AnimatedIndustryBackground } from './AnimatedIndustryBackground';
import { IndustryTopology } from './IndustryTopology';
import { Metrics } from './Metrics';
import { ChallengeExplorer } from './ChallengeExplorer';
import { SolutionExplorer } from './SolutionExplorer';
import { AgentEcosystem } from './AgentEcosystem';
// import { CapabilityMatrix } from './CapabilityMatrix';
import { ArchitectureViewer } from './ArchitectureViewer';
import { IndustryERPIntegration } from './IndustryERPIntegration';
import { ComplianceCenter } from './ComplianceCenter';
import { TransformationJourney } from './TransformationJourney';
// import { ProductsSection } from './ProductsSection';
// import { ResearchSection } from './ResearchSection';
// import { CaseStudies } from './CaseStudies';
// import { CTASection } from './CTASection';

export function IndustryRenderer({ industry }: { industry: Industry }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden selection:bg-primary-accent/30 transition-colors duration-700">
      
      {/* 
        This will be our unified background that changes modes based on industry.engineConfig.backgroundAnimation 
      */}
      <AnimatedIndustryBackground config={industry.engineConfig} />

      <div className="relative z-10 flex flex-col w-full">
        <div className="relative w-full min-h-screen">
          <IndustryHero hero={industry.hero} config={industry.engineConfig} />
          <IndustryTopology segments={industry.segments} config={industry.engineConfig} />
        </div>
        <Metrics overview={industry.overview} config={industry.engineConfig} />
        <ChallengeExplorer challenges={industry.challenges} config={industry.engineConfig} />
        <SolutionExplorer matrix={industry.opportunityMatrix} config={industry.engineConfig} />
        <AgentEcosystem agents={industry.agents} config={industry.engineConfig} />
        <ArchitectureViewer architecture={industry.architecture} config={industry.engineConfig} />
        <IndustryERPIntegration erp={industry.erpIntegration} config={industry.engineConfig} />
        {/* <ProductsSection products={industry.relatedProducts} /> */}
        {/* <ResearchSection resources={industry.resources} /> */}
        {/* <CaseStudies study={industry.caseStudy} /> */}
        <ComplianceCenter compliance={industry.compliance} />
        <TransformationJourney roadmap={industry.roadmap} config={industry.engineConfig} />
        {/* <CTASection config={industry.engineConfig} /> */}
      </div>

    </div>
  );
}
