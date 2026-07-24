'use client';

import React from 'react';
import { ExecutiveScorecard } from '@/components/trust/ExecutiveScorecard';
import { SecurityPosturePanel } from '@/components/trust/SecurityPosturePanel';
import { ComplianceScorecard } from '@/components/trust/ComplianceScorecard';
import { ProviderHealthPanel } from '@/components/trust/ProviderHealthPanel';
import { RiskHeatmap } from '@/components/trust/RiskHeatmap';
import { AuditTimeline } from '@/components/trust/AuditTimeline';

export default function TrustDashboard() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Enterprise Trust & Governance</h1>
        <p className="text-muted-foreground">Live operational view of security, compliance, and AI safety.</p>
      </div>
      
      <ExecutiveScorecard />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <SecurityPosturePanel />
          <RiskHeatmap />
          <ProviderHealthPanel />
        </div>
        
        <div className="space-y-8">
          <ComplianceScorecard />
          <AuditTimeline />
        </div>
      </div>
    </div>
  );
}
