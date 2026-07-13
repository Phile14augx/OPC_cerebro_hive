"use client";

import React, { Suspense } from 'react';
import { ResearchHero } from '@/components/research/ResearchHero';
import { ResearchDomains } from '@/components/research/ResearchDomains';
import { BenchmarkDashboard } from '@/components/research/BenchmarkDashboard';
import { PublicationGrid } from '@/components/research/PublicationGrid';

// We wrap the grid in suspense because it uses useSearchParams
export default function ResearchLandingPage() {
  return (
    <div className="bg-background min-h-screen selection:bg-primary-accent/30 selection:text-black">
      
      {/* Editorial Hero with Metrics */}
      <ResearchHero />

      {/* 16 Domains Interactive Grid */}
      <ResearchDomains />

      {/* Methodology-First Benchmark Lab */}
      <BenchmarkDashboard />

      {/* Searchable Publication Library */}
      <Suspense fallback={<div className="py-24 text-center">Loading Library...</div>}>
        <PublicationGrid />
      </Suspense>

    </div>
  );
}
