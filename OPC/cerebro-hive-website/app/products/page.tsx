"use client";

import React from 'react';
import { PlatformHero } from '@/components/products/v2/PlatformHero';
import { PlatformArchitecture } from '@/components/products/v2/PlatformArchitecture';
import { PlatformDashboardPreview } from '@/components/products/v2/PlatformDashboardPreview';
import { PlatformExplorer } from '@/components/products/v2/PlatformExplorer';
import { AgentGallery } from '@/components/products/v2/AgentGallery';
import { PlatformActionDemo } from '@/components/products/v2/PlatformActionDemo';
import { EnterpriseIntegrations } from '@/components/products/v2/EnterpriseIntegrations';
import { MethodologyVisualizer } from '@/components/products/v2/MethodologyVisualizer';
import { EnterpriseTrust } from '@/components/products/v2/EnterpriseTrust';
import { ArchitectureStudio } from '@/components/products/v2/ArchitectureStudio';
import { PlatformCTA } from '@/components/products/v2/PlatformCTA';

export default function ProductsLandingPage() {
  return (
    <div className="bg-background min-h-screen selection:bg-primary-accent/30 selection:text-black">
      
      {/* 1. What the platform is */}
      <PlatformHero />

      {/* 2. How products relate */}
      <PlatformArchitecture />

      {/* 3. Proof of scale */}
      <PlatformDashboardPreview />

      {/* 4. The underlying products (Technical vs Business) */}
      <PlatformExplorer />

      {/* 5. Business Use Cases (Agent Gallery) */}
      <AgentGallery />

      {/* 6. Platform in Action (Workflow simulation) */}
      <PlatformActionDemo />

      {/* 7. How it integrates */}
      <EnterpriseIntegrations />

      {/* 8. How it's delivered (Methodology) */}
      <MethodologyVisualizer />

      {/* 9. Why it's trustworthy */}
      <EnterpriseTrust />

      {/* 10. How it fits your organization */}
      <ArchitectureStudio />

      {/* CTA */}
      <PlatformCTA />

    </div>
  );
}
