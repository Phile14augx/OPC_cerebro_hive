'use client';
import React from 'react';
import { useExecutiveStore } from '@/src/store/trust/useExecutiveStore';
import { Shield, ShieldCheck, Activity, Scale, Server, FileText, Bell, AlertTriangle } from 'lucide-react';

export function ExecutiveScorecard() {
  const { metrics, isLoading } = useExecutiveStore();

  if (isLoading || !metrics) {
    return <div className="h-48 border border-border bg-muted/10 animate-pulse rounded-lg" />;
  }

  const kpis = [
    { label: 'Security', value: metrics.securityScore, icon: Shield, color: 'text-emerald-500' },
    { label: 'Compliance', value: metrics.complianceScore, icon: ShieldCheck, color: 'text-blue-500' },
    { label: 'Governance', value: metrics.governanceScore, icon: FileText, color: 'text-purple-500' },
    { label: 'Reliability', value: metrics.reliabilityScore, icon: Server, color: 'text-blue-400' },
    { label: 'AI Safety', value: metrics.aiSafetyScore, icon: Scale, color: 'text-amber-500' },
    { label: 'Privacy', value: metrics.privacyScore, icon: Shield, color: 'text-cyan-500' },
    { label: 'Operations', value: metrics.operationsScore, icon: Activity, color: 'text-emerald-400' },
  ];

  return (
    <div className="bg-muted/5 border border-border rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Overall Trust Index</h2>
          <div className="text-5xl font-bold mt-2 text-primary">{metrics.overallScore}%</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Availability</div>
          <div className="text-2xl font-mono text-emerald-500">{metrics.availabilityScore}%</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="flex flex-col space-y-2 p-3 bg-background border border-border rounded-md hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between">
              <kpi.icon size={16} className={kpi.color} />
              <span className="text-lg font-bold">{kpi.value}%</span>
            </div>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{kpi.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
