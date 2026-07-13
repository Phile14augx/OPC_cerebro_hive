"use client";

import React from 'react';
import { HeroEcosystem } from '@/components/products/HeroEcosystem';
import { SoftwarePlatformsBento } from '@/components/products/SoftwarePlatformsBento';
import { FrameworkExplorer } from '@/components/products/FrameworkExplorer';

export default function ProductsLandingPage() {
  return (
    <div className="bg-background min-h-screen selection:bg-primary-accent/30 selection:text-black">
      
      {/* Level 1 Cinematic SVG Hero */}
      <HeroEcosystem />

      {/* Enterprise Software Platforms (Bento Grid) */}
      <SoftwarePlatformsBento />

      {/* Proprietary IP / Frameworks */}
      <FrameworkExplorer />

    </div>
  );
}
