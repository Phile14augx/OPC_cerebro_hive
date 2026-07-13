import React, { Suspense } from 'react';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CompanySidebar } from '@/components/company/navigation/CompanySidebar';

// Load immediately (Above the fold & critical content)
import { CompanyHero } from '@/components/company/hero/CompanyHero';
import { CEOMessage } from '@/components/company/leadership/CEOMessage';
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

// Mock nodes for Org Chart
const orgNodes = [
  { id: '1', data: { label: 'Philemon V Nath', subtitle: 'Chief Executive Officer', type: 'executive', hasTeams: false } },
  { id: '2', data: { label: 'Engineering & Architecture', subtitle: 'Marcus Thorne, CTO', type: 'engineering', hasTeams: true } },
  { id: '3', data: { label: 'CerebroHive Labs', subtitle: 'Elena Rodriguez, VP', type: 'research', hasTeams: true } },
  { id: '4', data: { label: 'Consulting & Delivery', subtitle: 'David Kim, Head of AI', type: 'operations', hasTeams: true } },
  { id: '5', data: { label: 'Business Strategy', type: 'business', hasTeams: true } },
];
const orgEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
  { id: 'e1-4', source: '1', target: '4' },
  { id: 'e1-5', source: '1', target: '5' },
];

export default function CompanyPage() {
  return (
    <main className="min-h-screen bg-background relative selection:bg-primary-accent/30 selection:text-white">
      <Navbar />

      <div id="hero">
        <CompanyHero />
      </div>
      
      <div className="flex">
        {/* Sidebar Navigation */}
        <CompanySidebar />
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div id="ceo-letter">
            <CEOMessage />
          </div>

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
              <OrganizationChartWrapper initialNodes={orgNodes} initialEdges={orgEdges} />
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

      <Footer />
    </main>
  );
}
