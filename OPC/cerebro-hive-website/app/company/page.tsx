import React from 'react';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { CompanySidebarV3 } from '@/components/company/v3/CompanySidebarV3';

// Load Hero Immediately
import CompanyHero from '@/components/company/v3/CompanyHero';

// Chapter 1
const OriginStory = dynamic(() => import('@/components/company/v3/OriginStory'));
const EnterpriseManifesto = dynamic(() => import('@/components/company/v3/EnterpriseManifesto'));

// Chapter 2
const OperatingPhilosophy = dynamic(() => import('@/components/company/v3/OperatingPhilosophy'));
const EngineeringPrinciples = dynamic(() => import('@/components/company/v3/EngineeringPrinciples'));
const HowWeThink = dynamic(() => import('@/components/company/v3/HowWeThink'));
const InnovationFlywheel = dynamic(() => import('@/components/company/v3/InnovationFlywheel'));

// Chapter 3
const WhyCerebroHive = dynamic(() => import('@/components/company/v3/WhyCerebroHive'));
const EngineeringCulture = dynamic(() => import('@/components/company/v3/EngineeringCulture'));
const ResponsibleAI = dynamic(() => import('@/components/company/v3/ResponsibleAI'));
const EnterpriseProof = dynamic(() => import('@/components/company/v3/EnterpriseProof'));

// Chapter 4
const FounderPerspective = dynamic(() => import('@/components/company/v3/FounderPerspective'));
const TeamExpertise = dynamic(() => import('@/components/company/v3/TeamExpertise'));

// Chapter 5
const LivingTimeline = dynamic(() => import('@/components/company/v3/LivingTimeline'));
const CompanyRoadmap = dynamic(() => import('@/components/company/v3/CompanyRoadmap'));
const GlobalOperatingModel = dynamic(() => import('@/components/company/v3/GlobalOperatingModel'));

// Chapter 6
const CompanyCTA = dynamic(() => import('@/components/company/v3/CompanyCTA'));

export const metadata: Metadata = {
  title: 'Company | CerebroHive',
  description: 'We combine applied AI research, enterprise architecture, engineering discipline, and production platforms to help organizations become AI-native.',
};

export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-background relative selection:bg-primary-accent/30 selection:text-text-primary">
      <CompanyHero />
      
      <div className="flex">
        {/* Sticky Sidebar Navigation */}
        <CompanySidebarV3 />
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          
          <div id="chapter-1" className="scroll-mt-24">
            <OriginStory />
            <EnterpriseManifesto />
          </div>

          <div id="chapter-2" className="scroll-mt-24">
            <OperatingPhilosophy />
            <EngineeringPrinciples />
            <HowWeThink />
            <InnovationFlywheel />
          </div>

          <div id="chapter-3" className="scroll-mt-24">
            <WhyCerebroHive />
            <EngineeringCulture />
            <ResponsibleAI />
            <EnterpriseProof />
          </div>

          <div id="chapter-4" className="scroll-mt-24">
            <FounderPerspective />
            <TeamExpertise />
          </div>

          <div id="chapter-5" className="scroll-mt-24">
            <LivingTimeline />
            <CompanyRoadmap />
            <GlobalOperatingModel />
          </div>
          
          <div id="chapter-6" className="scroll-mt-24">
            <CompanyCTA />
          </div>

        </div>
      </div>

    </div>
  );
}
