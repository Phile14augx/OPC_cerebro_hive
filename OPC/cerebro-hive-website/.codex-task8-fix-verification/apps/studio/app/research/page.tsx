"use client";

import React from 'react';
import { ResearchHero } from '@/components/research/v2/ResearchHero';
import { ResearchStats } from '@/components/research/v2/ResearchStats';
import { ResearchConstellation } from '@/components/research/v2/ResearchConstellation';
import { FeaturedResearch } from '@/components/research/v2/FeaturedResearch';
import { ResearchExplorer } from '@/components/research/v2/ResearchExplorer';
import { BenchmarkLab } from '@/components/research/v2/BenchmarkLab';
import { ExperimentGallery } from '@/components/research/v2/ExperimentGallery';
import { KnowledgeGraphView } from '@/components/research/v2/KnowledgeGraphView';
import { ResearchTimeline } from '@/components/research/v2/ResearchTimeline';
import { ResearchToProductBridge } from '@/components/research/v2/ResearchToProductBridge';
import { IndustryResearch } from '@/components/research/v2/IndustryResearch';
import { OpenSourceProjects } from '@/components/research/v2/OpenSourceProjects';
import { DeveloperResources } from '@/components/research/v2/DeveloperResources';
import { ResearchRoadmap } from '@/components/research/v2/ResearchRoadmap';
import { ResearchTeam } from '@/components/research/v2/ResearchTeam';
import { ResearchAssistant } from '@/components/research/v2/ResearchAssistant';

export default function ResearchLandingPage() {
  return (
    <div className="bg-background min-h-screen selection:bg-[#00E5FF]/30 selection:text-text-primary">
      
      <ResearchHero />
      <ResearchStats />
      
      {/* Foundational / Applied / Production */}
      <ResearchConstellation />
      
      {/* Featured Editorial */}
      <FeaturedResearch />
      
      {/* Persona-based explorer */}
      <ResearchExplorer />
      
      {/* Enterprise Task Benchmarks */}
      <BenchmarkLab />
      
      {/* Methodology & Limitations */}
      <ExperimentGallery />
      
      {/* Signature Knowledge Graph */}
      <KnowledgeGraphView />
      
      {/* Dual-track timeline */}
      <ResearchTimeline />
      
      {/* Research -> Product Translation */}
      <ResearchToProductBridge />
      
      {/* Industry context */}
      <IndustryResearch />
      
      {/* Developer ecosystem */}
      <OpenSourceProjects />
      <DeveloperResources />
      
      {/* Future vision */}
      <ResearchRoadmap />
      
      {/* Credibility / Authors */}
      <ResearchTeam />
      
      {/* AI Copilot floating or embedded */}
      <ResearchAssistant />
      
    </div>
  );
}
