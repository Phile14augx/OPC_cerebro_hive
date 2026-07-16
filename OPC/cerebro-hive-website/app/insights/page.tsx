"use client";

import React from 'react';
import { InsightsHero } from '@/components/insights/v2/InsightsHero';
import { ExecutiveDashboard } from '@/components/insights/v2/ExecutiveDashboard';
import { WeeklyBrief } from '@/components/insights/v2/WeeklyBrief';
import { FeaturedIntelligence } from '@/components/insights/v2/FeaturedIntelligence';
import { TrendRadar } from '@/components/insights/v2/TrendRadar';
import { TechnologyLandscape } from '@/components/insights/v2/TechnologyLandscape';
import { IndustryIntelligence } from '@/components/insights/v2/IndustryIntelligence';
import { MarketWatch } from '@/components/insights/v2/MarketWatch';
import { ExecutiveDecisionCenter } from '@/components/insights/v2/ExecutiveDecisionCenter';
import { StrategyCanvas } from '@/components/insights/v2/StrategyCanvas';
import { InteractiveReports } from '@/components/insights/v2/InteractiveReports';
import { OpinionAnalysis } from '@/components/insights/v2/OpinionAnalysis';
import { InsightsExplorer } from '@/components/insights/v2/InsightsExplorer';
import { NewsletterCTA } from '@/components/insights/v2/NewsletterCTA';
import { InsightsAssistant } from '@/components/insights/v2/InsightsAssistant';

export default function InsightsLandingPage() {
  return (
    <div className="bg-background min-h-screen selection:bg-[#00E5FF]/30 selection:text-white">
      
      <InsightsHero />
      <ExecutiveDashboard />
      <WeeklyBrief />
      <FeaturedIntelligence />
      <TrendRadar />
      <TechnologyLandscape />
      <IndustryIntelligence />
      <MarketWatch />
      <ExecutiveDecisionCenter />
      <StrategyCanvas />
      <InteractiveReports />
      <OpinionAnalysis />
      <InsightsExplorer />
      <NewsletterCTA />
      
      {/* Floating Copilot */}
      <InsightsAssistant />
      
    </div>
  );
}
