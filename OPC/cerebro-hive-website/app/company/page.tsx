import React, { Suspense } from 'react';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { CompanySidebar } from '@/components/company/navigation/CompanySidebar';
import { ForceDarkTheme } from '@/components/company/ForceDarkTheme';

// Load immediately (Above the fold & critical content)
import { CompanyHero } from '@/components/company/hero/CompanyHero';
import { VisionMission } from '@/components/company/story/VisionMission';

// Lazy load heavy components
const CompanyStoryTimeline = dynamic(() => import('@/components/company/story/CompanyStoryTimeline').then(mod => mod.CompanyStoryTimeline), { 
  loading: () => <div className="h-96 flex items-center justify-center text-text-muted">Loading Timeline...</div> 
});
const CoreValuesBento = dynamic(() => import('@/components/company/story/CoreValuesBento').then(mod => mod.CoreValuesBento));
const LeadershipGrid = dynamic(() => import('@/components/company/leadership/LeadershipGrid').then(mod => mod.LeadershipGrid));
import { OrganizationChartWrapper } from '@/components/company/leadership/OrganizationChartWrapper';
const CompanyMetrics = dynamic(() => import('@/components/company/culture/CompanyMetrics').then(mod => mod.CompanyMetrics));
const GlobalPresenceMap = dynamic(() => import('@/components/company/ecosystem/GlobalPresenceMap').then(mod => mod.GlobalPresenceMap));
const EcosystemGrid = dynamic(() => import('@/components/company/ecosystem/EcosystemGrid').then(mod => mod.EcosystemGrid));
const Certifications = dynamic(() => import('@/components/company/ecosystem/Certifications').then(mod => mod.Certifications));
const EngineeringCulture = dynamic(() => import('@/components/company/culture/EngineeringCulture').then(mod => mod.EngineeringCulture));
const Headquarters = dynamic(() => import('@/components/company/contact/Headquarters').then(mod => mod.Headquarters));
const CareersPreview = dynamic(() => import('@/components/company/contact/CareersPreview').then(mod => mod.CareersPreview));
const CTA = dynamic(() => import('@/components/company/contact/CTA').then(mod => mod.CTA));

export const metadata: Metadata = {
  title: 'Company Headquarters | CerebroHive',
  description: 'The definitive AI-native enterprise transformation partner. Explore our vision, leadership, and global presence.',
};



export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-background relative selection:bg-primary-accent/30 selection:text-white">
      <ForceDarkTheme />
      <div id="hero">
        <CompanyHero />
      </div>
      
      <div className="flex">
        {/* Sidebar Navigation */}
        <CompanySidebar />
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div id="vision">
            <VisionMission />
          </div>

          <div id="story">
            <CompanyStoryTimeline />
          </div>

          <div id="culture">
            <EngineeringCulture />
            <CoreValuesBento />
          </div>

          <div id="leadership">
            <LeadershipGrid />
          </div>

          <div id="org-chart" className="py-24 md:py-32 bg-background border-t border-border">
            <div className="container-wide">
              <div className="max-w-3xl mb-12">
                <h2 className="text-sm font-space font-bold tracking-widest uppercase text-text-muted mb-4">
                  Organizational Architecture
                </h2>
                <h3 className="text-4xl md:text-5xl font-space font-bold text-text-primary tracking-tight">
                  Designed for Scale.
                </h3>
              </div>
              <OrganizationChartWrapper />
            </div>
          </div>

          <div id="metrics">
            <CompanyMetrics />
          </div>

          <div id="ecosystem">
            <EcosystemGrid />
            <Certifications />
          </div>

          <div id="presence">
            <GlobalPresenceMap />
            <Headquarters />
            <CareersPreview />
          </div>
          
          <CTA />
        </div>
      </div>

    </div>
  );
}
